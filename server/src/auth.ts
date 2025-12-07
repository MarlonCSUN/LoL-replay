import bcrypt from 'bcryptjs';
import { prisma } from './db.js';
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const SESSION_TTL_HOURS = 168; // 7 days

// ------------------------------------------------------------
// PASSWORD AUTH HELPERS (unchanged)
// ------------------------------------------------------------
export async function hashPassword(pw: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
    return bcrypt.compare(pw, hash);
}

export function newSessionToken() {
    return crypto.randomUUID();
}

export async function createSession(userId: string) {
    const token = newSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000);
    const session = await prisma.session.create({ data: { userId, token, expiresAt } });
    return session;
}

export async function getUserBySessionToken(token?: string | null) {
    if (!token) return null;

    const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!session) return null;

    if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { token } });
        return null;
    }

    return session.user;
}

// ---------------------------------------------------------------------------
// Express middleware: attaches req.user from sid cookie
// ---------------------------------------------------------------------------
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
    const token = (req as any).cookies?.sid as string | undefined;
    (req as any).user = await getUserBySessionToken(token);
    next();
}

// ---------------------------------------------------------------------------
// DISCORD OAUTH IMPLEMENTATION — full + corrected
// Uses Node 18+ built-in fetch (no node-fetch).
// ---------------------------------------------------------------------------

// 1) Redirect user to Discord OAuth
export function discordStart(_req: Request, res: Response) {
    console.log("REDIRECT URI ENV:", process.env.DISCORD_REDIRECT_URI);

    const redirect = encodeURIComponent(process.env.DISCORD_REDIRECT_URI!);
    console.log("ENCODED REDIRECT SENT TO DISCORD:", redirect);

    const url =
        `https://discord.com/api/oauth2/authorize` +
        `?client_id=${process.env.DISCORD_CLIENT_ID}` +
        `&redirect_uri=${redirect}` +
        `&response_type=code&scope=identify`;

    console.log("FINAL AUTH URL:", url);

    return res.redirect(url);
}
// 2) Discord callback → exchange code for token → fetch profile → upsert user
export async function discordCallback(req: Request, res: Response) {
    try {
        const code = req.query.code as string;
        if (!code) return res.status(400).send("Missing OAuth code");

        // Exchange code for token
        const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI!,
            }),
        });

        const tokens = await tokenResp.json();

        // Fetch user profile
        const userResp = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const profile: any = await userResp.json();

        // Upsert user
        const user = await prisma.user.upsert({
            where: { discordId: profile.id },
            update: {
                displayName: profile.username,
                avatarUrl: profile.avatar
                    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                    : null,
            },
            create: {
                discordId: profile.id,
                email: null,
                hashedPassword: null,
                displayName: profile.username,
                avatarUrl: profile.avatar
                    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                    : null,
            },
        });

        // Create session
        const session = await createSession(user.id);

        res.cookie("sid", session.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 3600 * 1000,
        });

        // Redirect to your frontend Replay page
        return res.redirect("http://localhost:5173/replay");
    } catch (err) {
        console.error("Discord OAuth error:", err);
        return res.status(500).json({ error: "Discord OAuth failed" });
    }
}

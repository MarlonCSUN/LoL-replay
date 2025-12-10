// server/src/index.ts
// Loads environment variables from .env file
import "dotenv/config";

// Core server deps
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// App helpers
import { riot } from "./riot.js";
import {
    ACCOUNT_REGIONS,
    MATCH_REGIONS,
    matchIdToRegion,
    type Region,
} from "./regions.js";

// Prisma + cache + auth
import { prisma } from "./db.js";
import { getMatchCached, getTimelineCached } from "./cache.js";
import {
    hashPassword,
    verifyPassword,
    createSession,
    attachUser,
    discordStart,
    discordCallback,
} from "./auth.js";

// ----------------------------------------------------------------------------
// App setup
// ----------------------------------------------------------------------------
const app = express();

// IMPORTANT: allow your frontend to backend at 5050
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

// ----------------------------------------------------------------------------
// DISCORD OAUTH ROUTES
// ----------------------------------------------------------------------------
app.get("/api/auth/discord", discordStart);
app.get("/api/auth/discord/callback", discordCallback);

// ----------------------------------------------------------------------------
// Health Check
// ----------------------------------------------------------------------------
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, serverTime: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// Resolver: Riot ID or Match ID -> recent match IDs
// ----------------------------------------------------------------------------
app.get("/api/matches/resolve", async (req, res) => {
    try {
        const riotId = typeof req.query.riotId === "string" ? req.query.riotId : "";
        const matchId = typeof req.query.matchId === "string" ? req.query.matchId : "";
        const start = Number(req.query.start || 0);
        const count = Number(req.query.count || 10);

        if (matchId) {
            return res.json({
                regionGuess: matchIdToRegion(matchId),
                puuid: null,
                matchIds: [matchId],
            });
        }

        if (!riotId.includes("#")) {
            return res
                .status(400)
                .json({ error: "Provide riotId like GameName#Tag or a matchId." });
        }

        const [gameName, tagLine] = riotId.split("#");

        // A) Riot ID → PUUID
        const accountTries = await Promise.allSettled(
            ACCOUNT_REGIONS.map(async (rg) => ({
                rg,
                data: await riot(
                    rg,
                    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
                        gameName
                    )}/${encodeURIComponent(tagLine)}`
                ),
            }))
        );

        const hit = accountTries.find(
            (t: any) => t.status === "fulfilled" && t.value?.data?.puuid
        ) as PromiseFulfilledResult<{ rg: Region; data: { puuid: string } }> | undefined;

        if (!hit)
            return res
                .status(404)
                .json({ error: "Account not found. Check spelling & tag." });

        const puuid = hit.value.data.puuid;

        // B) PUUID → match IDs
        const matchTries = await Promise.allSettled(
            MATCH_REGIONS.map(async (rg) => ({
                rg,
                ids: await riot(
                    rg,
                    `/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`
                ),
            }))
        );

        const found = matchTries.find(
            (t: any) =>
                t.status === "fulfilled" &&
                Array.isArray(t.value.ids) &&
                t.value.ids.length > 0
        ) as PromiseFulfilledResult<{ rg: Region; ids: string[] }> | undefined;

        const regionGuess = found?.value?.rg ?? null;
        const matchIds = found?.value?.ids ?? [];

        res.json({ regionGuess, puuid, matchIds });
    } catch (e: any) {
        res.status(500).json({ error: "Lookup failed", detail: e.message ?? String(e) });
    }
});

// ----------------------------------------------------------------------------
// List cached matches
// ----------------------------------------------------------------------------
app.get("/api/matches/cached", async (_req, res) => {
    try {
        const rows = await prisma.matchCache.findMany({
            select: { matchId: true, updatedAt: true, json: true },
            orderBy: { updatedAt: "desc" },
            take: 20,
        });

        const summaries = rows.map((r) => {
            const data: any = r.json;
            const participants: any[] = data?.info?.participants ?? [];
            const teams: any[] = data?.info?.teams ?? [];

            const blueTeam = participants.filter((p) => p.teamId === 100);
            const redTeam = participants.filter((p) => p.teamId === 200);

            const pickStar = (team: any[]) =>
                team.reduce(
                    (best, p) => ((best?.kills ?? -1) >= (p?.kills ?? -1) ? best : p),
                    null
                );

            const blueStar = pickStar(blueTeam);
            const redStar = pickStar(redTeam);

            const toKDA = (p: any) =>
                `${p?.kills ?? "?"}/${p?.deaths ?? "?"}/${p?.assists ?? "?"}`;

            const winTeam = teams.find((t) => t.win === true || t.win === "Win");
            const winTeamId = winTeam?.teamId;

            const sideLabel =
                winTeamId === 100
                    ? "Blue Win"
                    : winTeamId === 200
                        ? "Red Win"
                        : "Unknown Result";

            const durationSeconds: number = data?.info?.gameDuration ?? 0;
            const mins = Math.floor(durationSeconds / 60);
            const secs = durationSeconds % 60;

            return {
                matchId: r.matchId,
                updatedAt: r.updatedAt,
                label: `${sideLabel} – ${blueStar?.championName ?? "Blue"} ${toKDA(
                    blueStar
                )} vs ${redStar?.championName ?? "Red"} ${toKDA(
                    redStar
                )} – ${mins}:${secs.toString().padStart(2, "0")}`,
            };
        });

        res.json(summaries);
    } catch (e: any) {
        res.status(500).json({ error: "Failed to list cached matches", detail: e.message });
    }
});

// ----------------------------------------------------------------------------
// GET /api/match/:matchId
// ----------------------------------------------------------------------------
app.get("/api/match/:matchId", async (req, res) => {
    try {
        const { matchId } = req.params;
        const region = matchIdToRegion(matchId) ?? "americas";

        const match = await getMatchCached(matchId, () =>
            riot(region, `/lol/match/v5/matches/${matchId}`)
        );

        const timeline = await getTimelineCached(matchId, async () => {
            try {
                return await riot(
                    region,
                    `/lol/match/v5/matches/${matchId}/timeline`
                );
            } catch {
                return null;
            }
        });

        res.json({ match, timeline, region });
    } catch (e: any) {
        res.status(500).json({
            error: "Match fetch failed",
            detail: e.message ?? String(e),
        });
    }
});

// ----------------------------------------------------------------------------
// AUTH: signup, login, me, logout
// ----------------------------------------------------------------------------

// SIGNUP (WITH AVATAR SUPPORT)
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { email, password, displayName, avatar } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: "email and password required" });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists)
            return res.status(409).json({ error: "Email already in use" });

        const hashedPassword = await hashPassword(password);

        const avatarUrl = avatar
            ? `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${avatar}.png`
            : null;

        const user = await prisma.user.create({
            data: {
                email,
                hashedPassword,
                displayName: displayName ?? email,
                avatarUrl,
            },
        });

        const session = await createSession(user.id);
        res.cookie("sid", session.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 3600 * 1000,
        });

        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        });
    } catch (e: any) {
        res.status(500).json({ error: "Signup failed", detail: e.message });
    }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password)
            return res.status(400).json({ error: "email and password required" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });

        const ok = await verifyPassword(password, user.hashedPassword!);
        if (!ok)
            return res.status(401).json({ error: "Invalid credentials" });

        const session = await createSession(user.id);
        res.cookie("sid", session.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 3600 * 1000,
        });

        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        });
    } catch (e: any) {
        res.status(500).json({ error: "Login failed", detail: e.message });
    }
});

// WHO AM I
app.get("/api/auth/me", async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ user: null });
    res.json({
        user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        },
    });
});

// LOGOUT
app.post("/api/auth/logout", async (req, res) => {
    try {
        const token = (req as any).cookies?.sid as string | undefined;
        if (token) {
            await prisma.session.delete({ where: { token } }).catch(() => { });
        }
        res.clearCookie("sid");
        res.json({ ok: true });
    } catch (e: any) {
        res.status(500).json({ error: "Logout failed", detail: e.message });
    }
});

// ----------------------------------------------------------------------------
// Start server
// ----------------------------------------------------------------------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});

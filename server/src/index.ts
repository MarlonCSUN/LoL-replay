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
} from "./auth.js";

// ----------------------------------------------------------------------------
// App setup
// ----------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

// ----------------------------------------------------------------------------
// Health Check
// ----------------------------------------------------------------------------
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, serverTime: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
/**
 * Resolver: Riot ID or Match ID -> recent match IDs
 * - If `matchId` is provided, just return it and a region guess.
 * - Else, resolve Riot ID -> PUUID (probe account regions), then
 *   PUUID -> recent match IDs (probe match regions).
 */
// ----------------------------------------------------------------------------
app.get("/api/matches/resolve", async (req, res) => {
    try {
        const riotId = typeof req.query.riotId === "string" ? req.query.riotId : "";
        const matchId = typeof req.query.matchId === "string" ? req.query.matchId : "";
        const start = Number(req.query.start || 0);
        const count = Number(req.query.count || 10);

        // If a matchId is given, short-circuit with region guess + matchId
        if (matchId) {
            return res.json({
                regionGuess: matchIdToRegion(matchId),
                puuid: null,
                matchIds: [matchId],
            });
        }

        // Riot ID must look like GameName#Tag
        if (!riotId.includes("#")) {
            return res
                .status(400)
                .json({ error: "Provide riotId like GameName#Tag or a matchId." });
        }

        const [gameName, tagLine] = riotId.split("#");

        // A) Riot ID -> PUUID (probe account regions)
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
        ) as
            | PromiseFulfilledResult<{ rg: Region; data: { puuid: string } }>
            | undefined;

        if (!hit)
            return res
                .status(404)
                .json({ error: "Account not found. Check spelling & tag." });

        const puuid = hit.value.data.puuid;

        // B) PUUID -> match IDs (probe match regions)
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
        res
            .status(500)
            .json({ error: "Lookup failed", detail: String(e.message || e) });
    }
});

// ----------------------------------------------------------------------------
// NEW: list recent cached matches from Prisma, with a descriptive label
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
            const p = data?.info?.participants?.[0];
            const champ: string = p?.championName ?? "Unknown";
            const kills = typeof p?.kills === "number" ? p.kills : "?";
            const deaths = typeof p?.deaths === "number" ? p.deaths : "?";
            const assists = typeof p?.assists === "number" ? p.assists : "?";
            const kda = `${kills}/${deaths}/${assists}`;

            return {
                matchId: r.matchId,
                updatedAt: r.updatedAt,
                label: `${champ} ${kda}`,
            };
        });

        res.json(summaries);
    } catch (e: any) {
        console.error("List cached matches failed", e);
        res.status(500).json({
            error: "Failed to list cached matches",
            detail: String(e.message || e),
        });
    }
});

// ----------------------------------------------------------------------------
/**
 * GET /api/match/:matchId
 * Returns { match, timeline, region }.
 * Uses a Postgres (Prisma) read-through cache to avoid excess Riot calls.
 */
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
                return null; // some matches don’t have timelines
            }
        });

        res.json({ match, timeline, region });
    } catch (e: any) {
        res
            .status(500)
            .json({ error: "Match fetch failed", detail: String(e.message || e) });
    }
});

// ----------------------------------------------------------------------------
// Auth Routes: signup, login, me, logout
// ----------------------------------------------------------------------------

// Signup
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { email, password, displayName } = req.body || {};
        if (!email || !password || !displayName) {
            return res
                .status(400)
                .json({ error: "email, password, displayName required" });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ error: "Email already in use" });

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, hashedPassword, displayName },
        });

        const session = await createSession(user.id);
        res.cookie("sid", session.token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false, // set true in prod (HTTPS)
            maxAge: 7 * 24 * 3600 * 1000,
        });

        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        });
    } catch (e: any) {
        res
            .status(500)
            .json({ error: "Signup failed", detail: String(e.message || e) });
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password)
            return res
                .status(400)
                .json({ error: "email and password required" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const ok = await verifyPassword(password, user.hashedPassword);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

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
        });
    } catch (e: any) {
        res
            .status(500)
            .json({ error: "Login failed", detail: String(e.message || e) });
    }
});

// Who am I
app.get("/api/auth/me", async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ user: null });
    res.json({
        user: { id: user.id, email: user.email, displayName: user.displayName },
    });
});

// Logout
app.post("/api/auth/logout", async (req, res) => {
    try {
        const token = (req as any).cookies?.sid as string | undefined;
        if (token) {
            await prisma.session.delete({ where: { token } }).catch(() => { });
        }
        res.clearCookie("sid");
        res.json({ ok: true });
    } catch (e: any) {
        res
            .status(500)
            .json({ error: "Logout failed", detail: String(e.message || e) });
    }
});

// ----------------------------------------------------------------------------
// Start server
// ----------------------------------------------------------------------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});

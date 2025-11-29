import { useEffect, useMemo, useRef, useState } from "react";

// UI components
import MatchFinder from "../components/MatchFinder";
import TeamRail from "../components/TeamRail";
import MapCanvas from "../components/MapCanvas";
import MapOverlay from "../components/MapOverlay";
import EventBar from "../components/EventBar";
import ObjectiveHUD from "../components/ObjectiveHUD";
import EventBanner from "../components/EventBanner";

// API
import { loadMatch, type MatchBundle } from "../api";

// Timeline utils
import {
    extractEvents,
    extractFrames,
    parseParticipants,
    splitTeams,
} from "../lib/riotTimeline";

// Live state utility
import { computeLiveState } from "../lib/gameState";

// Tower model
import {
    learnFromEvents,
    loadModel,
    saveModel,
    getAliveSitesAt,
    type TowerModel,
} from "../lib/towerModel";

type RecentMatchSummary = {
    matchId: string;
    label?: string;
    updatedAt?: string;
};

// Champion Icon Helper (DDragon)
function getChampionIcon(champ: string) {
    return `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${champ}.png`;
}

export default function Replay() {
    const [picked, setPicked] = useState<string | null>(null);
    const [bundle, setBundle] = useState<MatchBundle | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [recentMatches, setRecentMatches] = useState<RecentMatchSummary[]>([]);

    const [playing, setPlaying] = useState(false);
    const [timeMs, setTimeMs] = useState(0);
    const rafRef = useRef<number | null>(null);
    const lastTickRef = useRef<number>(0);
    const speedRef = useRef<number>(1);

    const [towerModel, setTowerModel] = useState<TowerModel>(() => loadModel());

    // Load match on pick
    useEffect(() => {
        if (!picked) return;
        let cancel = false;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                setBundle(null);
                const b = await loadMatch(picked);
                if (!cancel) {
                    setBundle(b);
                    setTimeMs(0);
                    setPlaying(false);
                }
            } catch (e: any) {
                setErr(String(e));
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [picked]);

    // Load recently cached matches
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/matches/cached");
                if (!res.ok) return;
                setRecentMatches(await res.json());
            } catch { }
        })();
    }, []);

    const participants = useMemo(
        () => (bundle ? parseParticipants(bundle.match) : []),
        [bundle]
    );
    const frames = useMemo(
        () => (bundle ? extractFrames(bundle.timeline) : []),
        [bundle]
    );
    const events = useMemo(
        () => (bundle ? extractEvents(bundle.timeline) : []),
        [bundle]
    );
    const teams = useMemo(() => splitTeams(participants), [participants]);

    const durationMs = frames.length ? frames[frames.length - 1].t : 0;
    const live = useMemo(
        () => computeLiveState(events, timeMs),
        [events, timeMs]
    );

    // Learn tower model
    useEffect(() => {
        if (!events.length) return;
        const updated = learnFromEvents(towerModel, events);

        const keysA = Object.keys(towerModel);
        const keysB = Object.keys(updated);
        let changed = keysA.length !== keysB.length;

        if (!changed) {
            for (const k of keysB) {
                const a = towerModel[k];
                const b = updated[k];
                if (!a || a.x !== b.x || a.y !== b.y || a.count !== b.count) {
                    changed = true;
                    break;
                }
            }
        }

        if (changed) {
            setTowerModel(updated);
            saveModel(updated);
        }
    }, [events, towerModel]);

    const aliveTowers = useMemo(
        () =>
            getAliveSitesAt(towerModel, events, timeMs).map((s) => ({
                x: s.x,
                y: s.y,
                teamId: s.teamId,
            })),
        [towerModel, events, timeMs]
    );

    // Playback loop
    useEffect(() => {
        if (!playing) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTickRef.current = 0;
            return;
        }

        function tick(ts: number) {
            if (!lastTickRef.current) lastTickRef.current = ts;
            const dt = ts - lastTickRef.current;
            lastTickRef.current = ts;

            setTimeMs((t) => {
                const nxt = Math.min(durationMs, t + dt * speedRef.current);
                if (nxt >= durationMs) setPlaying(false);
                return nxt;
            });

            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);

        return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    }, [playing, durationMs]);

    function handleSeek(t: number) {
        setPlaying(false);
        setTimeMs(Math.max(0, Math.min(durationMs, t)));
    }

    return (
        <main style={{ display: "grid", gap: 16 }}>
            <header>
                <h1>Replay</h1>
                <p style={{ opacity: 0.8 }}>
                    Enter a Riot ID (e.g., <code>Faker#KR1</code>) or paste a Match ID
                    (e.g., <code>NA1_…</code>).
                </p>
            </header>

            <MatchFinder onPick={setPicked} />

            {/* RECENTLY WATCHED MATCHES (full glow-up) */}
            {recentMatches.length > 0 && (
                <section
                    style={{
                        padding: 20,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background:
                            "linear-gradient(135deg, rgba(50,50,70,0.4), rgba(20,20,30,0.55))",
                        backdropFilter: "blur(10px)",
                        display: "grid",
                        gap: 16,
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 20,
                                fontWeight: 600,
                            }}
                        >
                            Your recently watched matches
                        </h2>
                        <span
                            style={{
                                fontSize: 13,
                                opacity: 0.8,
                                fontStyle: "italic",
                            }}
                        >
                            Format: <strong>(Blue/Red Win)</strong> – Champion{" "}
                            <strong>K/D/A</strong> vs Champion <strong>K/D/A</strong> – game
                            length
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            maxHeight: "420px",
                            overflowY: "auto",
                            paddingRight: 6,
                        }}
                    >
                        {recentMatches.map((m) => {
                            const label = m.label ?? m.matchId;
                            const champ1 =
                                label.split("–")[1]?.trim()?.split(" ")[0] ?? "Unknown";
                            const champ2 =
                                label.split("vs")[1]?.trim()?.split(" ")[0] ?? "Unknown";

                            return (
                                <div
                                    key={m.matchId}
                                    onClick={() => setPicked(m.matchId)}
                                    style={{
                                        cursor: "pointer",
                                        padding: 14,
                                        borderRadius: 12,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "rgba(255,255,255,0.06)",
                                        backdropFilter: "blur(6px)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        transition: "all .15s ease",
                                    }}
                                >
                                    <img
                                        src={getChampionIcon(champ1)}
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: "50%",
                                            border: "2px solid rgba(255,255,255,0.15)",
                                            objectFit: "cover",
                                        }}
                                    />

                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>

                                        <img
                                            src={getChampionIcon(champ2)}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                border: "1px solid rgba(255,255,255,0.15)",
                                                objectFit: "cover",
                                                marginTop: 2,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* SELECTED MATCH */}
            {picked && (
                <section
                    style={{
                        padding: 12,
                        border: "1px solid #333",
                        borderRadius: 8,
                        display: "grid",
                        gap: 8,
                    }}
                >
                    <div>
                        <strong>Selected Match:</strong> {picked}
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                            onClick={() => setPlaying((p) => !p)}
                            disabled={!bundle || frames.length === 0}
                        >
                            {playing ? "Pause" : "Play"}
                        </button>

                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            Speed
                            <select
                                defaultValue="1"
                                onChange={(e) => (speedRef.current = Number(e.target.value))}
                            >
                                <option value="0.5">0.5×</option>
                                <option value="1">1×</option>
                                <option value="2">2×</option>
                            </select>
                        </label>

                        <input
                            type="range"
                            min={0}
                            max={durationMs}
                            value={timeMs}
                            onChange={(e) => setTimeMs(Number(e.target.value))}
                            style={{ flex: 1 }}
                        />

                        <span style={{ width: 90, textAlign: "right" }}>
                            {msToClock(timeMs)} / {msToClock(durationMs)}
                        </span>
                    </div>
                </section>
            )}

            {loading && <div>Loading match & timeline…</div>}
            {err && <div style={{ color: "crimson" }}>{err}</div>}

            {/* MAP SECTION — CENTERED FIX APPLIED */}
            {bundle && (
                <section style={{ display: "grid", gap: 16 }}>
                    {frames.length === 0 ? (
                        <div>No timeline available.</div>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "280px 900px 280px", // FIX: exact widths centers map
                                justifyContent: "center",                 // FIX: whole grid centered
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <TeamRail
                                title="Blue Team"
                                team={teams.blue}
                                side="blue"
                                events={events}
                                timeMs={timeMs}
                            />

                            {/* Centered map */}
                            <div
                                style={{
                                    position: "relative",
                                    width: 900,
                                    height: 900,
                                    justifySelf: "center",
                                }}
                            >
                                <MapCanvas
                                    width={900}
                                    height={900}
                                    participants={participants}
                                    frames={frames}
                                    timeMs={timeMs}
                                    showHalos
                                    markerStyle="name"
                                    dead={live.dead}
                                    aliveTowers={aliveTowers}
                                />

                                <MapOverlay
                                    width={900}
                                    height={900}
                                    events={events}
                                    timeMs={timeMs}
                                />

                                <ObjectiveHUD
                                    dragon={live.objectivesUp.dragon}
                                    baron={live.objectivesUp.baron}
                                    herald={live.objectivesUp.herald}
                                />

                                <EventBanner events={events} timeMs={timeMs} width={900} />
                            </div>

                            <TeamRail
                                title="Red Team"
                                team={teams.red}
                                side="red"
                                events={events}
                                timeMs={timeMs}
                            />
                        </div>
                    )}

                    <EventBar events={events} onSeek={handleSeek} />
                </section>
            )}
        </main>
    );
}

function msToClock(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss.toString().padStart(2, "0")}`;
}

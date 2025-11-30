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

import { computeDeathMap, getDeadParticipantsAt } from "../lib/deathTimer";
// Live game state (objectives up)
import { computeLiveState } from "../lib/gameState";
// Static tower positions
import { getAliveTowersAt } from "../lib/towerPositions";

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
  // UI / network
  const [picked, setPicked] = useState<string | null>(null);
  const [bundle, setBundle] = useState<MatchBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [recentMatches, setRecentMatches] = useState<RecentMatchSummary[]>([]);

  // playback
  const [playing, setPlaying] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const speedRef = useRef<number>(1);

  // Load match when a new one is picked
  useEffect(() => {
    if (!picked) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setBundle(null);
        const b = await loadMatch(picked);
        if (!cancelled) {
          setBundle(b);
          setTimeMs(0);
          setPlaying(false);
        }
      } catch (e: unknown) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [picked]);

  // Load recently cached matches (DB-backed)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/matches/cached");
        if (!res.ok) return;
        const data = (await res.json()) as RecentMatchSummary[];
        setRecentMatches(data);
      } catch {
        // ignore – this is a convenience feature
      }
    })();
  }, []);

  // Derive data for rendering
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
  const durationMs = frames.length > 0 ? frames[frames.length - 1].t : 0;

  // Live state at current time (objectives up)
  const live = useMemo(
    () => computeLiveState(events, timeMs),
    [events, timeMs]
  );

  // Death timer map + who is dead at this time
  const deathMap = useMemo(() => computeDeathMap(events), [events]);
  const dead = useMemo(
    () => getDeadParticipantsAt(deathMap, timeMs),
    [deathMap, timeMs]
  );

  // Alive towers at this time using static towerPositions
  const aliveTowers = useMemo(
    () => getAliveTowersAt(events, timeMs),
    [events, timeMs]
  );

  // Optional debug for towers
  useEffect(() => {
    if (aliveTowers.length > 0) {
      console.log("=== ALIVE TOWERS DEBUG ===");
      console.log("Total:", aliveTowers.length);

      const byType = aliveTowers.reduce((acc, t) => {
        const type = t.type || "UNKNOWN";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log("By type:", byType);
      console.log("Sample towers:", aliveTowers.slice(0, 5));
    }
  }, [aliveTowers]);

  // RAF loop for playback
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
      setTimeMs((prev) => {
        const next = Math.min(durationMs, prev + dt * speedRef.current);
        if (next >= durationMs) setPlaying(false);
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, durationMs]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setTimeMs((t) => Math.max(0, t - 3000));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setTimeMs((t) => Math.min(durationMs, t + 3000));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [durationMs]);

  // Seek handler for EventBar
  function handleSeek(t: number) {
    setPlaying(false);
    setTimeMs(Math.max(0, Math.min(t, durationMs)));
  }

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <header>
        <h1>Replay</h1>
        <p style={{ opacity: 0.8 }}>
          Enter a Riot ID (e.g., <code>Faker#KR1</code>) or paste a Match ID (
          <code>NA1_…</code>).
        </p>
      </header>

      <MatchFinder onPick={setPicked} />

      {/* RECENTLY WATCHED MATCHES */}
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

      {/* SELECTED MATCH CONTROLS */}
      {picked && (
        <section
          style={{
            padding: 12,
            border: "1px solid #ddd",
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
            <label
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              Speed
              <select
                defaultValue="1"
                onChange={(e) =>
                  (speedRef.current = Number(e.target.value))
                }
              >
                <option value="0.5">0.5×</option>
                <option value="1">1×</option>
                <option value="2">2×</option>
              </select>
            </label>
            <input
              type="range"
              min={0}
              max={durationMs || 0}
              value={timeMs}
              onChange={(e) => setTimeMs(Number(e.target.value))}
              style={{ flex: 1 }}
              disabled={!bundle || frames.length === 0}
            />
            <span style={{ width: 90, textAlign: "right" }}>
              {msToClock(timeMs)} / {msToClock(durationMs)}
            </span>
          </div>
        </section>
      )}

      {loading && <div>Loading match &amp; timeline…</div>}
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      {/* MAP + HUD */}
      {bundle && (
        <section style={{ display: "grid", gap: 16 }}>
          {frames.length === 0 ? (
            <div>No timeline available for this match (can’t animate).</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "280px 900px 280px",
                justifyContent: "center",
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
                  dead={dead}
                  aliveTowers={aliveTowers}
                  deathMap={deathMap}
                  events={events}
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
                <EventBanner
                  events={events}
                  timeMs={timeMs}
                  width={900}
                />
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

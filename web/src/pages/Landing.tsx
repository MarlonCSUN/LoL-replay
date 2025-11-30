// web/src/pages/Landing.tsx — Bright Cinematic Quadrants (Option C)
import { Link } from "react-router-dom";
import quickstartGif from "../assets/quickstart.gif";

const STEP_BG = "#4F46E5";
const CARD_BG = "#1F2937";
const TEXT = "#FFF";

// DDragon splash URLs (environmental crops)
const GARAN_SPLASH =
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg"; // clean rift
const SHYVANA_SPLASH =
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Shyvana_0.jpg"; // dragon pit fire

export default function Landing() {
    const steps = [
        { num: 1, title: "Enter Your ID", body: "Drop in a Riot ID or Match ID to get started." },
        { num: 2, title: "Pick a Match", body: "Select from your recent games in the list." },
        { num: 3, title: "Press Play", body: "Watch the 2D replay animate in real time." },
    ];

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#fff",
                color: "#111",
                paddingBottom: "2rem",
            }}
        >
            {/* HEADER */}
            <header
                style={{
                    maxWidth: 1120,
                    margin: "0 auto",
                    padding: "2rem 1rem 1rem",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "1.5rem",
                        right: "1rem",
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "#7C3AED",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                        color: TEXT,
                        fontWeight: 700,
                    }}
                >
                    MR
                </div>
            </header>

            {/* CONTENT SECTION */}
            <section
                style={{
                    maxWidth: 1120,
                    margin: "0 auto",
                    padding: "0 1rem",
                }}
            >
                <h2 style={{ fontSize: "1.6rem", marginBottom: "1.2rem", textAlign: "center" }}>
                    How It Works:
                </h2>

                {/* ⭐ Auto-responsive 2×2 cinematic grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                        gap: "1.75rem",
                        justifyItems: "center", // ⭐ centers all quadrants
                        alignItems: "stretch",
                    }}
                >
                    {/* ────────────────── QUADRANT 1 — INSTRUCTIONS ────────────────── */}
                    <div
                        style={{
                            background: "#fff",
                            padding: "1rem 1rem 0.5rem",
                            borderRadius: 12,
                            width: "100%", // ⭐ ensures visual consistency
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        }}
                    >
                        {steps.map((s) => (
                            <div
                                key={s.num}
                                style={{
                                    display: "flex",
                                    gap: "1rem",
                                    alignItems: "flex-start",
                                    marginBottom: "1rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        background: STEP_BG,
                                        color: TEXT,
                                        display: "grid",
                                        placeItems: "center",
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {s.num}
                                </div>

                                <div>
                                    <h4 style={{ margin: 0, fontSize: "1.15rem" }}>{s.title}</h4>
                                    <p style={{ margin: ".25rem 0 0", fontSize: "0.95rem", color: "#444" }}>
                                        {s.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ────────────────── QUADRANT 2 — CINEMATIC RIFT ────────────────── */}
                    <div
                        style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16/9",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        }}
                    >
                        <img
                            src={GARAN_SPLASH}
                            alt="Replay in Action"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center 30%", // highlights Rift terrain
                                filter: "brightness(0.95)", // ⭐ BRIGHT
                            }}
                        />

                        {/* Light soft overlay (barely noticeable) */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "rgba(0,0,0,0.15)", // ⭐ only 15% dark
                            }}
                        />

                        <h3
                            style={{
                                position: "absolute",
                                bottom: 16,
                                left: 0,
                                width: "100%",
                                textAlign: "center",
                                fontSize: "1.2rem",
                                color: TEXT,
                                textShadow: "0 2px 4px rgba(0,0,0,0.7)",
                            }}
                        >
                            Replay in Action
                        </h3>
                    </div>

                    {/* ────────────────── QUADRANT 3 — CINEMATIC DRAGON PIT ────────────────── */}
                    <div
                        style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16/9",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        }}
                    >
                        <img
                            src={SHYVANA_SPLASH}
                            alt="Objectives & Banners"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center 45%", // targets dragon-pit fire
                                filter: "brightness(1.0)", // ⭐ FULL brightness
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "rgba(0,0,0,0.15)", // ⭐ very light overlay
                            }}
                        />

                        <h3
                            style={{
                                position: "absolute",
                                bottom: 16,
                                left: 0,
                                width: "100%",
                                textAlign: "center",
                                fontSize: "1.2rem",
                                color: TEXT,
                                textShadow: "0 2px 4px rgba(0,0,0,0.7)",
                            }}
                        >
                            Objectives & Banners
                        </h3>
                    </div>

                    {/* ────────────────── QUADRANT 4 — QUICK START GIF ────────────────── */}
                    <div
                        style={{
                            borderRadius: 12,
                            background: CARD_BG,
                            padding: "1rem",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                            textAlign: "center",
                            width: "100%",
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: "1.15rem", color: TEXT }}>Quick Start GIF</h3>

                        <img
                            src={quickstartGif}
                            alt="Quick Start"
                            style={{
                                width: "100%",
                                borderRadius: 10,
                                marginTop: "0.75rem",
                                objectFit: "cover",
                                maxHeight: 320,
                            }}
                        />
                    </div>
                </div>

                {/* CTA BUTTON */}
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <Link
                        to="/replay"
                        style={{
                            display: "inline-block",
                            padding: "0.75rem 1.5rem",
                            background: STEP_BG,
                            color: TEXT,
                            borderRadius: 8,
                            textDecoration: "none",
                            fontWeight: 700,
                        }}
                    >
                        Open Replay
                    </Link>
                </div>
            </section>
        </main>
    );
}

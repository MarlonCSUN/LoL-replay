// web/src/pages/Landing.tsx — Bright Cinematic Quadrants (Replay-matched theme)
import { Link } from "react-router-dom";
import quickstartGif from "../assets/quickstart.gif";

// Replay-style color tokens
const STEP_BG = "#3B82F6";                         // Replay blue
const CARD_BG = "rgba(24, 24, 36, 0.95)";           // Replay dark glass card
const TEXT = "#e5e8ecff";                           // Replay soft light text

// DDragon splash URLs
const GARAN_SPLASH =
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg";
const SHYVANA_SPLASH =
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Shyvana_0.jpg";

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
                background: "linear-gradient(135deg, rgba(20,20,30,0.8), rgba(10,10,18,0.9))",
                color: TEXT,
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
                {/* MR avatar removed */}
            </header>

            {/* CONTENT SECTION */}
            <section
                style={{
                    maxWidth: 1120,
                    margin: "0 auto",
                    padding: "0 1rem",
                }}
            >
                <h2
                    style={{
                        fontSize: "1.6rem",
                        marginBottom: "1.2rem",
                        textAlign: "center",
                        color: TEXT,
                    }}
                >
                    How It Works:
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                        gap: "1.75rem",
                        justifyItems: "center",
                        alignItems: "stretch",
                    }}
                >
                    {/* QUADRANT 1 — INSTRUCTIONS */}
                    <div
                        style={{
                            background: "rgba(30,30,45,0.75)",
                            padding: "1rem 1rem 0.5rem",
                            borderRadius: 12,
                            width: "100%",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
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
                                    <h4 style={{ margin: 0, fontSize: "1.15rem", color: TEXT }}>{s.title}</h4>
                                    <p
                                        style={{
                                            margin: ".25rem 0 0",
                                            fontSize: "0.95rem",
                                            color: "rgba(229,232,236,0.85)",
                                        }}
                                    >
                                        {s.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* QUADRANT 2 — CINEMATIC RIFT */}
                    <div
                        style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16/9",
                            boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
                        }}
                    >
                        <img
                            src={GARAN_SPLASH}
                            alt="Replay in Action"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center 30%",
                                filter: "brightness(0.75)",
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "radial-gradient(circle, rgba(0,0,0,0.25), rgba(0,0,0,0.55))",
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
                                textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                            }}
                        >
                            Replay in Action
                        </h3>
                    </div>

                    {/* QUADRANT 3 — CINEMATIC DRAGON PIT */}
                    <div
                        style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16/9",
                            boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
                        }}
                    >
                        <img
                            src={SHYVANA_SPLASH}
                            alt="Objectives & Banners"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center 45%",
                                filter: "brightness(0.9)",
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "radial-gradient(circle, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
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
                                textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                            }}
                        >
                            Objectives &amp; Banners
                        </h3>
                    </div>

                    {/* QUADRANT 4 — QUICK START GIF */}
                    <div
                        style={{
                            borderRadius: 12,
                            background: CARD_BG,
                            padding: "1rem",
                            boxShadow: "0 6px 22px rgba(0,0,0,0.45)",
                            textAlign: "center",
                            width: "100%",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: "1.15rem", color: TEXT }}>The Map</h3>

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
                            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                        }}
                    >
                        Open Replay
                    </Link>
                </div>
            </section>
        </main>
    );
}

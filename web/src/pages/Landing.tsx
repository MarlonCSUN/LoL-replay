// web/src/pages/Landing.tsx
import { Link } from "react-router-dom";
import replayPng from "../assets/replay-canvas.png";
import objectivesPng from "../assets/objectives-banners.png";
import quickstartGif from "../assets/quickstart.gif";

const STEP_BG = "#4F46E5";
const CARD_BG = "#1F2937";
const TEXT = "#FFF";

export default function Landing() {
    const steps = [
        { num: 1, title: "Enter Your ID", body: "Drop in a Riot ID or Match ID to get started." },
        { num: 2, title: "Pick a Match", body: "Select from your recent games in the list." },
        { num: 3, title: "Press Play", body: "Watch the 2D replay animate in real time." },
    ];

    return (
        <main style={{ minHeight: "100vh", background: "#fff", color: "#111" }}>
            {/* HEADER: only avatar now */}
            <header
                style={{
                    maxWidth: 1120,
                    margin: "0 auto",
                    padding: "2rem 1rem",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "2rem",
                        right: "1rem",
                        width: 56,
                        height: 56,
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

            {/* HOW IT WORKS */}
            <section
                style={{
                    maxWidth: 1120,
                    margin: "0 auto",
                    padding: "0 1rem 3rem",
                }}
            >
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>How It Works:</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 3fr",
                        gap: "2rem",
                    }}
                >
                    {/* LEFT: Steps + GIF */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {steps.map((s) => (
                            <div key={s.num} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div
                                    style={{
                                        minWidth: 40,
                                        minHeight: 40,
                                        borderRadius: "50%",
                                        background: STEP_BG,
                                        color: TEXT,
                                        display: "grid",
                                        placeItems: "center",
                                        fontSize: "1.125rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {s.num}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "1.125rem" }}>{s.title}</h4>
                                    <p style={{ margin: ".25rem 0 0", fontSize: "0.9375rem", color: "#444" }}>
                                        {s.body}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Quick Start GIF */}
                        <div
                            style={{
                                borderRadius: 12,
                                background: CARD_BG,
                                padding: "1rem",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                textAlign: "center",
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: "1.125rem", color: TEXT }}>Quick Start GIF</h3>
                            <img
                                src={quickstartGif}
                                alt="Quick Start"
                                style={{
                                    width: "100%",
                                    borderRadius: 8,
                                    marginTop: "0.75rem",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
                                }}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Feature Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {[
                            { src: replayPng, caption: "Replay in Action" },
                            { src: objectivesPng, caption: "Objectives & Banners" },
                        ].map((card, i) => (
                            <figure
                                key={i}
                                style={{
                                    borderRadius: 12,
                                    background: "#6B7280",
                                    overflow: "hidden",
                                    position: "relative",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                    minHeight: 220,
                                }}
                            >
                                <img
                                    src={card.src}
                                    alt={card.caption}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <figcaption
                                    style={{
                                        position: "absolute",
                                        bottom: 8,
                                        width: "100%",
                                        textAlign: "center",
                                        color: TEXT,
                                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {card.caption}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>

                {/* CTA */}
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

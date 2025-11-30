import * as React from "react";
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";

import bg from "../images/SignupBG.png";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [dPassword, setDpassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const { login } = useAuth();
    const nav = useNavigate();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError("Please enter an email.");
            return;
        }
        if (!password || !dPassword) {
            setError("Please enter and confirm your password.");
            return;
        }
        if (password !== dPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // This is the Prisma-backed endpoint you'll implement on the server
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: email.trim(),
                    displayName: name.trim() || null,
                    password,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "Signup failed.");
                return;
            }

            const user = await res.json(); // expect { id, email, displayName }

            // Same pattern as Login.tsx
            login(user.displayName ?? user.email ?? email);
            nav("/replay");
        } catch (err) {
            console.error(err);
            setError("Network or server error while signing up.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                backgroundColor: "#282831ff",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
            }}
        >
            {/* Left panel */}
            <aside
                style={{
                    display: "block",
                    backgroundColor: "#282831ff",
                    borderTopRightRadius: "24px",
                    borderBottomRightRadius: "24px",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                }}
                className="left-panel"
            >
                <img
                    src={bg}
                    style={{
                        width: "100%",
                        maxHeight: "100%",
                        borderRadius: "16px",
                        border: "1px solid #4a4a4a",
                        margin: "6.7% 2.67% 2.67% 2.67%",
                    }}
                />
                <motion.h2
                    style={{
                        position: "absolute",
                        bottom: "14%",
                        right: "55%",
                    }}
                    initial={{ opacity: 0, y: 8, scale: 0.65 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                >
                    Share screenshots of your routes and tactics with your friends!
                </motion.h2>
                <motion.h2
                    style={{
                        position: "absolute",
                        bottom: "60%",
                        left: "65%",
                    }}
                    initial={{ opacity: 0, y: 8, scale: 0.65 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 2, ease: "easeInOut" }}
                >
                    Event banners are colored to their respective team.
                </motion.h2>
            </aside>

            {/* Right panel */}
            <main
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "24px",
                    }}
                >
                    <motion.h2
                        initial={{ opacity: 0, y: 8, scale: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    >
                        Sign up
                    </motion.h2>

                    <form
                        onSubmit={onSubmit}
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <label htmlFor="name">Display name (optional)</label>
                        <input
                            id="name"
                            style={{
                                width: "80%",
                                padding: "12px 50px 12px 12px",
                                fontSize: 16,
                            }}
                            type="text"
                            value={name}
                            placeholder="League Lover"
                            autoComplete="nickname"
                            onChange={(e) => setName(e.target.value)}
                        />

                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            style={{
                                width: "80%",
                                padding: "12px 50px 12px 12px",
                                fontSize: 16,
                            }}
                            type="email"
                            value={email}
                            placeholder="leaguelover@example.com"
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            style={{
                                width: "80%",
                                padding: "12px 50px 12px 12px",
                                fontSize: 16,
                            }}
                            type="password"
                            value={password}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <label htmlFor="passwordConfirm">Re-enter Password</label>
                        <input
                            id="passwordConfirm"
                            style={{
                                width: "80%",
                                padding: "12px 50px 12px 12px",
                                fontSize: 16,
                            }}
                            type="password"
                            value={dPassword}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            onChange={(e) => setDpassword(e.target.value)}
                        />

                        {error && (
                            <div style={{ color: "crimson", marginTop: 4 }}>{error}</div>
                        )}

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: 16,
                                padding: "10px 20px",
                                borderRadius: 9999,
                            }}
                        >
                            {loading ? "Creating..." : "Create"}
                        </motion.button>
                    </form>

                    {/* Links */}
                    <div
                        style={{
                            marginTop: "40px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                            textAlign: "center",
                        }}
                    >
                        <Link to="/" style={{ fontWeight: "bold", paddingLeft: "8px" }}>
                            Return to home
                        </Link>
                        <Link to="/login" style={{ fontWeight: "bold", paddingLeft: "8px" }}>
                            Have an account already?
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

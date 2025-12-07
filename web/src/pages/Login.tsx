// (imports unchanged)
import * as React from "react";
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";
import bg from '../images/LoginBG.png';

export default function Login() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { loginLocal } = useAuth();
    const nav = useNavigate();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("http://localhost:5050/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "Login failed.");
                return;
            }

            const user = await res.json();
            loginLocal(user.displayName ?? user.email ?? email);
            nav("/replay");
        } catch (err) {
            console.error(err);
            setError("Network or server error while logging in.");
        } finally {
            setLoading(false);
        }
    }

    function loginWithDiscord() {
        window.location.href = "http://localhost:5050/api/auth/discord";
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
            {/* Left panel unchanged */}
            <aside style={{ /* unchanged */ }}>
                <img src={bg} style={{ /* unchanged */ }} />
                <motion.h2 /* unchanged */>
                    Make every League match instantly replayable, searchable, and shareable!
                </motion.h2>
                <motion.h2 /* unchanged */>
                    Sign in to save your Riot ID for quicker replay access!
                </motion.h2>
            </aside>

            {/* Right panel */}
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
                <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

                    <motion.h2 initial={{ opacity: 0, y: 8, scale: 2 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2, ease: "easeInOut" }}>
                        Log In
                    </motion.h2>

                    {error && <p style={{ color: "tomato", fontSize: "0.9rem" }}>{error}</p>}

                    {/* Email/password form unchanged */}
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <label htmlFor="email">Email</label>
                        <input id="email" style={{ width: "80%", padding: "12px 50px 12px 12px" }} type="email" value={email} placeholder="leaguelover@example.com" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />

                        <label htmlFor="password">Password</label>
                        <div style={{ position: "relative" }}>
                            <input id="password" style={{ width: "80%", padding: "12px 50px 12px 12px" }} type={showPassword ? "text" : "password"} value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
                            <motion.button whileTap={{ scale: 0.75 }} type="button" style={{ position: "absolute", right: "10px", top: "7%", scale: 0.8 }} onClick={() => setShowPassword((s) => !s)}>
                                {showPassword ? "Hide" : "Show"}
                            </motion.button>
                        </div>
                    </div>

                    <form onSubmit={onSubmit} style={{ position: "relative", alignItems: "center" }}>
                        <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading}>
                            {loading ? "Signing in…" : "Sign In"}
                        </motion.button>
                    </form>

                    {/* NEW — Discord OAuth Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={loginWithDiscord}
                        style={{
                            marginTop: "12px",
                            padding: "12px 24px",
                            background: "#5865F2",
                            borderRadius: "8px",
                            color: "white",
                            fontWeight: "bold",
                        }}
                    >
                        Sign in with Discord
                    </motion.button>

                    {/* Links unchanged */}
                    <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", textAlign: "center" }}>
                        <Link to="/signup" style={{ fontWeight: "bold" }}>
                            Signup Options
                        </Link>
                        <Link to="/reset-password" style={{ fontWeight: "bold" }}>
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

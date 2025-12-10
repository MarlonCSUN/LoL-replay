// web/src/App.tsx
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Replay from "./pages/Replay";
import Signup from "./pages/Signup";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import type { JSX } from "react";

function Nav() {
    const { user, logout } = useAuth();
    const displayName =
        user?.displayName ?? user?.email ?? "Player";

    return (
        <nav
            style={{
                display: "flex",
                gap: 16,
                padding: 16,
                borderBottom: "1px solid #eee",
            }}
        >
            <Link to="/">Landing</Link>
            <Link to="/replay">Replay</Link>
            <Link to="/signup">Sign up</Link>
            {user ? (
                <>
                    <span style={{ marginLeft: "auto" }}>Hi, {displayName}</span>
                    <button onClick={logout}>Log out</button>
                </>
            ) : (
                <Link style={{ marginLeft: "auto" }} to="/login">
                    Log in
                </Link>
            )}
        </nav>
    );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Nav />
                <div style={{ padding: 24 }}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/replay"
                            element={
                                <PrivateRoute>
                                    <Replay />
                                </PrivateRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

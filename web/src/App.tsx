// web/src/App.tsx
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Replay from "./pages/Replay";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import type { JSX } from "react";

// Top navigation bar that appears on all pages
function Nav() {
    const { user, logout } = useAuth();

    const displayName =
        user?.displayName ?? user?.email ?? "Player";
    const avatarUrl = user?.avatarUrl ?? null;

    return (
        <nav
            style={{
                backgroundImage: "linear-gradient(to right, #18132e, #3b3b3d)",
                borderBottom: "1px solid #eee",
                display: "flex",
                gap: 16,
                padding: 16,
                alignItems: "center",
            }}
        >
            <Link to="/">
                <button>Landing</button>
            </Link>
            <Link to="/replay">
                <button>Replay</button>
            </Link>
            <Link to="/about">
                <button>About</button>
            </Link>

            {user ? (
                <>
                    <span style={{ marginLeft: "auto" }}>
                        Hi, {displayName}
                    </span>
                    {avatarUrl && (
                        <img
                            src={avatarUrl}
                            alt="User avatar"
                            style={{
                                height: "45px",
                                width: "45px",
                                padding: "1px",
                                borderRadius: "44px",
                                objectFit: "cover",
                                marginLeft: 8,
                                marginRight: 8,
                            }}
                        />
                    )}
                    <button onClick={logout}>Log out</button>
                </>
            ) : (
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <Link to="/signup">
                        <button>Sign up</button>
                    </Link>
                    <Link to="/login">
                        <button>Log in</button>
                    </Link>
                </div>
            )}
        </nav>
    );
}

// Small helper to protect routes
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
                        <Route path="/about" element={<About />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
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

import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Replay from "./pages/Replay";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { JSX } from "react";

// Top navigation bar that appears on all pages
function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ backgroundImage: "linear-gradient(to right, #18132e, #3b3b3d)", 
      borderBottom: "1px solid #eee", display:"flex", gap: 16, padding: 16 }}>
      <Link to="/">
        <button>Landing</button>
      </Link>
      <Link to="/replay">
        <button>Replay</button>
      </Link>
      {user ? (
        <>
          <span style={{ marginLeft: "auto" }}>Hi, {user.name}</span>
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <Link style={{ marginLeft: "auto" }} to="/login">
          <button>Log in</button>
        </Link>
      )}
      
    </nav>
  );
}

// Small helper to protect routes 
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  // Replay public for now
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
            { /* Protect it later by wrapping in <PrivateRoute> */}
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


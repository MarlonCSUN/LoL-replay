// web/src/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

export type User = {
    id?: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
} | null;

type AuthContextType = {
    user: User;
    // Accept either a full user object (from backend) or a plain name string (dev login)
    login: (userOrName: User | string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);

    // Restore from localStorage on load
    useEffect(() => {
        const raw = localStorage.getItem("demo_user");
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            setUser(parsed);
        } catch {
            // If corrupted, just clear it
            localStorage.removeItem("demo_user");
        }
    }, []);

    // Persist to localStorage whenever user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("demo_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("demo_user");
        }
    }, [user]);

    const login = (userOrName: User | string) => {
        if (typeof userOrName === "string") {
            // Legacy/dev login (Login.tsx) – only a name string
            setUser({ displayName: userOrName });
        } else {
            // Full user object from backend (Signup/authenticated login)
            setUser(userOrName);
        }
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

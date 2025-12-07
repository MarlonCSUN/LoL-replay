import { createContext, useContext, useEffect, useState } from "react";

type User = {
    id: string;
    email?: string | null;
    displayName: string;
    avatarUrl?: string | null;
} | null;

type AuthContextType = {
    user: User;
    loading: boolean;
    logout: () => Promise<void>;
    loginLocal: (name: string) => void; // for compatibility with your existing local login
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // On mount, ask the backend "who am I?"
    useEffect(() => {
        let cancelled = false;

        async function loadMe() {
            try {
                const res = await fetch("http://localhost:5050/api/auth/me", {
                    credentials: "include", // IMPORTANT: send sid cookie
                });

                if (!res.ok) {
                    if (!cancelled) {
                        setUser(null);
                    }
                    return;
                }

                const data = await res.json(); // { user: {...} } or { user: null }
                if (!cancelled) {
                    if (data.user) {
                        // Trust backend shape: { id, email, displayName, avatarUrl }
                        setUser({
                            id: data.user.id,
                            email: data.user.email ?? null,
                            displayName: data.user.displayName,
                            avatarUrl: data.user.avatarUrl ?? null,
                        });
                    } else {
                        setUser(null);
                    }
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMe();

        return () => {
            cancelled = true;
        };
    }, []);

    async function logout() {
        try {
            await fetch("http://localhost:5050/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // ignore network errors on logout
        } finally {
            setUser(null);
        }
    }

    function loginLocal(name: string) {
        // Compatibility only — used by your existing login page
        setUser({
            id: "local",
            displayName: name,
            email: null,
            avatarUrl: null,
        });
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout, loginLocal }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

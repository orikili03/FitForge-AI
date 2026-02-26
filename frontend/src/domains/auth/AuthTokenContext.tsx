/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../lib/apiClient";
import { clearLegacyToken } from "../../lib/authToken";

// ─── Types ────────────────────────────────────────────────────────────────
export type AuthUser = { id: string; email: string };

type AuthContextValue = {
    /** Whether the user is authenticated (cookie verified). */
    isAuthenticated: boolean;
    /** True while the initial session check is in progress. */
    isLoading: boolean;
    /** Basic user info from the session. */
    user: AuthUser | null;
    /** Call after a successful login/register to update UI state. */
    onLoginSuccess: (user: AuthUser) => void;
    /** Clear session (calls backend logout to remove cookie). */
    logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    // On mount: clean up legacy localStorage token + verify cookie session
    useEffect(() => {
        clearLegacyToken();

        apiClient
            .get<{ user: AuthUser }>("/auth/me")
            .then((res) => {
                setUser(res.data.user);
                setIsAuthenticated(true);
            })
            .catch(() => {
                setUser(null);
                setIsAuthenticated(false);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const onLoginSuccess = useCallback((userData: AuthUser) => {
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiClient.post("/auth/logout");
        } catch {
            // Ignore network errors on logout — cookie may already be gone
        }
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const value: AuthContextValue = {
        isAuthenticated,
        isLoading,
        user,
        onLoginSuccess,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    const ctx = React.useContext(AuthContext);
    if (ctx === null) {
        throw new Error("useAuth must be used within AuthTokenProvider");
    }
    return ctx;
}

/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback } from "react";
import { AUTH_STORAGE_KEY } from "../../lib/authToken";

type AuthTokenContextValue = {
    token: string | null;
    setToken: (value: string) => void;
    clearToken: () => void;
};

const AuthTokenContext = React.createContext<AuthTokenContextValue | null>(null);

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [token, setTokenState] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        console.log(`🔑 AuthTokenProvider: Initializing from storage... Found: ${stored ? 'YES' : 'NO'}`);
        setTokenState(stored);
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated || !token) return;
        localStorage.setItem(AUTH_STORAGE_KEY, token);
    }, [token, isHydrated]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-ds-bg flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ds-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const setToken = useCallback((value: string) => {
        setTokenState(value);
        localStorage.setItem(AUTH_STORAGE_KEY, value);
    }, []);

    const clearToken = useCallback(() => {
        setTokenState(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }, []);

    const value: AuthTokenContextValue = { token, setToken, clearToken };

    return (
        <AuthTokenContext.Provider value={value}>
            {children}
        </AuthTokenContext.Provider>
    );
}

export function useAuthToken(): AuthTokenContextValue {
    const ctx = React.useContext(AuthTokenContext);
    if (ctx === null) {
        throw new Error("useAuthToken must be used within AuthTokenProvider");
    }
    return ctx;
}

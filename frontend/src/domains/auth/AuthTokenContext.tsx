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
    const [token, setTokenState] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(AUTH_STORAGE_KEY);
    });

    useEffect(() => {
        if (!token) return;
        localStorage.setItem(AUTH_STORAGE_KEY, token);
    }, [token]);

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

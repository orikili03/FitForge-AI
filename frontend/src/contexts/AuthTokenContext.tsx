import React, { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "wodlab_token";

type AuthTokenContextValue = {
  token: string | null;
  setToken: (value: string) => void;
  clearToken: () => void;
};

const AuthTokenContext = React.createContext<AuthTokenContextValue | null>(null);

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (!token) return;
    localStorage.setItem(STORAGE_KEY, token);
  }, [token]);

  const setToken = useCallback((value: string) => {
    setTokenState(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const clearToken = useCallback(() => {
    setTokenState(null);
    localStorage.removeItem(STORAGE_KEY);
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

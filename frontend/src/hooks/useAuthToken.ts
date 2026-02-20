import { useState, useEffect } from "react";

const STORAGE_KEY = "fitforge_token";

export function useAuthToken() {
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (!token) return;
    localStorage.setItem(STORAGE_KEY, token);
  }, [token]);

  const setToken = (value: string) => {
    setTokenState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const clearToken = () => {
    setTokenState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { token, setToken, clearToken };
}


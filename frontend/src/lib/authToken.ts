export const AUTH_STORAGE_KEY = "wodlab_auth_token";

export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
}

export function removeAuthToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Legacy auth token utilities.
 *
 * JWT is now stored in an HttpOnly cookie (set by the backend).
 * These functions exist only for migration cleanup — removing any
 * old tokens from localStorage on first load after the upgrade.
 */

export const AUTH_STORAGE_KEY = "wodlab_auth_token";

/** Remove any legacy token from localStorage (migration cleanup). */
export function clearLegacyToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

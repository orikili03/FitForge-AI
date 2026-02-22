/** Single source of truth for auth token storage key (used by apiClient and AuthTokenContext). */
export const AUTH_STORAGE_KEY = "wodlab_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEY);
}


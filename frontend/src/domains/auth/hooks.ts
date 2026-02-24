import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { setAuthToken } from '../../lib/authToken';

/**
 * Simple type for the login response payload.
 */
export type LoginResponse = {
    token: string;
};

/**
 * Hook for logging in.
 * Expects { email, password } and on success stores the token.
 */
export function useLogin(): UseMutationResult<LoginResponse, Error, { email: string; password: string }, unknown> {
    return useMutation<LoginResponse, Error, { email: string; password: string }>({
        mutationFn: async (credentials) => {
            const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            setAuthToken(data.token);
        },
        onError: () => {
            // UI layer can read mutation error
        },
    });
}

/**
 * Hook for registering a new user.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRegister(): UseMutationResult<any, Error, { email: string; password: string }, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useMutation<any, Error, { email: string; password: string }>({
        mutationFn: async (payload) => {
            const response = await apiClient.post('/auth/register', payload);
            return response.data;
        },
        onSuccess: (data) => {
            // If the API returns a token on register, store it
            if (data?.token) setAuthToken(data.token);
        },
    });
}

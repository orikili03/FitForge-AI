import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { useAuthToken } from './AuthTokenContext';

/**
 * Simple type for the login response payload.
 */
export type LoginResponse = {
    token: string;
};

/**
 * Hook for logging in.
 * Expects { email, password } and on success stores the token in context.
 */
export function useLogin(): UseMutationResult<LoginResponse, Error, { email: string; password: string }, unknown> {
    const { setToken } = useAuthToken();

    return useMutation<LoginResponse, Error, { email: string; password: string }>({
        mutationFn: async (credentials) => {
            const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            setToken(data.token);
        },
    });
}

/**
 * Hook for registering a new user.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRegister(): UseMutationResult<any, Error, { email: string; password: string }, unknown> {
    const { setToken } = useAuthToken();

    return useMutation<any, Error, { email: string; password: string }>({
        mutationFn: async (payload) => {
            const response = await apiClient.post('/auth/register', payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.token) setToken(data.token);
        },
    });
}

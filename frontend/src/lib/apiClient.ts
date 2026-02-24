import axios from "axios";
import { getAuthToken } from "./authToken";

const baseURL =
    typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL
        : "";

export const apiClient = axios.create({
    baseURL,
});

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

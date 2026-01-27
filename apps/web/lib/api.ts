import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = typeof window !== "undefined" 
    ? "/api/v1" 
    : (process.env.FRONTEND_URL || "http://localhost:3000") + "/api/v1";

if (typeof window !== "undefined") {
    console.log("🚀 Auth API URL:", API_URL);
}

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage (auth-storage from Zustand persist)
        if (typeof window !== "undefined") {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                try {
                    const parsed = JSON.parse(authStorage);
                    const accessToken = parsed?.state?.accessToken;
                    if (accessToken) {
                        config.headers.Authorization = `Bearer ${accessToken}`;
                    }
                } catch {
                    // Ignore parse errors
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get refresh token
                const authStorage = localStorage.getItem("auth-storage");
                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    const refreshToken = parsed?.state?.refreshToken;

                    if (refreshToken) {
                        // Try to refresh
                        const response = await axios.post(`${API_URL}/auth/refresh`, {
                            refreshToken,
                        });

                        const { accessToken, refreshToken: newRefreshToken } = response.data;

                        // Update storage
                        parsed.state.accessToken = accessToken;
                        parsed.state.refreshToken = newRefreshToken;
                        localStorage.setItem("auth-storage", JSON.stringify(parsed));

                        // Retry original request
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh failed, clear storage and redirect to login
                localStorage.removeItem("auth-storage");
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper type for API errors
export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, any>;
}

// Extract error message from axios error
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: ApiError; message?: string }>;
        return (
            axiosError.response?.data?.error?.message ||
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Có lỗi xảy ra"
        );
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Có lỗi xảy ra";
}

export default api;

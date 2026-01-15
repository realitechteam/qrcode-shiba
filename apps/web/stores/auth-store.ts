import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokens: () => Promise<void>;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post<{
                        user: User;
                        accessToken: string;
                        refreshToken: string;
                    }>("/auth/login", { email, password });

                    set({
                        user: response.data.user,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (email: string, password: string, name?: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post<{
                        user: User;
                        accessToken: string;
                        refreshToken: string;
                    }>("/auth/register", { email, password, name });

                    set({
                        user: response.data.user,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.post("/auth/logout");
                } catch {
                    // Ignore errors on logout
                } finally {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });
                }
            },

            refreshTokens: async () => {
                const { refreshToken } = get();
                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                try {
                    const response = await api.post<{
                        accessToken: string;
                        refreshToken: string;
                    }>("/auth/refresh", { refreshToken });

                    set({
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                    });
                } catch (error) {
                    // Refresh failed, logout user
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            setTokens: (accessToken: string, refreshToken: string) => {
                set({ accessToken, refreshToken, isAuthenticated: true });
            },

            setUser: (user: User) => {
                set({ user, isAuthenticated: true });
            },

            fetchUser: async () => {
                try {
                    const response = await api.get<User>("/auth/me");
                    set({ user: response.data, isAuthenticated: true });
                } catch {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

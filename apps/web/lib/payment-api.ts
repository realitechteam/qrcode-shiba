import axios from "axios";

const PAYMENT_API_URL =
    process.env.NEXT_PUBLIC_PAYMENT_API_URL ||
    "https://pay.shiba.pw/api/v1";

export const paymentApi = axios.create({
    baseURL: PAYMENT_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token from auth storage
paymentApi.interceptors.request.use((config) => {
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
});

export default paymentApi;

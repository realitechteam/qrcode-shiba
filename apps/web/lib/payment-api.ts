import axios from "axios";

const PAYMENT_API_URL =
    process.env.NEXT_PUBLIC_PAYMENT_API_URL ||
    "https://payment-service-production.up.railway.app/api/v1";

export const paymentApi = axios.create({
    baseURL: PAYMENT_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add user ID from auth storage
paymentApi.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                const userId = parsed?.state?.user?.id;
                if (userId) {
                    config.headers["x-user-id"] = userId;
                }
            } catch {
                // Ignore parse errors
            }
        }
    }
    return config;
});

export default paymentApi;

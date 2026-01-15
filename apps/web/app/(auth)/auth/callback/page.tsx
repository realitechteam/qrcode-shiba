"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setTokens, fetchUser } = useAuthStore();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const error = searchParams.get("error");

        if (error) {
            router.push(`/login?error=${encodeURIComponent(error)}`);
            return;
        }

        if (accessToken && refreshToken) {
            setTokens(accessToken, refreshToken);
            fetchUser().then(() => {
                router.push("/dashboard");
            });
        } else {
            router.push("/login");
        }
    }, [searchParams, setTokens, fetchUser, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-shiba-500 mb-4" />
                <p className="text-muted-foreground">Đang xác thực...</p>
            </div>
        </div>
    );
}

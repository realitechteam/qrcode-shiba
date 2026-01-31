"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QrCode, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { signInWithGoogle } from "@/lib/firebase";
import { useTranslation } from "@/lib/i18n/index";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { requestMagicLink, isLoading, setUser, setTokens } = useAuthStore();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [sentEmail, setSentEmail] = useState("");
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await requestMagicLink(data.email);
            setSentEmail(data.email);
            setIsSuccess(true);
            toast({
                title: t("auth.emailSent"),
                description: t("auth.checkEmail"),
            });
        } catch (error: any) {
            toast({
                title: t("common.error"),
                description: error.response?.data?.message || t("common.error"),
                variant: "destructive",
            });
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const firebaseUser = await signInWithGoogle();

            // Sync Firebase user with backend to get database user ID
            const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://auth-service-production-431d.up.railway.app/api/v1";
            console.log("🚀 Sync API URL:", API_URL);
            const syncResponse = await fetch(`${API_URL}/auth/firebase/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                    firebaseUid: firebaseUser.uid,
                    photoUrl: firebaseUser.photoURL,
                }),
            });

            if (!syncResponse.ok) {
                throw new Error("Failed to sync user with backend");
            }

            const data = await syncResponse.json();

            // Set user with database ID (not Firebase UID)
            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                avatarUrl: data.user.avatarUrl,
                emailVerified: data.user.emailVerified,
                createdAt: data.user.createdAt,
            });

            // Store backend tokens
            setTokens(data.accessToken, data.refreshToken);

            toast({
                title: t("common.success"),
                description: `${t("auth.loginTitle")} ${data.user.name || data.user.email}!`,
            });

            router.push("/dashboard/qr");
        } catch (error: any) {
            console.error("Google login error:", error);
            toast({
                title: t("common.error"),
                description: error.message || t("common.error"),
                variant: "destructive",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md bg-card rounded-2xl border shadow-lg p-8 text-center animate-scale-in">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">{t("auth.checkEmail")}</h2>
                    <p className="text-muted-foreground mb-6">
                        {t("auth.emailSent")} <strong>{sentEmail}</strong>.<br />
                        {t("auth.clickLink")}
                    </p>

                    <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mb-6">
                        <p className="mb-2">{t("auth.noEmail")}</p>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="text-shiba-500 hover:text-shiba-600 font-medium hover:underline"
                        >
                            {t("auth.tryAgain")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-shiba-500 to-shiba-600">
                                <QrCode className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold">
                                QRCode-<span className="text-shiba-500">Shiba</span>
                            </span>
                        </Link>
                    </div>

                    {/* Form */}
                    <div className="bg-card rounded-2xl border p-8 shadow-lg">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
                            <p className="text-muted-foreground mt-1">
                                {t("auth.loginSubtitle")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="w-full rounded-lg border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 disabled:opacity-50"
                                        disabled={isLoading}
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full bg-shiba-500 hover:bg-shiba-600"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("auth.sendingLink")}
                                    </>
                                ) : (
                                    t("auth.sendLoginLink")
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 border-t" />
                            <span className="text-xs text-muted-foreground">{t("auth.orContinueWith")}</span>
                            <div className="flex-1 border-t" />
                        </div>

                        {/* Social Login */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={isGoogleLoading || isLoading}
                            onClick={handleGoogleLogin}
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            {isGoogleLoading ? t("auth.loggingIn") : t("auth.loginWithGoogle")}
                        </Button>

                    </div>
                </div>
            </div>

            {/* Right side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-shiba-500 to-shiba-600 items-center justify-center p-12">
                <div className="max-w-md text-white text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <QrCode className="h-20 w-20" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                        {t("home.hero.title")} {t("home.hero.titleHighlight")}
                    </h2>
                    <p className="text-shiba-100">
                        {t("home.hero.subtitle")}
                    </p>
                </div>
            </div>
        </div>
    );
}

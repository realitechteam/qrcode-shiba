"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrPreview?: string;
}

export function SignupModal({ isOpen, onClose, qrPreview }: SignupModalProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { setUser, setTokens } = useAuthStore();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        setError("");
        try {
            // 1. Sign in with Firebase
            const firebaseUser = await signInWithGoogle();

            // 2. Sync Firebase user with backend to get database user ID and tokens
            const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
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
                throw new Error("Không thể đồng bộ với server");
            }

            const data = await syncResponse.json();

            // 3. Set user in auth-store (persisted to localStorage)
            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                avatarUrl: data.user.avatarUrl,
                emailVerified: data.user.emailVerified,
                createdAt: data.user.createdAt,
            });

            // 4. Store backend tokens
            setTokens(data.accessToken, data.refreshToken);

            toast({
                title: "Đăng ký thành công!",
                description: `Chào mừng ${data.user.name || data.user.email}!`,
            });

            // 5. Redirect to dashboard - pending QR will be processed there
            router.push("/dashboard/qr");
        } catch (err: any) {
            console.error("Google signup error:", err);
            setError(err.message || "Đăng ký thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignup = (e: React.FormEvent) => {
        e.preventDefault();
        // Redirect to register page with email prefilled
        router.push(`/register?email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                {/* QR Preview Header */}
                {qrPreview && (
                    <div className="bg-gradient-to-br from-shiba-50 to-shiba-100 dark:from-shiba-900/30 dark:to-shiba-800/30 p-6 flex justify-center">
                        <img
                            src={qrPreview}
                            alt="QR Preview"
                            className="h-32 w-32 rounded-lg shadow-lg"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>

                    <h2 className="text-2xl font-bold mb-2">Bước cuối cùng</h2>
                    <p className="text-muted-foreground mb-6">
                        Để tải QR code, bạn cần tạo tài khoản miễn phí.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email Form */}
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">
                                Nhập địa chỉ email của bạn
                            </label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                    className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                                <Button
                                    type="submit"
                                    className="bg-shiba-500 hover:bg-shiba-600"
                                >
                                    Đăng ký
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-card px-4 text-muted-foreground">hoặc</span>
                        </div>
                    </div>

                    {/* Google Signup */}
                    <Button
                        variant="outline"
                        className="w-full gap-3 py-5"
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                        {isLoading ? "Đang đăng ký..." : "Đăng ký bằng Google"}
                    </Button>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Đã có tài khoản?{" "}
                        <Link href="/login" className="text-shiba-500 hover:underline font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

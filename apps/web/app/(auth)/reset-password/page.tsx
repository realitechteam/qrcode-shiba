"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "@/lib/api";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"form" | "success" | "error">(
        token ? "form" : "error"
    );
    const [errorMessage, setErrorMessage] = useState(
        token ? "" : "Link không hợp lệ hoặc bị thiếu"
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (password.length < 8) {
            setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/reset-password", { token, password });
            setStatus("success");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(
                err.response?.data?.message || "Link đã hết hạn hoặc không hợp lệ"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-card rounded-2xl border shadow-lg p-8 animate-scale-in">
                {status === "form" && (
                    <>
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-shiba-100 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-shiba-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Đặt lại mật khẩu</h2>
                            <p className="text-muted-foreground">
                                Nhập mật khẩu mới cho tài khoản của bạn.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Mật khẩu mới
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ít nhất 8 ký tự"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    disabled={isLoading}
                                    minLength={8}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="text-sm font-medium">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    disabled={isLoading}
                                    minLength={8}
                                />
                            </div>

                            {errorMessage && (
                                <p className="text-sm text-red-500">{errorMessage}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || !password || !confirmPassword}
                                className="w-full bg-shiba-500 hover:bg-shiba-600 h-12"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Đặt lại mật khẩu"
                                )}
                            </Button>
                        </form>
                    </>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce-in" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Mật khẩu đã được đặt lại!</h2>
                        <p className="text-muted-foreground">
                            Đang chuyển hướng đến trang đăng nhập...
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-8 h-8 text-red-600 animate-shake" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Đặt lại thất bại</h2>
                        <p className="text-muted-foreground mb-6">
                            {errorMessage}
                        </p>
                        <Link href="/forgot-password">
                            <Button className="w-full bg-shiba-500 hover:bg-shiba-600">
                                Thử lại
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md bg-card rounded-2xl border shadow-lg p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-shiba-100 rounded-full flex items-center justify-center mb-6">
                        <Loader2 className="w-8 h-8 text-shiba-600 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Đang tải...</h2>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

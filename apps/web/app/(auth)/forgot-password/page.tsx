"use client";

import { useState } from "react";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !email.includes("@")) {
            setError("Vui lòng nhập email hợp lệ");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setIsSent(true);
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-card rounded-2xl border shadow-lg p-8 animate-scale-in">
                {isSent ? (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Kiểm tra email của bạn</h2>
                        <p className="text-muted-foreground mb-6">
                            Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.
                            Vui lòng kiểm tra hộp thư (và thư mục spam).
                        </p>
                        <Link href="/login">
                            <Button variant="outline" className="w-full gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Quay lại đăng nhập
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-shiba-100 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-shiba-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Quên mật khẩu?</h2>
                            <p className="text-muted-foreground">
                                Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full bg-shiba-500 hover:bg-shiba-600 h-12"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    "Gửi link đặt lại mật khẩu"
                                )}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-muted-foreground hover:text-shiba-500 transition-colors"
                                >
                                    <span className="inline-flex items-center gap-1">
                                        <ArrowLeft className="h-3 w-3" />
                                        Quay lại đăng nhập
                                    </span>
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

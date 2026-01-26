"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { verifyMagicLink } = useAuthStore();
    
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Link không hợp lệ hoặc bị thiếu");
            return;
        }

        const verify = async () => {
            try {
                await verifyMagicLink(token);
                setStatus("success");
                
                // Redirect after short delay
                setTimeout(() => {
                    router.push("/dashboard/qr");
                }, 2000);
            } catch (error: any) {
                setStatus("error");
                setErrorMessage(error.response?.data?.message || "Link đã hết hạn hoặc không hợp lệ");
            }
        };

        verify();
    }, [token, verifyMagicLink, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-card rounded-2xl border shadow-lg p-8 text-center animate-scale-in">
                {status === "verifying" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-shiba-100 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-shiba-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Đang xác thực...</h2>
                        <p className="text-muted-foreground">
                            Vui lòng đợi trong giây lát, chúng tôi đang đăng nhập cho bạn.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce-in" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Đăng nhập thành công!</h2>
                        <p className="text-muted-foreground">
                            Đang chuyển hướng đến Dashboard...
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-8 h-8 text-red-600 animate-shake" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Đăng nhập thất bại</h2>
                        <p className="text-muted-foreground mb-6">
                            {errorMessage}
                        </p>
                        <Link href="/login">
                            <Button className="w-full bg-shiba-500 hover:bg-shiba-600">
                                Quay lại đăng nhập
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

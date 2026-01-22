"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "failed" | "invalid">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const statusParam = searchParams.get("status");
        const messageParam = searchParams.get("message");

        if (statusParam === "success") {
            setStatus("success");
        } else if (statusParam === "failed") {
            setStatus("failed");
            setMessage(messageParam || "Thanh toán không thành công");
        } else if (statusParam === "invalid") {
            setStatus("invalid");
            setMessage("Giao dịch không hợp lệ");
        } else {
            // Handle VNPay direct return
            const vnpResponseCode = searchParams.get("vnp_ResponseCode");
            if (vnpResponseCode === "00") {
                setStatus("success");
            } else if (vnpResponseCode) {
                setStatus("failed");
                setMessage("Giao dịch không thành công");
            } else {
                setStatus("invalid");
            }
        }
    }, [searchParams]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-shiba-500" />
                    <p className="mt-4 text-muted-foreground">Đang xử lý...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {status === "success" ? (
                    <>
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
                        <p className="text-muted-foreground mb-8">
                            Cảm ơn bạn đã nâng cấp. Tài khoản của bạn đã được kích hoạt gói mới.
                        </p>
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-shiba-500 hover:bg-shiba-600 gap-2"
                                onClick={() => router.push("/dashboard")}
                            >
                                Đi đến Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/dashboard/qr/new")}
                            >
                                Tạo QR Code mới
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
                            <XCircle className="h-10 w-10" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">
                            {status === "invalid" ? "Giao dịch không hợp lệ" : "Thanh toán thất bại"}
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            {message || "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."}
                        </p>
                        <div className="space-y-3">
                            <Button
                                className="w-full bg-shiba-500 hover:bg-shiba-600"
                                onClick={() => router.push("/pricing")}
                            >
                                Thử lại
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/dashboard")}
                            >
                                Quay lại Dashboard
                            </Button>
                        </div>
                    </>
                )}

                <p className="mt-8 text-sm text-muted-foreground">
                    Cần hỗ trợ?{" "}
                    <Link href="/contact" className="text-shiba-500 hover:underline">
                        Liên hệ với chúng tôi
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-shiba-500" />
                    <p className="mt-4 text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        }>
            <PaymentResultContent />
        </Suspense>
    );
}

"use client";

import { useRouter } from "next/navigation";
import { Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2 animate-fade-in"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>

                {/* Header */}
                <div className="text-center mb-12 animate-slide-up">
                    <div className="w-16 h-16 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                        <Scale className="h-8 w-8 text-shiba-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Điều khoản sử dụng</h1>
                    <p className="text-muted-foreground">Cập nhật lần cuối: 31/01/2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">1. Chấp nhận điều khoản</h2>
                        <p className="text-muted-foreground">
                            Bằng việc truy cập và sử dụng dịch vụ QRCode-Shiba, bạn đồng ý tuân thủ
                            các điều khoản và điều kiện được nêu trong tài liệu này. Nếu bạn không
                            đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ.
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">2. Mô tả dịch vụ</h2>
                        <p className="text-muted-foreground">
                            QRCode-Shiba cung cấp nền tảng tạo và quản lý mã QR code, bao gồm:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>Tạo QR code tĩnh và động</li>
                            <li>Tùy chỉnh giao diện QR code</li>
                            <li>Theo dõi và phân tích lượt quét</li>
                            <li>API tích hợp cho doanh nghiệp</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">3. Tài khoản người dùng</h2>
                        <p className="text-muted-foreground">
                            Bạn có trách nhiệm bảo mật thông tin tài khoản của mình. Mọi hoạt động
                            xảy ra dưới tài khoản của bạn là trách nhiệm của bạn. Vui lòng thông báo
                            cho chúng tôi ngay nếu phát hiện truy cập trái phép.
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">4. Nội dung bị cấm</h2>
                        <p className="text-muted-foreground">
                            Bạn không được sử dụng dịch vụ để tạo QR code chứa nội dung:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>Vi phạm pháp luật Việt Nam</li>
                            <li>Phishing, lừa đảo, malware</li>
                            <li>Nội dung khiêu dâm, bạo lực</li>
                            <li>Vi phạm bản quyền, nhãn hiệu</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">5. Thanh toán & hoàn tiền</h2>
                        <p className="text-muted-foreground">
                            Các gói trả phí được thanh toán theo chu kỳ tháng hoặc năm. Chúng tôi
                            hỗ trợ hoàn tiền trong vòng 7 ngày kể từ ngày thanh toán nếu bạn không
                            hài lòng với dịch vụ.
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">6. Liên hệ</h2>
                        <p className="text-muted-foreground">
                            Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:{" "}
                            <a href="mailto:support@shiba.pw" className="text-shiba-500 hover:underline">
                                support@shiba.pw
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { QrCode, Users, Target, Shield, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            {/* Hero */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2 animate-fade-in"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <div className="text-center animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-shiba-500/10 text-shiba-600 text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            Về chúng tôi
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Nền tảng QR Code{" "}
                            <span className="text-shiba-500">hiện đại</span> cho doanh nghiệp Việt Nam
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            QRCode-Shiba được phát triển với sứ mệnh mang đến giải pháp QR code
                            chuyên nghiệp, dễ sử dụng và phù hợp với nhu cầu của doanh nghiệp Việt.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 px-4 bg-muted/30">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-14 h-14 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                                <Target className="h-7 w-7 text-shiba-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Sứ mệnh</h3>
                            <p className="text-muted-foreground">
                                Giúp mọi doanh nghiệp Việt Nam tiếp cận công nghệ QR code
                                một cách dễ dàng và hiệu quả.
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-14 h-14 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-7 w-7 text-shiba-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Đội ngũ</h3>
                            <p className="text-muted-foreground">
                                Đội ngũ kỹ sư và designers đam mê công nghệ,
                                tập trung vào trải nghiệm người dùng.
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-14 h-14 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-7 w-7 text-shiba-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Cam kết</h3>
                            <p className="text-muted-foreground">
                                Bảo mật dữ liệu, uptime 99.9%, và hỗ trợ khách hàng
                                tận tình 24/7.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Us */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn QRCode-Shiba?</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4 p-6 rounded-2xl border bg-card">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Tốc độ nhanh chóng</h3>
                                <p className="text-muted-foreground">Tạo QR code trong vài giây, không cần đăng ký cho QR tĩnh.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 rounded-2xl border bg-card">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Analytics chi tiết</h3>
                                <p className="text-muted-foreground">Theo dõi lượt quét real-time, phân tích theo vị trí, thiết bị.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 rounded-2xl border bg-card">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <span className="text-2xl">🎨</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Tùy chỉnh linh hoạt</h3>
                                <p className="text-muted-foreground">Logo, màu sắc, kiểu dáng - tất cả trong tầm tay bạn.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
                    <p className="text-muted-foreground mb-6">
                        Tạo QR code đầu tiên của bạn miễn phí ngay hôm nay.
                    </p>
                    <Link href="/login">
                        <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                            Bắt đầu miễn phí
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

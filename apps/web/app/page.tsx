import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeQRGenerator } from "@/components/HomeQRGenerator";
import { AuthHeader } from "@/components/AuthHeader";
import { QrCode, ArrowRight, Zap, BarChart3, Palette, Globe, Check } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Header with Auth State */}
            <AuthHeader />

            {/* Hero Section with QR Generator */}
            <section className="relative overflow-hidden py-12 md:py-20">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,hsl(24,100%,53%,0.1),transparent)]" />

                <div className="container">
                    {/* Title */}
                    <div className="text-center mb-10">
                        <div className="mb-4 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
                            <Zap className="mr-2 h-4 w-4 text-shiba-500" />
                            <span>Tạo QR Code miễn phí - Không cần đăng ký</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            Tạo mã QR{" "}
                            <span className="text-gradient">chuyên nghiệp</span>
                            <br className="hidden md:block" />
                            trong vài giây
                        </h1>

                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Nền tảng tạo QR code miễn phí cho mọi nhu cầu. Tùy chỉnh màu sắc,
                            tải về ngay - không cần thẻ tín dụng.
                        </p>
                    </div>

                    {/* QR Generator Component */}
                    <HomeQRGenerator />
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-muted/30">
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <Check className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">Miễn phí 100%</h3>
                            <p className="text-sm text-muted-foreground">
                                Tạo QR code không giới hạn, không cần thanh toán
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">Nhanh chóng</h3>
                            <p className="text-sm text-muted-foreground">
                                Tạo QR trong 3 giây, preview realtime
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <Palette className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">Tùy chỉnh dễ dàng</h3>
                            <p className="text-sm text-muted-foreground">
                                Thêm màu sắc, logo theo thương hiệu
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Tại sao chọn QRCode-Shiba?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Giải pháp QR code toàn diện được thiết kế riêng cho thị trường Việt Nam
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<Palette className="h-6 w-6" />}
                            title="Tùy chỉnh không giới hạn"
                            description="Thêm logo, màu sắc, patterns theo thương hiệu của bạn"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6" />}
                            title="Analytics real-time"
                            description="Theo dõi lượt quét, vị trí, thiết bị chi tiết"
                        />
                        <FeatureCard
                            icon={<Zap className="h-6 w-6" />}
                            title="Dynamic QR Code"
                            description="Thay đổi đích đến mà không cần in lại"
                        />
                        <FeatureCard
                            icon={<Globe className="h-6 w-6" />}
                            title="Tích hợp Việt Nam"
                            description="VNPay, MoMo, Zalo và các dịch vụ nội địa"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container">
                    <div className="rounded-3xl bg-gradient-to-br from-shiba-500 to-shiba-600 p-12 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">
                            Muốn theo dõi lượt quét QR?
                        </h2>
                        <p className="text-shiba-100 mb-8 max-w-2xl mx-auto">
                            Đăng ký miễn phí để tạo Dynamic QR Code với analytics chi tiết.
                        </p>
                        <Link href="/register">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-white text-shiba-600 hover:bg-shiba-50 gap-2"
                            >
                                Tạo tài khoản miễn phí
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 mt-auto">
                <div className="container">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-shiba-500 to-shiba-600">
                                <QrCode className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold">QRCode-Shiba</span>
                        </div>

                        <nav className="flex gap-6 text-sm text-muted-foreground">
                            <Link href="/about" className="hover:text-foreground">Về chúng tôi</Link>
                            <Link href="/terms" className="hover:text-foreground">Điều khoản</Link>
                            <Link href="/privacy" className="hover:text-foreground">Bảo mật</Link>
                            <Link href="/contact" className="hover:text-foreground">Liên hệ</Link>
                        </nav>

                        <p className="text-sm text-muted-foreground">
                            © 2024 QRCode-Shiba. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-shiba-100 text-shiba-600 dark:bg-shiba-900/30 dark:text-shiba-400">
                {icon}
            </div>
            <h3 className="mb-2 font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

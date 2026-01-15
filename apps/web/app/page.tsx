import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowRight, Zap, BarChart3, Palette, Globe } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-shiba-500 to-shiba-600">
                            <QrCode className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">
                            QRCode-<span className="text-shiba-500">Shiba</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/features"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Tính năng
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Bảng giá
                        </Link>
                        <Link
                            href="/api-docs"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            API
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm" className="bg-shiba-500 hover:bg-shiba-600">
                                Bắt đầu miễn phí
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-32">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,hsl(24,100%,53%,0.1),transparent)]" />

                <div className="container text-center">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
                            <Zap className="mr-2 h-4 w-4 text-shiba-500" />
                            <span>Mới: Tích hợp VNPay & MoMo</span>
                        </div>

                        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                            Tạo mã QR{" "}
                            <span className="text-gradient">thông minh</span>
                            <br />
                            cho doanh nghiệp Việt Nam
                        </h1>

                        <p className="mb-10 text-lg text-muted-foreground md:text-xl">
                            Nền tảng tạo và quản lý mã QR code hiện đại. Tùy chỉnh với logo,
                            theo dõi lượt quét real-time, và tích hợp dễ dàng với hệ thống của bạn.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register">
                                <Button size="lg" className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                                    Tạo QR Code miễn phí
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline" className="gap-2">
                                    Xem demo
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* QR Code Preview */}
                    <div className="mt-16 relative">
                        <div className="mx-auto max-w-4xl rounded-2xl border bg-card p-8 shadow-2xl">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">URL của bạn</label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                        />
                                    </div>
                                    <Button className="w-full bg-shiba-500 hover:bg-shiba-600">
                                        Tạo QR Code
                                    </Button>
                                </div>
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-shiba-100 to-shiba-200 dark:from-shiba-900/30 dark:to-shiba-800/30 flex items-center justify-center">
                                            <QrCode className="h-24 w-24 text-shiba-500" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 rounded-full bg-green-500 p-2">
                                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/50">
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
                            Sẵn sàng tạo QR Code đầu tiên?
                        </h2>
                        <p className="text-shiba-100 mb-8 max-w-2xl mx-auto">
                            Bắt đầu miễn phí ngay hôm nay. Không cần thẻ tín dụng.
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
            <footer className="border-t py-12">
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

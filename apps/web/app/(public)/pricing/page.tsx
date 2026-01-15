"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Check,
    X,
    Sparkles,
    Building2,
    Crown,
    Zap,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const plans = [
    {
        id: "free",
        name: "Miễn phí",
        description: "Dành cho cá nhân bắt đầu",
        monthlyPrice: 0,
        yearlyPrice: 0,
        icon: Zap,
        popular: false,
        features: [
            { name: "Không giới hạn QR codes tĩnh", included: true },
            { name: "3 QR codes động", included: true },
            { name: "Tùy chỉnh màu sắc cơ bản", included: true },
            { name: "Xuất PNG", included: true },
            { name: "100 lượt quét/tháng", included: true },
            { name: "Analytics nâng cao", included: false },
            { name: "API Access", included: false },
            { name: "Custom domain", included: false },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        description: "Dành cho freelancers và startups",
        monthlyPrice: 99000,
        yearlyPrice: 990000,
        icon: Sparkles,
        popular: true,
        features: [
            { name: "50 QR codes động", included: true },
            { name: "Tùy chỉnh logo và kiểu dáng", included: true },
            { name: "Xuất PNG, SVG, PDF", included: true },
            { name: "10,000 lượt quét/tháng", included: true },
            { name: "Analytics nâng cao", included: true },
            { name: "10 thư mục", included: true },
            { name: "API Access", included: false },
            { name: "Custom domain", included: false },
        ],
    },
    {
        id: "business",
        name: "Business",
        description: "Dành cho doanh nghiệp vừa và nhỏ",
        monthlyPrice: 299000,
        yearlyPrice: 2990000,
        icon: Building2,
        popular: false,
        features: [
            { name: "500 QR codes động", included: true },
            { name: "Bulk QR generation", included: true },
            { name: "100,000 lượt quét/tháng", included: true },
            { name: "API Access", included: true },
            { name: "Thư mục không giới hạn", included: true },
            { name: "5 thành viên team", included: true },
            { name: "Hỗ trợ ưu tiên", included: true },
            { name: "Custom domain", included: false },
        ],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Dành cho doanh nghiệp lớn",
        monthlyPrice: 999000,
        yearlyPrice: 9990000,
        icon: Crown,
        popular: false,
        features: [
            { name: "QR codes không giới hạn", included: true },
            { name: "Lượt quét không giới hạn", included: true },
            { name: "Custom domain", included: true },
            { name: "Thành viên không giới hạn", included: true },
            { name: "SSO / SAML", included: true },
            { name: "SLA 99.9%", included: true },
            { name: "Account manager riêng", included: true },
            { name: "Onboarding support", included: true },
        ],
    },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [loading, setLoading] = useState<string | null>(null);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubscribe = async (planId: string, provider: "vnpay" | "momo") => {
        if (!isAuthenticated) {
            router.push("/login?redirect=/pricing");
            return;
        }

        if (planId === "free") {
            router.push("/dashboard");
            return;
        }

        setLoading(`${planId}-${provider}`);

        try {
            const response = await api.post(`/payment/${provider}/create-payment`, {
                planId,
                billingCycle,
            });

            window.location.href = response.data.paymentUrl;
        } catch (error: any) {
            toast({
                title: "Lỗi thanh toán",
                description: error.response?.data?.message || "Có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Chọn gói phù hợp với bạn
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Bắt đầu miễn phí và nâng cấp khi cần. Tất cả các gói đều bao gồm
                        hỗ trợ qua email và cập nhật tính năng mới.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span
                        className={cn("text-sm", billingCycle === "monthly" && "font-medium")}
                    >
                        Hàng tháng
                    </span>
                    <button
                        onClick={() =>
                            setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
                        }
                        className={cn(
                            "relative w-14 h-7 rounded-full transition-colors",
                            billingCycle === "yearly" ? "bg-shiba-500" : "bg-muted-foreground/30"
                        )}
                    >
                        <span
                            className={cn(
                                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform",
                                billingCycle === "yearly" && "translate-x-7"
                            )}
                        />
                    </button>
                    <span
                        className={cn("text-sm", billingCycle === "yearly" && "font-medium")}
                    >
                        Hàng năm
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Tiết kiệm 17%
                        </span>
                    </span>
                </div>

                {/* Plans grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const price =
                            billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative rounded-2xl border bg-card p-6 flex flex-col",
                                    plan.popular && "border-shiba-500 ring-2 ring-shiba-500/20"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-shiba-500 text-white text-xs font-medium">
                                        Phổ biến nhất
                                    </div>
                                )}

                                <div className="mb-4">
                                    <div
                                        className={cn(
                                            "inline-flex p-2 rounded-lg mb-3",
                                            plan.popular
                                                ? "bg-shiba-500 text-white"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-3xl font-bold">
                                        {price === 0 ? "Miễn phí" : formatPrice(price)}
                                    </span>
                                    {price > 0 && (
                                        <span className="text-muted-foreground">
                                            /{billingCycle === "monthly" ? "tháng" : "năm"}
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-6 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature.name} className="flex items-start gap-2">
                                            {feature.included ? (
                                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                                            )}
                                            <span
                                                className={cn(
                                                    "text-sm",
                                                    !feature.included && "text-muted-foreground/50"
                                                )}
                                            >
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.id === "free" ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push("/register")}
                                    >
                                        Bắt đầu miễn phí
                                    </Button>
                                ) : (
                                    <div className="space-y-2">
                                        <Button
                                            className={cn(
                                                "w-full gap-2",
                                                plan.popular
                                                    ? "bg-shiba-500 hover:bg-shiba-600"
                                                    : ""
                                            )}
                                            disabled={loading !== null}
                                            onClick={() => handleSubscribe(plan.id, "vnpay")}
                                        >
                                            {loading === `${plan.id}-vnpay` ? (
                                                "Đang xử lý..."
                                            ) : (
                                                <>
                                                    Thanh toán VNPay
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2"
                                            disabled={loading !== null}
                                            onClick={() => handleSubscribe(plan.id, "momo")}
                                        >
                                            {loading === `${plan.id}-momo`
                                                ? "Đang xử lý..."
                                                : "Thanh toán MoMo"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* FAQ or CTA */}
                <div className="mt-16 text-center">
                    <p className="text-muted-foreground mb-4">
                        Bạn cần tư vấn cho doanh nghiệp lớn?
                    </p>
                    <Link
                        href="/contact"
                        className="text-shiba-500 hover:text-shiba-600 font-medium"
                    >
                        Liên hệ sales →
                    </Link>
                </div>
            </div>
        </div>
    );
}

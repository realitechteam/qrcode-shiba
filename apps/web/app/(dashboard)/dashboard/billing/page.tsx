"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    CreditCard,
    Check,
    Zap,
    Building2,
    Crown,
    RefreshCw,
    X,
    Clock,
    Smartphone,
    ArrowRight,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/payment-service";

const plans = [
    {
        id: "free",
        name: "Free",
        price: "0đ",
        priceMonthly: 0,
        priceYearly: 0,
        period: "/tháng",
        description: "Dành cho cá nhân mới bắt đầu",
        features: [
            "5 QR Codes tĩnh",
            "100 lượt quét/tháng",
            "Tùy chỉnh màu cơ bản",
            "Tải PNG",
        ],
        icon: Zap,
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "99.000đ",
        priceMonthly: 99000,
        priceYearly: 990000,
        period: "/tháng",
        description: "Dành cho freelancer và startup",
        features: [
            "100 QR Codes",
            "QR Dynamic - thay đổi URL",
            "Unlimited lượt quét",
            "Analytics chi tiết",
            "Tải SVG chất lượng cao",
            "Logo trên QR",
        ],
        icon: Crown,
        popular: true,
    },
    {
        id: "business",
        name: "Business",
        price: "299.000đ",
        priceMonthly: 299000,
        priceYearly: 2990000,
        period: "/tháng",
        description: "Dành cho doanh nghiệp",
        features: [
            "500 QR Codes",
            "Tất cả tính năng Pro",
            "Tạo QR hàng loạt",
            "API access",
            "Export báo cáo",
            "Hỗ trợ ưu tiên",
        ],
        icon: Building2,
        popular: false,
    },
];

// Timer component
function CountdownTimer({ onExpire }: { onExpire: () => void }) {
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isUrgent = timeLeft < 60;

    return (
        <div className={`flex items-center justify-center gap-1.5 text-sm font-medium ${isUrgent ? "text-red-500" : "text-muted-foreground"}`}>
            <Clock className={`h-4 w-4 ${isUrgent ? "animate-pulse" : ""}`} />
            <span>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
        </div>
    );
}

export default function BillingPage() {
    const { user, getUserPlan } = useAuthStore();
    const { toast } = useToast();
    const currentPlan = getUserPlan();
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    // Modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalStep, setModalStep] = useState<1 | 2>(1); // Step 1: Select plan/cycle, Step 2: Show QR
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [orderId, setOrderId] = useState("");
    const [qrData, setQrData] = useState<{ qrUrl: string; amount: number; bankCode: string; accountNo: string; content: string } | null>(null);

    // Polling interval ref
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Cleanup polling on unmount or modal close
    useEffect(() => {
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, []);

    // Stop polling when modal closes
    useEffect(() => {
        if (!showPaymentModal && pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    }, [showPaymentModal]);

    const handleUpgrade = (plan: typeof plans[0]) => {
        if (plan.id === "free") return;
        setSelectedPlan(plan);
        setBillingCycle("monthly");
        setModalStep(1);
        setShowPaymentModal(true);
    };

    const handleConfirmPlan = async () => {
        if (!selectedPlan) return;

        setIsCreatingOrder(true);
        try {
            const response = await paymentService.createPayment(selectedPlan.id, billingCycle);
            
            if (response.success) {
                setOrderId(response.data.orderId);
                setQrData({
                    qrUrl: response.data.qrUrl,
                    amount: response.data.amount,
                    bankCode: response.data.bankCode,
                    accountNo: response.data.accountNo,
                    content: response.data.content,
                });
                setModalStep(2);

                // Start polling
                startPolling(response.data.orderId);
            }
        } catch (error: any) {
            console.error("Failed to create order:", error);
            toast({
                title: "Lỗi tạo đơn hàng",
                description: "Không thể tạo đơn hàng, vui lòng thử lại sau.",
                variant: "destructive",
            });
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const startPolling = (currentOrderId: string) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        pollingInterval.current = setInterval(async () => {
            try {
                const response = await paymentService.checkOrderStatus(currentOrderId);
                if (response.success && response.data.status === "COMPLETED") {
                    // Payment successful
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                    
                    toast({
                        title: "Thanh toán thành công!",
                        description: `Đã nâng cấp lên gói ${selectedPlan?.name}`,
                    });
                    
                    setShowPaymentModal(false);
                    // Refresh user data (reload page for now as a simple way to refresh everything)
                    setTimeout(() => window.location.reload(), 1500);
                }
            } catch (error) {
                console.error("Error checking order status:", error);
            }
        }, 3000); // Check every 3 seconds
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
        setSelectedPlan(null);
        setModalStep(1);
        setQrData(null);
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    const handleBack = () => {
        setModalStep(1);
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Billing</h1>
                <p className="text-muted-foreground">
                    Quản lý gói đăng ký và thanh toán
                </p>
            </div>

            {/* Current Plan */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Gói hiện tại</p>
                        <p className="text-xl font-semibold capitalize mt-1">
                            {currentPlan}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-shiba-500" />
                        <span className="text-sm text-muted-foreground">
                            Gia hạn: Không giới hạn
                        </span>
                    </div>
                </div>
            </div>

            {/* Plans */}
            <div className="grid gap-6 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`rounded-xl border bg-card p-6 relative ${plan.popular ? "ring-2 ring-shiba-500" : ""
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-shiba-500 text-white text-xs px-3 py-1 rounded-full">
                                    Phổ biến
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-shiba-100 dark:bg-shiba-900/30 flex items-center justify-center">
                                <plan.icon className="h-5 w-5 text-shiba-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {plan.description}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-3xl font-bold">{plan.price}</span>
                            <span className="text-muted-foreground">{plan.period}</span>
                        </div>

                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button
                            className={`w-full ${plan.popular
                                ? "bg-shiba-500 hover:bg-shiba-600"
                                : ""
                                }`}
                            variant={plan.popular ? "default" : "outline"}
                            disabled={currentPlan === plan.id || isLoading}
                            onClick={() => handleUpgrade(plan)}
                        >
                            {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                            {currentPlan === plan.id ? "Gói hiện tại" : "Nâng cấp"}
                        </Button>
                    </div>
                ))}
            </div>

            {/* Payment History */}
            <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-4">Lịch sử thanh toán</h3>
                <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có giao dịch nào</p>
                </div>
            </div>

            {/* 2-Step Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-shiba-500 to-orange-500 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {modalStep === 2 && (
                                        <button
                                            onClick={handleBack}
                                            className="p-1 hover:bg-white/20 rounded-lg transition-colors mr-1"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <selectedPlan.icon className="h-5 w-5" />
                                    <span className="font-semibold">
                                        {modalStep === 1 ? "Chọn chu kỳ thanh toán" : "Thanh toán"}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {/* Progress indicator */}
                            <div className="flex gap-2 mt-3">
                                <div className={`h-1 flex-1 rounded-full ${modalStep >= 1 ? "bg-white" : "bg-white/30"}`} />
                                <div className={`h-1 flex-1 rounded-full ${modalStep >= 2 ? "bg-white" : "bg-white/30"}`} />
                            </div>
                        </div>

                        {/* Step 1: Select Plan & Billing Cycle */}
                        {modalStep === 1 && (
                            <div className="p-6 space-y-6">
                                {/* Plan Summary */}
                                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-shiba-500 to-orange-500 flex items-center justify-center">
                                        <selectedPlan.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Gói {selectedPlan.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                                    </div>
                                </div>

                                {/* Billing Cycle Selection */}
                                <div className="space-y-3">
                                    <p className="font-medium">Chọn chu kỳ thanh toán:</p>

                                    {/* Monthly Option */}
                                    <button
                                        onClick={() => setBillingCycle("monthly")}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${billingCycle === "monthly"
                                                ? "border-shiba-500 bg-shiba-50 dark:bg-shiba-900/20"
                                                : "border-muted hover:border-shiba-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">Hàng tháng</p>
                                                <p className="text-sm text-muted-foreground">Thanh toán mỗi tháng</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{selectedPlan.priceMonthly.toLocaleString()}đ</p>
                                                <p className="text-sm text-muted-foreground">/tháng</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Yearly Option */}
                                    <button
                                        onClick={() => setBillingCycle("yearly")}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${billingCycle === "yearly"
                                                ? "border-shiba-500 bg-shiba-50 dark:bg-shiba-900/20"
                                                : "border-muted hover:border-shiba-300"
                                            }`}
                                    >
                                        <div className="absolute -top-2 right-4">
                                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                Tiết kiệm 17%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">Hàng năm</p>
                                                <p className="text-sm text-muted-foreground">Thanh toán 1 lần/năm</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{selectedPlan.priceYearly.toLocaleString()}đ</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ~{Math.round(selectedPlan.priceYearly / 12).toLocaleString()}đ/tháng
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Confirm Button */}
                                <Button
                                    onClick={handleConfirmPlan}
                                    className="w-full bg-shiba-500 hover:bg-shiba-600 h-12 text-base"
                                    disabled={isCreatingOrder}
                                >
                                    {isCreatingOrder ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tạo đơn...
                                        </>
                                    ) : (
                                        <>
                                            Tiếp tục thanh toán
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Show QR Code */}
                        {modalStep === 2 && qrData && (
                            <div className="p-5 space-y-4">
                                {/* Order Summary */}
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Gói {selectedPlan.name} - {billingCycle === "monthly" ? "Tháng" : "Năm"}</p>
                                        <p className="text-xs text-muted-foreground">Mã đơn: {orderId}</p>
                                    </div>
                                    <p className="text-xl font-bold text-shiba-600">{qrData.amount.toLocaleString()}đ</p>
                                </div>

                                {/* Timer */}
                                <CountdownTimer onExpire={handleCloseModal} />

                                {/* QR Code */}
                                <div className="bg-white rounded-xl p-4 mx-auto w-fit shadow-sm relative">
                                    <Image
                                        src={qrData.qrUrl}
                                        alt="VietQR"
                                        width={200}
                                        height={200}
                                        className="rounded-lg"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/80 rounded-lg">
                                        <p className="text-sm font-medium text-black">Đang chờ thanh toán...</p>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-muted-foreground animate-pulse">
                                    Đang chờ thanh toán...
                                </p>

                                {/* Bank info */}
                                <div className="text-center">
                                    <p className="font-semibold text-foreground">NGUYEN PHAM QUOC DAT</p>
                                    <p className="text-sm text-muted-foreground">{qrData.bankCode} • {qrData.accountNo}</p>
                                </div>

                                {/* Instructions */}
                                <div className="flex items-start gap-3 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                    <Smartphone className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-700 dark:text-blue-300">Hướng dẫn thanh toán:</p>
                                        <ol className="list-decimal list-inside mt-1 space-y-1 text-blue-600 dark:text-blue-400">
                                            <li>Mở app ngân hàng bất kỳ</li>
                                            <li>Chọn "Quét QR" và quét mã trên</li>
                                            <li>Kiểm tra thông tin và xác nhận chuyển</li>
                                            <li>Gói sẽ được kích hoạt tự động sau 1-2 phút</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

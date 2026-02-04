"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
    AlertTriangle,
    CalendarDays,
    Receipt,
    CheckCircle2,
    XCircle,
    Hourglass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/payment-service";
import { useTranslation } from "@/lib/i18n";

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
            "Không giới hạn QR tĩnh",
            "Đếm lượt quét cơ bản",
            "Tùy chỉnh màu sắc",
            "Tải PNG",
        ],
        icon: Zap,
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "199.000đ",
        priceMonthly: 199000,
        priceYearly: 1990000,
        period: "/tháng",
        description: "Dành cho freelancer và startup",
        features: [
            "Tất cả tính năng Free",
            "QR Dynamic - thay đổi URL",
            "Analytics chi tiết",
            "Unlimited lượt quét",
            "Tải SVG/PDF chất lượng cao",
            "Logo trên QR",
        ],
        icon: Crown,
        popular: true,
    },
    {
        id: "business",
        name: "Business",
        price: "499.000đ",
        priceMonthly: 499000,
        priceYearly: 4990000,
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
    const { t } = useTranslation();
    const currentPlan = getUserPlan();
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    // Calculate subscription expiry info
    const subscription = user?.subscription;
    const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;
    const now = new Date();
    
    const getDaysRemaining = () => {
        if (!expiresAt) return null;
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();
    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 5 && daysRemaining > 0;
    const isExpired = daysRemaining !== null && daysRemaining <= 0;
    const isPaidPlan = currentPlan !== 'free';

    const formatExpiryDate = () => {
        if (!expiresAt) return null;
        return expiresAt.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalStep, setModalStep] = useState<1 | 2>(1); // Step 1: Select plan/cycle, Step 2: Show QR
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [orderId, setOrderId] = useState("");
    const [qrData, setQrData] = useState<{ qrUrl: string; amount: number; bankCode: string; accountNo: string; content: string } | null>(null);

    // Order history state
    const [orders, setOrders] = useState<Array<{
        id: string;
        planId: string;
        amount: number;
        status: string;
        billingCycle: string;
        createdAt: string;
        paidAt?: string;
    }>>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

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

    // Fetch order history
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoadingOrders(true);
            const result = await paymentService.getOrderHistory(1, 20);
            setOrders(result.orders || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user?.id, fetchOrders]);

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
                    
                    // Refresh user data immediately
                    await useAuthStore.getState().fetchUser();
                    
                    // Show success toast
                    toast({
                        title: "Thanh toán thành công!",
                        description: `Đã nâng cấp lên gói ${selectedPlan?.name}`,
                    });
                    
                    setShowPaymentModal(false);
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
                <h1 className="text-2xl font-bold">{t("dashboard.billing.title")}</h1>
                <p className="text-muted-foreground">
                    {t("dashboard.billing.subtitle")}
                </p>
            </div>

            {/* Current Plan */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            isPaidPlan 
                                ? 'bg-gradient-to-br from-shiba-500 to-orange-500' 
                                : 'bg-muted'
                        }`}>
                            {currentPlan === 'business' ? (
                                <Building2 className="h-6 w-6 text-white" />
                            ) : currentPlan === 'pro' ? (
                                <Crown className="h-6 w-6 text-white" />
                            ) : (
                                <Zap className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gói hiện tại</p>
                            <p className="text-xl font-bold capitalize">
                                {currentPlan}
                            </p>
                        </div>
                    </div>
                    
                    {/* Expiry Info */}
                    <div className="flex flex-col items-end gap-1">
                        {isPaidPlan && expiresAt ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Hết hạn: {formatExpiryDate()}
                                    </span>
                                </div>
                                {daysRemaining !== null && daysRemaining > 0 && (
                                    <span className={`text-sm font-medium ${
                                        isExpiringSoon ? 'text-orange-500' : 'text-green-500'
                                    }`}>
                                        Còn {daysRemaining} ngày
                                    </span>
                                )}
                                {isExpired && (
                                    <span className="text-sm font-medium text-red-500">
                                        Đã hết hạn
                                    </span>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {isPaidPlan ? 'Đang hoạt động' : 'Miễn phí vĩnh viễn'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Renewal Warning Banner */}
                {isPaidPlan && isExpiringSoon && (
                    <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                Gói của bạn sắp hết hạn!
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                                Còn {daysRemaining} ngày. Gia hạn ngay để không bị gián đoạn dịch vụ.
                            </p>
                        </div>
                        <Button 
                            size="sm" 
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => {
                                const plan = plans.find(p => p.id === currentPlan);
                                if (plan) handleUpgrade(plan);
                            }}
                        >
                            Gia hạn
                        </Button>
                    </div>
                )}

                {/* Expired Banner */}
                {isPaidPlan && isExpired && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                Gói của bạn đã hết hạn!
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                Tính năng Pro đã bị giới hạn. Gia hạn để tiếp tục sử dụng.
                            </p>
                        </div>
                        <Button 
                            size="sm" 
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => {
                                const plan = plans.find(p => p.id === currentPlan);
                                if (plan) handleUpgrade(plan);
                            }}
                        >
                            Gia hạn ngay
                        </Button>
                    </div>
                )}
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
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Lịch sử thanh toán
                </h3>
                {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Chưa có giao dịch nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                        order.status === "COMPLETED" 
                                            ? "bg-green-100 dark:bg-green-900/30" 
                                            : order.status === "PENDING"
                                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                                            : "bg-red-100 dark:bg-red-900/30"
                                    }`}>
                                        {order.status === "COMPLETED" ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : order.status === "PENDING" ? (
                                            <Hourglass className="h-5 w-5 text-yellow-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Gói {order.planId.charAt(0).toUpperCase() + order.planId.slice(1)} - {order.billingCycle === "monthly" ? "Tháng" : "Năm"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Mã: {order.id} • {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-shiba-600">
                                        {order.amount.toLocaleString()}đ
                                    </p>
                                    <p className={`text-xs font-medium ${
                                        order.status === "COMPLETED" 
                                            ? "text-green-600" 
                                            : order.status === "PENDING"
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                    }`}>
                                        {order.status === "COMPLETED" ? "Thành công" : order.status === "PENDING" ? "Chờ thanh toán" : "Thất bại"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

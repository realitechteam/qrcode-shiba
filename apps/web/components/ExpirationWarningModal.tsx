"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { AlertTriangle, Clock, Crown, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ExpirationWarningModal() {
    const { user, getUserPlan } = useAuthStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const subscription = user?.subscription;
    const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;
    const currentPlan = getUserPlan();
    const isPaidPlan = currentPlan !== "free";

    useEffect(() => {
        if (!isPaidPlan || !expiresAt) return;

        // Check if user has already dismissed the modal in this session
        const hasDismissed = sessionStorage.getItem("expiration_warning_dismissed");
        if (hasDismissed === "true") return;

        const now = new Date();
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Show modal if 7 days or less remaining, but still active
        if (diffDays <= 7 && diffDays > 0) {
            setIsOpen(true);
        }
    }, [isPaidPlan, expiresAt]);

    const handleDismiss = () => {
        sessionStorage.setItem("expiration_warning_dismissed", "true");
        setIsOpen(false);
    };

    const handleRenew = () => {
        sessionStorage.setItem("expiration_warning_dismissed", "true");
        setIsOpen(false);
        router.push("/dashboard/billing");
    };

    if (!isOpen) return null;

    const diffTime = expiresAt!.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    onClick={handleDismiss}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4 text-orange-500 relative">
                        <AlertTriangle className="h-8 w-8" />
                        <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm">
                            <Clock className="h-4 w-4 text-orange-500" />
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-2 text-orange-600 dark:text-orange-400">
                        Gói {currentPlan} sắp hết hạn!
                    </h2>

                    <p className="text-muted-foreground mb-6">
                        Đăng ký của bạn sẽ kết thúc sau{" "}
                        <span className="font-bold text-foreground">{diffDays} ngày</span> nữa.
                        {" "}Hãy gia hạn ngay để không bị gián đoạn tính năng Premium và các QR code động.
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={handleRenew}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
                        >
                            <Crown className="mr-2 h-5 w-5 text-yellow-300" />
                            Gia hạn ngay
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            onClick={handleDismiss}
                            variant="ghost"
                            className="w-full h-10 text-muted-foreground hover:text-foreground"
                        >
                            Để sau
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

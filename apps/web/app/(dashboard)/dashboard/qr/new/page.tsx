"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Palette,
    Download,
    Loader2,
    Check,
    Lock,
    Crown,
    FileEdit,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { useQRCreationStore } from "@/stores/qr-creation-store";
import qrApi from "@/lib/qr-api";
import { QRTypeSelector } from "./components/qr-type-selector";
import { QRDataForm } from "./components/qr-data-form";
import { QRStyling, StylingOptions } from "./components/qr-styling";
import { QRPreview } from "./components/qr-preview";
import { qrTypes, steps } from "./constants";

export default function NewQRPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { canUseDynamicQR, canDownloadSVG, isPaidUser } = useAuthStore();
    const { saveDraft, loadDraft, clearDraft, hasDraft } = useQRCreationStore();
    const isInitialized = useRef(false);

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedType, setSelectedType] = useState<string>(
        searchParams.get("type")?.toUpperCase() || "URL"
    );
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [styling, setStyling] = useState<StylingOptions>({
        foregroundColor: "#000000",
        backgroundColor: "#FFFFFF",
        dotsStyle: "square",
        cornersSquareStyle: "square",
        cornersDotStyle: "square",
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedQR, setSavedQR] = useState<any>(null);
    const [qrName, setQrName] = useState("");
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const [enableTracking, setEnableTracking] = useState(false);

    // Get current QR type info
    const currentQRType = qrTypes.find(t => t.id === selectedType);
    const supportsTracking = currentQRType?.supportsTracking ?? false;

    // Load draft on mount
    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const draft = loadDraft();
        if (draft && hasDraft()) {
            setShowDraftBanner(true);
        }
    }, [loadDraft, hasDraft]);

    // Restore draft handler
    const handleRestoreDraft = () => {
        const draft = loadDraft();
        if (draft) {
            setSelectedType(draft.selectedType);
            setFormData(draft.formData);
            setStyling(draft.styling);
            setQrName(draft.qrName);
            setCurrentStep(draft.currentStep);
            setShowDraftBanner(false);
            toast({
                title: "Đã khôi phục bản nháp",
                description: "Tiếp tục tạo QR code từ lần trước",
            });
        }
    };

    // Discard draft handler
    const handleDiscardDraft = () => {
        clearDraft();
        setShowDraftBanner(false);
    };

    // Auto-save draft on changes (debounced)
    useEffect(() => {
        if (savedQR) return; // Don't save draft if QR is already saved

        const timer = setTimeout(() => {
            if (currentStep > 1 || Object.keys(formData).length > 0 || qrName.trim()) {
                saveDraft({
                    selectedType,
                    formData,
                    styling,
                    qrName,
                    currentStep,
                });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [selectedType, formData, styling, qrName, currentStep, savedQR, saveDraft]);

    // Generate preview
    const generatePreview = useCallback(async () => {
        if (!formData || Object.keys(formData).length === 0) return;

        setIsLoading(true);
        try {
            const response = await qrApi.post("/qr/preview", {
                type: selectedType,
                data: formData,
                styling,
                size: 300,
            });
            setPreview(response.data.dataUrl);
        } catch (error) {
            console.error("Preview error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedType, formData, styling]);

    // Debounced preview generation - always generate preview
    useEffect(() => {
        const timer = setTimeout(() => {
            generatePreview();
        }, 500);

        return () => clearTimeout(timer);
    }, [formData, styling, selectedType, generatePreview]);

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSave = async (isDynamic: boolean = false) => {
        setIsSaving(true);
        try {
            const response = await qrApi.post("/qr", {
                type: selectedType,
                data: formData,
                styling,
                isDynamic,
                name: qrName.trim() || undefined, // Send name if provided
            });
            setSavedQR(response.data);
            clearDraft(); // Clear draft after successful save
            toast({
                title: "QR Code đã được tạo!",
                description: "Bạn có thể tải xuống hoặc chia sẻ ngay",
            });
        } catch (error: any) {
            toast({
                title: "Lỗi tạo QR Code",
                description: error.message || "Có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = async (format: "png" | "svg" = "png") => {
        if (!savedQR) return;

        try {
            const response = await qrApi.get(`/qr/${savedQR.id}/download`, {
                params: { format, size: 1024 },
                responseType: "blob",
            });

            const url = URL.createObjectURL(response.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `qrcode.${format}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast({
                title: "Lỗi tải xuống",
                description: "Không thể tải file",
                variant: "destructive",
            });
        }
    };

    const canProceed = () => {
        if (currentStep === 1) return !!selectedType;
        if (currentStep === 2) {
            // Validate based on type
            switch (selectedType) {
                case "URL":
                    return !!formData.url;
                case "TEXT":
                    return !!formData.text;
                case "WIFI":
                    return !!formData.ssid;
                case "VCARD":
                    return !!formData.firstName || !!formData.lastName;
                case "EMAIL":
                    return !!formData.email;
                case "PHONE":
                    return !!formData.phone;
                case "SMS":
                    return !!formData.phone;
                case "LOCATION":
                    return formData.latitude !== undefined && formData.longitude !== undefined;
                default:
                    return true;
            }
        }
        return true;
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Draft Banner */}
            {showDraftBanner && (
                <div className="mb-6 p-4 rounded-xl border border-shiba-200 bg-gradient-to-r from-shiba-50 to-orange-50 dark:from-shiba-900/20 dark:to-orange-900/20 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-shiba-100 dark:bg-shiba-800/30 flex items-center justify-center">
                            <FileEdit className="h-5 w-5 text-shiba-600 dark:text-shiba-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-sm">Bạn có bản nháp chưa hoàn thành</h3>
                            <p className="text-xs text-muted-foreground">Tiếp tục từ lần trước hoặc bắt đầu mới</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDiscardDraft}
                            >
                                Bỏ qua
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleRestoreDraft}
                                className="bg-shiba-500 hover:bg-shiba-600"
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-muted"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Tạo QR Code mới</h1>
                    <p className="text-muted-foreground">
                        {steps[currentStep - 1]?.description}
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""
                                }`}
                        >
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep > step.id
                                    ? "bg-shiba-500 border-shiba-500 text-white"
                                    : currentStep === step.id
                                        ? "border-shiba-500 text-shiba-500"
                                        : "border-muted-foreground/30 text-muted-foreground/50"
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    step.id
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 ${currentStep > step.id
                                        ? "bg-shiba-500"
                                        : "bg-muted-foreground/30"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    {steps.map((step) => (
                        <span
                            key={step.id}
                            className={`text-xs ${currentStep >= step.id
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                                }`}
                        >
                            {step.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Form */}
                <div className="rounded-xl border bg-card p-6">
                    {currentStep === 1 && (
                        <QRTypeSelector
                            types={qrTypes}
                            selected={selectedType}
                            onSelect={(type) => {
                                setSelectedType(type);
                                setFormData({});
                            }}
                        />
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {/* QR Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="qr-name" className="block text-sm font-medium">
                                    Tên QR Code <span className="text-muted-foreground">(tùy chọn)</span>
                                </label>
                                <input
                                    id="qr-name"
                                    type="text"
                                    value={qrName}
                                    onChange={(e) => setQrName(e.target.value)}
                                    placeholder="VD: QR website công ty, Link Facebook..."
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>

                            {/* Existing Data Form */}
                            <QRDataForm
                                type={selectedType}
                                data={formData}
                                onChange={setFormData}
                            />

                            {/* Tracking Toggle */}
                            {supportsTracking && (
                                <div className="p-4 rounded-xl border bg-gradient-to-r from-shiba-50/50 to-transparent dark:from-shiba-900/20">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-shiba-100 dark:bg-shiba-900/30">
                                                <BarChart3 className="h-5 w-5 text-shiba-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">Bật theo dõi (Tracking)</h4>
                                                    {!isPaidUser && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                            <Crown className="h-3 w-3" />
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Theo dõi lượt quét, thiết bị, vị trí địa lý
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={enableTracking}
                                            onCheckedChange={(checked) => {
                                                if (!isPaidUser && checked) {
                                                    toast({
                                                        title: "Tính năng PRO",
                                                        description: "Nâng cấp PRO để bật theo dõi QR code",
                                                        variant: "default",
                                                    });
                                                    return;
                                                }
                                                setEnableTracking(checked);
                                            }}
                                            disabled={!isPaidUser}
                                            className="data-[state=checked]:bg-shiba-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Non-trackable type info */}
                            {!supportsTracking && (
                                <div className="p-4 rounded-xl border border-dashed bg-muted/30">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Lock className="h-5 w-5" />
                                        <p className="text-sm">
                                            Loại QR này không hỗ trợ tracking do dữ liệu được nhúng trực tiếp.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <QRStyling styling={styling} onChange={setStyling} />
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                                    <Check className="h-8 w-8" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">
                                    {savedQR ? "QR Code đã sẵn sàng!" : "Xác nhận tạo QR Code"}
                                </h2>
                                <p className="text-muted-foreground">
                                    {savedQR
                                        ? "Tải xuống hoặc chia sẻ QR code của bạn"
                                        : "Chọn loại QR code bạn muốn tạo"}
                                </p>
                            </div>

                            {!savedQR ? (
                                <div className="space-y-4">
                                    {/* Summary of QR settings */}
                                    <div className="p-4 rounded-xl border bg-muted/30">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Loại:</span>
                                                <p className="font-medium">{currentQRType?.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Tên:</span>
                                                <p className="font-medium">{qrName || "Chưa đặt tên"}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">Theo dõi:</span>
                                                <p className="font-medium flex items-center gap-2">
                                                    {enableTracking ? (
                                                        <>
                                                            <span className="h-2 w-2 rounded-full bg-green-500" />
                                                            Bật - Theo dõi lượt quét
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                                                            Tắt - QR tĩnh
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Create Button */}
                                    <Button
                                        onClick={() => handleSave(enableTracking)}
                                        disabled={isSaving}
                                        className="w-full h-12 bg-shiba-500 hover:bg-shiba-600 gap-2 text-base"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-5 w-5" />
                                                Tạo QR Code
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {/* PNG Download - Available to all */}
                                    <Button
                                        onClick={() => handleDownload("png")}
                                        className="w-full bg-shiba-500 hover:bg-shiba-600 gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Tải PNG (1024px)
                                    </Button>

                                    {/* SVG Download - PRO only */}
                                    {canDownloadSVG() ? (
                                        <Button
                                            onClick={() => handleDownload("svg")}
                                            variant="outline"
                                            className="w-full gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Tải SVG (Vector)
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 opacity-60"
                                            onClick={() => router.push("/dashboard/billing")}
                                        >
                                            <Lock className="h-4 w-4" />
                                            Tải SVG (Vector)
                                            <span className="px-2 py-0.5 rounded-full bg-shiba-100 text-shiba-700 text-xs font-medium ml-auto">
                                                PRO
                                            </span>
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/dashboard/qr")}
                                        className="w-full"
                                    >
                                        Xem tất cả QR Codes
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Preview */}
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-shiba-500" />
                        Xem trước
                    </h2>
                    <QRPreview
                        preview={preview}
                        isLoading={isLoading}
                        styling={styling}
                    />
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                        {currentQRType?.id ? (
                            // Determine if dynamic based on store/logic or just show general note
                            supportsTracking ? (
                                <p>QR Dynamic: Nội dung có thể thay đổi mà không làm thay đổi hình ảnh QR.</p>
                            ) : (
                                <p className="text-orange-600 dark:text-orange-400">
                                    Lưu ý: Thay đổi nội dung QR Static sẽ làm thay đổi hình ảnh QR. Hãy in lại nếu cần thiết.
                                </p>
                            )
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>

                {currentStep < 4 && (
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="bg-shiba-500 hover:bg-shiba-600 gap-2"
                    >
                        Tiếp theo
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

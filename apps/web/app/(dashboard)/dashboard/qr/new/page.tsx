"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Link2,
    FileText,
    User,
    Wifi,
    Mail,
    Phone,
    MessageSquare,
    MapPin,
    Palette,
    Download,
    Loader2,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { QRTypeSelector } from "./components/qr-type-selector";
import { QRDataForm } from "./components/qr-data-form";
import { QRStyling } from "./components/qr-styling";
import { QRPreview } from "./components/qr-preview";

export const qrTypes = [
    { id: "URL", name: "URL", icon: Link2, description: "Link website" },
    { id: "TEXT", name: "Text", icon: FileText, description: "Văn bản tùy ý" },
    { id: "VCARD", name: "vCard", icon: User, description: "Danh thiếp điện tử" },
    { id: "WIFI", name: "WiFi", icon: Wifi, description: "Chia sẻ mật khẩu WiFi" },
    { id: "EMAIL", name: "Email", icon: Mail, description: "Gửi email" },
    { id: "PHONE", name: "Điện thoại", icon: Phone, description: "Gọi điện thoại" },
    { id: "SMS", name: "SMS", icon: MessageSquare, description: "Gửi tin nhắn" },
    { id: "LOCATION", name: "Vị trí", icon: MapPin, description: "Google Maps" },
];

const steps = [
    { id: 1, name: "Loại QR", description: "Chọn loại QR code" },
    { id: 2, name: "Nội dung", description: "Nhập thông tin" },
    { id: 3, name: "Tùy chỉnh", description: "Thiết kế giao diện" },
    { id: 4, name: "Hoàn tất", description: "Lưu và tải xuống" },
];

export default function NewQRPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedType, setSelectedType] = useState<string>(
        searchParams.get("type")?.toUpperCase() || "URL"
    );
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [styling, setStyling] = useState({
        foregroundColor: "#000000",
        backgroundColor: "#FFFFFF",
        dotsStyle: "square" as const,
        cornersSquareStyle: "square" as const,
        cornersDotStyle: "square" as const,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedQR, setSavedQR] = useState<any>(null);

    // Generate preview
    const generatePreview = useCallback(async () => {
        if (!formData || Object.keys(formData).length === 0) return;

        setIsLoading(true);
        try {
            const response = await api.post("/qr/preview", {
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

    // Debounced preview generation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentStep >= 2) {
                generatePreview();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData, styling, currentStep, generatePreview]);

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
            const response = await api.post("/qr", {
                type: selectedType,
                data: formData,
                styling,
                isDynamic,
            });
            setSavedQR(response.data);
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
            const response = await api.get(`/qr/${savedQR.id}/download`, {
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
                        {steps[currentStep - 1].description}
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
                        <QRDataForm
                            type={selectedType}
                            data={formData}
                            onChange={setFormData}
                        />
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
                                <div className="grid gap-4">
                                    <button
                                        onClick={() => handleSave(false)}
                                        disabled={isSaving}
                                        className="p-4 rounded-xl border hover:border-shiba-500 hover:bg-shiba-50 dark:hover:bg-shiba-900/10 transition-all text-left"
                                    >
                                        <h3 className="font-semibold mb-1">QR Code tĩnh</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Nội dung cố định, không thể thay đổi sau khi tạo. Miễn phí.
                                        </p>
                                    </button>
                                    <button
                                        onClick={() => handleSave(true)}
                                        disabled={isSaving}
                                        className="p-4 rounded-xl border hover:border-shiba-500 hover:bg-shiba-50 dark:hover:bg-shiba-900/10 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">QR Code động</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-shiba-100 text-shiba-700 text-xs font-medium">
                                                PRO
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Thay đổi nội dung bất cứ lúc nào, theo dõi lượt quét chi tiết.
                                        </p>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    <Button
                                        onClick={() => handleDownload("png")}
                                        className="w-full bg-shiba-500 hover:bg-shiba-600 gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Tải PNG (1024px)
                                    </Button>
                                    <Button
                                        onClick={() => handleDownload("svg")}
                                        variant="outline"
                                        className="w-full gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Tải SVG (Vector)
                                    </Button>
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

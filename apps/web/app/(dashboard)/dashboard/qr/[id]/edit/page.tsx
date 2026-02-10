"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Loader2,
    Palette,
    FileText,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import qrApi from "@/lib/qr-api";
import { QRDataForm } from "../../new/components/qr-data-form";
import { QRStyling, StylingOptions } from "../../new/components/qr-styling";
import { QRPreview } from "../../new/components/qr-preview";

interface EditQRPageProps {
    params: {
        id: string;
    };
}

export default function EditQRPage({ params }: EditQRPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [qr, setQr] = useState<any>(null);

    // Form State
    const [qrName, setQrName] = useState("");
    const [selectedType, setSelectedType] = useState<string>("URL");
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [styling, setStyling] = useState<StylingOptions>({
        foregroundColor: "#000000",
        backgroundColor: "#FFFFFF",
        dotsStyle: "square",
        cornersSquareStyle: "square",
        cornersDotStyle: "square",
    });
    
    const [preview, setPreview] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // Fetch QR data
    useEffect(() => {
        const fetchQR = async () => {
            try {
                const response = await qrApi.get(`/qr/${id}`);
                const data = response.data;
                setQr(data);
                
                // Populate form
                setQrName(data.name || "");
                setSelectedType(data.type);
                setFormData(data.content?.data || {});
                if (data.styling) {
                    setStyling(data.styling);
                }
            } catch (error) {
                console.error("Error fetching QR:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin QR Code",
                    variant: "destructive",
                });
                router.push("/dashboard/qr");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchQR();
        }
    }, [id, router, toast]);

    // Generate preview
    const generatePreview = useCallback(async () => {
        if (!formData || Object.keys(formData).length === 0) return;

        setIsPreviewLoading(true);
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
            setIsPreviewLoading(false);
        }
    }, [selectedType, formData, styling]);

    // Debounced preview generation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (qr) {
                generatePreview();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData, styling, selectedType, qr, generatePreview]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await qrApi.patch(`/qr/${id}`, {
                name: qrName.trim() || undefined,
                data: formData,
                styling,
            
            toast({
                title: "Thành công",
                description: "Đã cập nhật QR Code",
            });
            router.push("/dashboard/qr");
        } catch (error: any) {
            toast({
                title: "Lỗi lưu thay đổi",
                description: error.message || "Có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-shiba-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Chỉnh sửa QR Code</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            {qr?.name || "Untitled"}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                {qr?.isDynamic ? "Dynamic" : "Static"}
                            </span>
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-shiba-500 hover:bg-shiba-600 gap-2"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Lưu thay đổi
                </Button>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Editor Tabs - Spans 2 cols */}
                <div className="lg:col-span-2 rounded-xl border bg-card p-6 h-fit">
                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="content" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Nội dung
                            </TabsTrigger>
                            <TabsTrigger value="styling" className="gap-2">
                                <Palette className="h-4 w-4" />
                                Giao diện
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                            {/* QR Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="qr-name" className="block text-sm font-medium">
                                    Tên QR Code
                                </label>
                                <input
                                    id="qr-name"
                                    type="text"
                                    value={qrName}
                                    onChange={(e) => setQrName(e.target.value)}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    placeholder="Đặt tên cho QR Code này..."
                                />
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">
                                    Dữ liệu {selectedType}
                                </h3>
                                <QRDataForm
                                    type={selectedType}
                                    data={formData}
                                    onChange={setFormData}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="styling" className="animate-in slide-in-from-right-2 duration-300">
                            <QRStyling styling={styling} onChange={setStyling} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right: Preview - Spans 1 col */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border bg-card p-6 sticky top-6">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <Palette className="h-5 w-5 text-shiba-500" />
                            Xem trước
                        </h2>
                        <QRPreview
                            preview={preview}
                            isLoading={isPreviewLoading}
                            styling={styling}
                        />
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                            {qr?.isDynamic ? (
                                <p>QR Dynamic: Nội dung có thể thay đổi mà không làm thay đổi hình ảnh QR.</p>
                            ) : (
                                <p className="text-orange-600 dark:text-orange-400">
                                    Lưu ý: Thay đổi nội dung QR Static sẽ làm thay đổi hình ảnh QR. Hãy in lại nếu cần thiết.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

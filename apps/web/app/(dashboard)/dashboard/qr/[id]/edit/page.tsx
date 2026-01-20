"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Loader2,
    Link2,
    ExternalLink,
    BarChart3,
    Calendar,
    Globe,
    Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import qrApi from "@/lib/qr-api";

interface QRCode {
    id: string;
    shortCode: string;
    name: string | null;
    type: string;
    status: string;
    isDynamic: boolean;
    destinationUrl: string | null;
    scanCount: number;
    createdAt: string;
    updatedAt: string;
    content?: {
        data: Record<string, any>;
    };
}

interface ScanStats {
    total: number;
    byDate: { date: string; count: number }[];
    byCountry: { name: string; count: number }[];
    byDevice: { name: string; count: number }[];
}

export default function EditQRPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const qrId = params.id as string;

    const [qr, setQr] = useState<QRCode | null>(null);
    const [stats, setStats] = useState<ScanStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [destinationUrl, setDestinationUrl] = useState("");

    // Load QR data
    const loadQR = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await qrApi.get(`/qr/${qrId}`);
            const data = response.data;
            setQr(data);
            setName(data.name || "");
            setDestinationUrl(data.destinationUrl || data.content?.data?.url || "");

            // Load stats
            try {
                const statsResponse = await qrApi.get(`/qr/${qrId}/stats?period=30d`);
                setStats(statsResponse.data);
            } catch {
                // Stats might fail if no scans
            }
        } catch (error) {
            console.error("Failed to load QR:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải thông tin QR code",
                variant: "destructive",
            });
            router.push("/dashboard/qr");
        } finally {
            setIsLoading(false);
        }
    }, [qrId, router, toast]);

    useEffect(() => {
        loadQR();
    }, [loadQR]);

    // Save changes
    const handleSave = async () => {
        if (!qr) return;

        setIsSaving(true);
        try {
            await qrApi.patch(`/qr/${qrId}`, {
                name: name || undefined,
                destinationUrl: destinationUrl || undefined,
            });

            toast({
                title: "Đã lưu!",
                description: "QR code đã được cập nhật thành công",
            });

            // Reload to get updated data
            loadQR();
        } catch (error) {
            console.error("Save error:", error);
            toast({
                title: "Lỗi",
                description: "Không thể lưu thay đổi",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-shiba-500" />
            </div>
        );
    }

    if (!qr) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">QR code không tồn tại</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/qr")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Chỉnh sửa QR Code</h1>
                    <p className="text-muted-foreground">
                        {qr.isDynamic ? "Dynamic QR - Có thể thay đổi URL" : "Static QR"}
                    </p>
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

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="font-semibold mb-4">Thông tin cơ bản</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Tên QR Code
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên cho QR code"
                                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>

                            {qr.isDynamic && (
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        URL đích
                                    </label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="url"
                                            value={destinationUrl}
                                            onChange={(e) => setDestinationUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        💡 Dynamic QR: Thay đổi URL mà không cần in lại QR code
                                    </p>
                                </div>
                            )}

                            {!qr.isDynamic && (
                                <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">
                                        ⚠️ Static QR: URL được mã hóa trực tiếp trong QR code và không thể thay đổi.
                                        Tạo Dynamic QR để có thể chỉnh sửa URL sau này.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QR Info */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="font-semibold mb-4">Chi tiết QR Code</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Short Code</p>
                                <p className="font-mono font-medium">{qr.shortCode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Loại</p>
                                <p className="capitalize">{qr.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Trạng thái</p>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${qr.status === "ACTIVE"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                    {qr.status === "ACTIVE" ? "Hoạt động" : qr.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ngày tạo</p>
                                <p>{new Date(qr.createdAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    {/* Scan Stats */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-shiba-500" />
                            Thống kê quét
                        </h2>
                        <div className="space-y-4">
                            <div className="text-center p-4 rounded-lg bg-shiba-50 dark:bg-shiba-900/20">
                                <p className="text-3xl font-bold text-shiba-600">
                                    {qr.scanCount}
                                </p>
                                <p className="text-sm text-muted-foreground">Tổng lượt quét</p>
                            </div>

                            {stats && stats.byDevice && stats.byDevice.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        Thiết bị
                                    </p>
                                    <div className="space-y-2">
                                        {stats.byDevice.map((device) => (
                                            <div key={device.name} className="flex justify-between text-sm">
                                                <span>{device.name}</span>
                                                <span className="font-medium">{device.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {stats && stats.byCountry && stats.byCountry.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Quốc gia
                                    </p>
                                    <div className="space-y-2">
                                        {stats.byCountry.slice(0, 5).map((country) => (
                                            <div key={country.name} className="flex justify-between text-sm">
                                                <span>{country.name || "Unknown"}</span>
                                                <span className="font-medium">{country.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="font-semibold mb-4">Liên kết nhanh</h2>
                        <div className="space-y-2">
                            <a
                                href={`${process.env.NEXT_PUBLIC_REDIRECT_URL || 'http://localhost:3003'}/${qr.shortCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-shiba-600 hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Mở liên kết QR
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

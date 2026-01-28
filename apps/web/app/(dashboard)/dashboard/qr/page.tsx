"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    QrCode,
    MoreVertical,
    Pencil,
    Trash2,
    Download,
    ExternalLink,
    Loader2,
    AlertTriangle,
    X,
    TrendingUp,
    Clock,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { AnalyticsModal } from "@/components/qr/analytics-modal";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/lib/haptic";
import qrApi from "@/lib/qr-api";

interface QRCode {
    id: string;
    shortCode: string;
    name: string | null;
    type: string;
    status: string;
    isDynamic: boolean;
    destinationUrl: string | null;
    imageUrl: string | null;
    scanCount: number;
    createdAt: string;
    updatedAt?: string;
}

// Time ago helper
function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
}

export default function QRCodesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal and action states
    const [deleteTarget, setDeleteTarget] = useState<QRCode | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [analyticsTarget, setAnalyticsTarget] = useState<QRCode | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchQRCodes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await qrApi.get("/qr", {
                params: {
                    search: searchQuery || undefined,
                },
            });
            const data = Array.isArray(response.data) ? response.data : response.data.items || [];
            setQrCodes(data);
        } catch (err: any) {
            console.error("Failed to fetch QR codes:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách QR codes");
            setQrCodes([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchQRCodes();
    }, [fetchQRCodes]);

    const handleDelete = (qr: QRCode) => {
        triggerHaptic("warning");
        setDeleteTarget(qr);
        setActiveActionId(null);
    };

    // Show analytics modal on card click
    const handleCardClick = (qr: QRCode) => {
        triggerHaptic("light");
        setAnalyticsTarget(qr);
    };

    // Pull-to-refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchQRCodes();
        setIsRefreshing(false);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            await qrApi.delete(`/qr/${deleteTarget.id}`);
            toast({ title: "Đã xóa QR code", description: deleteTarget.name || deleteTarget.shortCode });
            fetchQRCodes();
        } catch (err: any) {
            toast({
                title: "Lỗi xóa QR",
                description: err.response?.data?.message || "Không thể xóa QR code",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleDownload = async (qr: QRCode) => {
        setDownloadingId(qr.id);
        setActiveActionId(null);
        try {
            const response = await qrApi.get(`/qr/${qr.id}/download`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = `${qr.name || qr.shortCode}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "Đã tải xuống", description: qr.name || qr.shortCode });
        } catch (err: any) {
            toast({
                title: "Lỗi tải xuống",
                description: err.response?.data?.message || "Không thể tải QR code",
                variant: "destructive",
            });
        } finally {
            setDownloadingId(null);
        }
    };

    const handleOpenLink = (qr: QRCode) => {
        const baseUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "https://redirect-service-production-0d4b.up.railway.app";
        const url = qr.isDynamic
            ? `${baseUrl}/${qr.shortCode}`
            : qr.destinationUrl;
        if (url) window.open(url, "_blank");
        setActiveActionId(null);
    };

    const handleEdit = (qr: QRCode) => {
        router.push(`/dashboard/qr/${qr.id}/edit`);
    };

    const filteredQRCodes = qrCodes.filter(
        (qr) =>
            qr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            qr.destinationUrl?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0);
    const dynamicCount = qrCodes.filter(qr => qr.isDynamic).length;

    return (
        <div className="relative min-h-[calc(100vh-8rem)] pb-24 lg:pb-6">
            {/* Header - Mobile Optimized */}
            <div className="sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 bg-background/80 backdrop-blur-lg border-b lg:border-none lg:bg-transparent lg:backdrop-blur-none">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold">QR Codes</h1>
                        <p className="text-sm text-muted-foreground hidden sm:block">
                            {qrCodes.length} mã QR • {totalScans.toLocaleString()} lượt quét
                        </p>
                    </div>
                    
                    {/* Desktop Only - Create Button */}
                    <Link href="/dashboard/qr/new" className="hidden lg:block">
                        <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo QR Code
                        </Button>
                    </Link>
                </div>

                {/* Search Bar - Full Width on Mobile */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm QR codes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 transition-shadow"
                    />
                </div>
            </div>

            {/* Quick Stats - Mobile */}
            <div className="grid grid-cols-2 gap-3 mt-4 lg:hidden">
                <div className="rounded-xl bg-gradient-to-br from-shiba-500/10 to-shiba-600/10 border border-shiba-500/20 p-4">
                    <div className="flex items-center gap-2 text-shiba-600 dark:text-shiba-400 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Tổng quét</span>
                    </div>
                    <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <QrCode className="h-4 w-4" />
                        <span className="text-xs font-medium">Dynamic</span>
                    </div>
                    <p className="text-2xl font-bold">{dynamicCount}</p>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-3">
                {isLoading ? (
                    // Skeleton Loading
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`rounded-2xl border bg-card p-4 opacity-0 animate-slide-up stagger-${i}`}
                            >
                                <div className="flex gap-4">
                                    <div className="h-20 w-20 rounded-xl bg-muted animate-shimmer flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-2/3 rounded bg-muted animate-shimmer" />
                                        <div className="h-3 w-full rounded bg-muted animate-shimmer" />
                                        <div className="h-3 w-1/3 rounded bg-muted animate-shimmer" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    // Error State
                    <div className="rounded-2xl border bg-card p-8 text-center animate-scale-in">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Thử lại
                        </Button>
                    </div>
                ) : filteredQRCodes.length === 0 ? (
                    // Empty State
                    <EmptyState />
                ) : (
                    // QR Cards List
                    filteredQRCodes.map((qr, index) => (
                        <QRCardMobile
                            key={qr.id}
                            qr={qr}
                            index={index}
                            isActive={activeActionId === qr.id}
                            isDownloading={downloadingId === qr.id}
                            onToggleActions={() => setActiveActionId(activeActionId === qr.id ? null : qr.id)}
                            onOpenLink={() => handleOpenLink(qr)}
                            onDownload={() => handleDownload(qr)}
                            onEdit={() => handleEdit(qr)}
                            onDelete={() => handleDelete(qr)}
                            onCardClick={() => handleCardClick(qr)}
                        />
                    ))
                )}
            </div>

            {/* Floating Action Button (FAB) - Mobile Only */}
            <Link
                href="/dashboard/qr/new"
                className="lg:hidden fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-shiba-500 text-white shadow-lg shadow-shiba-500/30 animate-bounce-in touch-feedback"
                style={{ animationDelay: "0.5s" }}
            >
                <Plus className="h-6 w-6" />
            </Link>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => !isDeleting && setDeleteTarget(null)}
                    />
                    <div className="relative bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 p-6 animate-slide-up pb-safe">
                        <button
                            onClick={() => !isDeleting && setDeleteTarget(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                            disabled={isDeleting}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="flex flex-col items-center text-center pt-2">
                            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>

                            <h3 className="text-xl font-semibold mb-2">Xác nhận xóa</h3>
                            <p className="text-muted-foreground mb-6">
                                Bạn có chắc muốn xóa QR code <strong>&quot;{deleteTarget.name || deleteTarget.shortCode}&quot;</strong>?
                                <br />
                                <span className="text-sm">Hành động này không thể hoàn tác.</span>
                            </p>

                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl"
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 h-12 rounded-xl gap-2"
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang xóa...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
            </div>
            )}

            {/* Analytics Modal */}
            {analyticsTarget && (
                <AnalyticsModal
                    qr={analyticsTarget}
                    onClose={() => setAnalyticsTarget(null)}
                    onDownload={() => {
                        handleDownload(analyticsTarget);
                        setAnalyticsTarget(null);
                    }}
                    onOpenLink={() => {
                        handleOpenLink(analyticsTarget);
                        setAnalyticsTarget(null);
                    }}
                />
            )}

            {/* Backdrop for action menu */}
            {activeActionId && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveActionId(null)}
                />
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border bg-card p-8 text-center animate-scale-in">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-shiba-100 to-shiba-200 dark:from-shiba-900/30 dark:to-shiba-800/30 mb-4">
                <QrCode className="h-10 w-10 text-shiba-600 dark:text-shiba-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Chưa có QR code nào</h2>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Tạo QR code đầu tiên để bắt đầu theo dõi và quản lý các liên kết
            </p>
            <Link href="/dashboard/qr/new">
                <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2 h-12 px-6 rounded-xl">
                    <Plus className="h-5 w-5" />
                    Tạo QR Code đầu tiên
                </Button>
            </Link>
        </div>
    );
}

interface QRCardMobileProps {
    qr: QRCode;
    index: number;
    isActive: boolean;
    isDownloading: boolean;
    onToggleActions: () => void;
    onOpenLink: () => void;
    onDownload: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onCardClick: () => void;
}

function QRCardMobile({
    qr,
    index,
    isActive,
    isDownloading,
    onToggleActions,
    onOpenLink,
    onDownload,
    onEdit,
    onDelete,
    onCardClick,
}: QRCardMobileProps) {
    const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

    return (
        <div
            className={`relative rounded-2xl border bg-card overflow-hidden opacity-0 animate-slide-up ${staggerClass} touch-feedback`}
        >
            {/* Main Card Content */}
            <div
                className="flex gap-4 p-4 cursor-pointer"
                onClick={onCardClick}
            >
                {/* QR Preview */}
                <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {qr.imageUrl ? (
                        <img
                            src={qr.imageUrl}
                            alt={qr.name || "QR Code"}
                            className="w-full h-full object-contain p-1"
                        />
                    ) : (
                        <QrCode className="h-10 w-10 text-muted-foreground/50" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold truncate">{qr.name || "Untitled"}</h3>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {qr.destinationUrl || qr.shortCode}
                            </p>
                        </div>
                        
                        {/* Action Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleActions();
                            }}
                            className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{qr.scanCount || 0}</span>
                            <span className="text-muted-foreground">quét</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{timeAgo(qr.updatedAt || qr.createdAt)}</span>
                        </div>
                        <span
                            className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                                qr.isDynamic
                                    ? "bg-shiba-100 text-shiba-700 dark:bg-shiba-900/30 dark:text-shiba-400"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {qr.isDynamic ? "Dynamic" : "Static"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Menu Dropdown */}
            {isActive && (
                <div className="absolute right-4 top-14 w-48 rounded-xl border bg-card shadow-xl py-2 z-20 animate-scale-in">
                    <button
                        onClick={onOpenLink}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <span>Mở liên kết</span>
                    </button>
                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Download className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{isDownloading ? "Đang tải..." : "Tải xuống"}</span>
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                        <span>Chỉnh sửa</span>
                    </button>
                    <hr className="my-2 border-border" />
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Xóa</span>
                    </button>
                </div>
            )}
        </div>
    );
}

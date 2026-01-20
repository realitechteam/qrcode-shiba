"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    QrCode,
    MoreVertical,
    Pencil,
    Trash2,
    Download,
    ExternalLink,
    Filter,
    Loader2,
    AlertTriangle,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderSidebar } from "@/components/folders/FolderSidebar";
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
    imageUrl: string | null;
    scanCount: number;
    createdAt: string;
}

export default function QRCodesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal and action states
    const [deleteTarget, setDeleteTarget] = useState<QRCode | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchQRCodes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await qrApi.get("/qr", {
                params: {
                    folder: selectedFolderId || undefined,
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
    }, [selectedFolderId, searchQuery]);

    useEffect(() => {
        fetchQRCodes();
    }, [fetchQRCodes]);

    // Open confirm modal instead of browser confirm
    const handleDelete = (qr: QRCode) => {
        setDeleteTarget(qr);
    };

    // Actually delete after confirmation
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
        const baseUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3003";
        const url = qr.isDynamic
            ? `${baseUrl}/${qr.shortCode}`
            : qr.destinationUrl;
        if (url) window.open(url, "_blank");
    };

    const handleEdit = (qr: QRCode) => {
        router.push(`/dashboard/qr/${qr.id}/edit`);
    };

    const filteredQRCodes = qrCodes.filter(
        (qr) =>
            qr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            qr.destinationUrl?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Folder Sidebar */}
            <FolderSidebar
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                className="flex-shrink-0"
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">QR Codes</h1>
                        <p className="text-muted-foreground">
                            {selectedFolderId ? "Trong thư mục đã chọn" : "Quản lý tất cả QR codes của bạn"}
                        </p>
                    </div>
                    <Link href="/dashboard/qr/new">
                        <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo QR Code
                        </Button>
                    </Link>
                </div>

                {/* Filters and search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm QR codes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                        />
                    </div>

                    {/* Filter button */}
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Bộ lọc
                    </Button>

                    {/* View toggle */}
                    <div className="flex rounded-lg border p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded ${viewMode === "grid"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded ${viewMode === "list"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="rounded-xl border bg-card p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-shiba-500" />
                        <p className="mt-4 text-muted-foreground">Đang tải QR codes...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-xl border bg-card p-12 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                            <QrCode className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Thử lại
                        </Button>
                    </div>
                ) : filteredQRCodes.length === 0 ? (
                    <EmptyState />
                ) : viewMode === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredQRCodes.map((qr) => (
                            <QRCardGrid
                                key={qr.id}
                                qr={qr}
                                onOpenLink={handleOpenLink}
                                onDownload={handleDownload}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr className="text-left text-sm">
                                    <th className="p-4 font-medium">QR Code</th>
                                    <th className="p-4 font-medium hidden md:table-cell">Loại</th>
                                    <th className="p-4 font-medium hidden lg:table-cell">Lượt quét</th>
                                    <th className="p-4 font-medium hidden lg:table-cell">Ngày tạo</th>
                                    <th className="p-4 font-medium w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQRCodes.map((qr) => (
                                    <QRRowList
                                        key={qr.id}
                                        qr={qr}
                                        onOpenLink={handleOpenLink}
                                        onDownload={handleDownload}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => !isDeleting && setDeleteTarget(null)}
                    />

                    {/* Modal */}
                    <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                        <button
                            onClick={() => !isDeleting && setDeleteTarget(null)}
                            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
                            disabled={isDeleting}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="flex flex-col items-center text-center">
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
                                    className="flex-1"
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 gap-2"
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
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-xl border bg-card p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Chưa có QR code nào</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Tạo QR code đầu tiên của bạn để bắt đầu theo dõi và quản lý các liên kết
            </p>
            <Link href="/dashboard/qr/new">
                <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo QR Code đầu tiên
                </Button>
            </Link>
        </div>
    );
}

interface QRCardProps {
    qr: QRCode;
    onOpenLink: (qr: QRCode) => void;
    onDownload: (qr: QRCode) => void;
    onEdit: (qr: QRCode) => void;
    onDelete: (qr: QRCode) => void;
}

function QRCardGrid({ qr, onOpenLink, onDownload, onEdit, onDelete }: QRCardProps) {
    return (
        <div className="rounded-xl border bg-card p-4 hover:shadow-lg transition-all duration-200 group">
            {/* QR Preview */}
            <div className="aspect-square rounded-lg bg-muted mb-4 flex items-center justify-center overflow-hidden">
                {qr.imageUrl ? (
                    <img
                        src={qr.imageUrl}
                        alt={qr.name || "QR Code"}
                        className="w-full h-full object-contain p-2"
                    />
                ) : (
                    <QrCode className="h-16 w-16 text-muted-foreground/50" />
                )}
            </div>

            {/* Info */}
            <div className="space-y-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{qr.name || "Untitled"}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                            {qr.destinationUrl}
                        </p>
                    </div>
                    <DropdownMenu
                        qr={qr}
                        onOpenLink={onOpenLink}
                        onDownload={onDownload}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        {qr.scanCount || 0} lượt quét
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs ${qr.isDynamic
                            ? "bg-shiba-100 text-shiba-700 dark:bg-shiba-900/30 dark:text-shiba-400"
                            : "bg-muted text-muted-foreground"
                            }`}
                    >
                        {qr.isDynamic ? "Dynamic" : "Static"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function QRRowList({ qr, onOpenLink, onDownload, onEdit, onDelete }: QRCardProps) {
    return (
        <tr className="border-t hover:bg-muted/50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {qr.imageUrl ? (
                            <img
                                src={qr.imageUrl}
                                alt={qr.name || "QR Code"}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <QrCode className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium truncate">{qr.name || "Untitled"}</p>
                        <p className="text-sm text-muted-foreground truncate">
                            {qr.destinationUrl}
                        </p>
                    </div>
                </div>
            </td>
            <td className="p-4 hidden md:table-cell">
                <span className="capitalize">{qr.type}</span>
            </td>
            <td className="p-4 hidden lg:table-cell">{qr.scanCount || 0}</td>
            <td className="p-4 hidden lg:table-cell text-muted-foreground">
                {new Date(qr.createdAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="p-4">
                <DropdownMenu
                    qr={qr}
                    onOpenLink={onOpenLink}
                    onDownload={onDownload}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </td>
        </tr>
    );
}

function DropdownMenu({
    qr,
    onOpenLink,
    onDownload,
    onEdit,
    onDelete
}: {
    qr: QRCode;
    onOpenLink: (qr: QRCode) => void;
    onDownload: (qr: QRCode) => void;
    onEdit: (qr: QRCode) => void;
    onDelete: (qr: QRCode) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (action: (qr: QRCode) => void) => {
        setIsOpen(false);
        action(qr);
    };

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
            >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-card shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150">
                        <button
                            onClick={() => handleAction(onOpenLink)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors duration-150"
                        >
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <span>Mở liên kết</span>
                        </button>
                        <button
                            onClick={() => handleAction(onDownload)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors duration-150"
                        >
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <span>Tải xuống</span>
                        </button>
                        <button
                            onClick={() => handleAction(onEdit)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors duration-150"
                        >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            <span>Chỉnh sửa</span>
                        </button>
                        <hr className="my-2 border-border" />
                        <button
                            onClick={() => handleAction(onDelete)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Xóa</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

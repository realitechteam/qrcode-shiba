"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Folder,
    FolderEdit,
    ArrowLeft,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    QrCode,
    Download,
    ExternalLink,
    Plus,
    Clock,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/lib/haptic";
import qrApi from "@/lib/qr-api";

interface FolderData {
    id: string;
    name: string;
    color?: string;
    qrCount: number;
    createdAt: string;
}

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

export default function FolderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const folderId = params.id as string;

    const [folder, setFolder] = useState<FolderData | null>(null);
    const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchFolder = useCallback(async () => {
        try {
            setIsLoading(true);
            const [folderRes, qrRes] = await Promise.all([
                qrApi.get(`/folders/${folderId}`),
                qrApi.get(`/qr?folderId=${folderId}`),
            ]);
            setFolder(folderRes.data);
            const data = Array.isArray(qrRes.data) ? qrRes.data : qrRes.data.items || [];
            setQrCodes(data);
        } catch (err: any) {
            console.error("Failed to fetch folder:", err);
            toast({
                title: "Không tìm thấy thư mục",
                description: "Thư mục không tồn tại hoặc đã bị xóa",
                variant: "destructive",
            });
            router.push("/dashboard/folders");
        } finally {
            setIsLoading(false);
        }
    }, [folderId, toast, router]);

    useEffect(() => {
        if (folderId) fetchFolder();
    }, [folderId, fetchFolder]);

    const handleDeleteFolder = async () => {
        setIsDeleting(true);
        try {
            await qrApi.delete(`/folders/${folderId}`);
            toast({ title: "Đã xóa thư mục", description: folder?.name });
            router.push("/dashboard/folders");
        } catch (err: any) {
            toast({
                title: "Lỗi xóa thư mục",
                description: err.response?.data?.message || "Không thể xóa thư mục",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!folder) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/folders"
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: folder.color || "hsl(var(--shiba-100))" }}
                        >
                            <Folder className="h-5 w-5 text-shiba-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{folder.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {qrCodes.length} QR codes • {totalScans.toLocaleString()} lượt quét
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/folders/${folderId}/edit`}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Sửa
                        </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <QrCode className="h-4 w-4" />
                        <span className="text-xs">QR Codes</span>
                    </div>
                    <p className="text-2xl font-bold">{qrCodes.length}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Tổng quét</span>
                    </div>
                    <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
                </div>
            </div>

            {/* QR Codes List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">QR Codes trong thư mục</h2>
                    <Link href="/dashboard/qr/new">
                        <Button size="sm" className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                            <Plus className="h-4 w-4" />
                            Thêm QR
                        </Button>
                    </Link>
                </div>

                {qrCodes.length === 0 ? (
                    <div className="rounded-2xl border bg-card p-8 text-center">
                        <QrCode className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="font-medium mb-2">Chưa có QR code</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Thêm QR code vào thư mục này bằng cách kéo thả từ danh sách QR codes
                        </p>
                        <Link href="/dashboard/qr/new">
                            <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo QR Code mới
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {qrCodes.map((qr) => (
                            <Link
                                key={qr.id}
                                href={`/dashboard/qr/${qr.id}`}
                                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow group"
                            >
                                {qr.imageUrl ? (
                                    <img
                                        src={qr.imageUrl}
                                        alt={qr.name || qr.shortCode}
                                        className="h-16 w-16 rounded-lg object-cover bg-white border"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                                        <QrCode className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate group-hover:text-shiba-500 transition-colors">
                                        {qr.name || qr.shortCode}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {qr.destinationUrl || "No URL"}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            {qr.scanCount || 0} quét
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(qr.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        qr.isDynamic 
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    }`}>
                                        {qr.isDynamic ? "Dynamic" : "Static"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
                        <h2 className="text-lg font-semibold mb-2">Xóa thư mục?</h2>
                        <p className="text-muted-foreground mb-6">
                            Bạn có chắc muốn xóa thư mục "{folder.name}"?
                            QR codes trong thư mục này sẽ không bị xóa.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDeleteFolder}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Xóa"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

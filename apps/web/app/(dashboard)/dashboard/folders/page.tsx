"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Folder,
    FolderPlus,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    QrCode,
    ChevronRight,
    Palette,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/lib/haptic";
import qrApi from "@/lib/qr-api";

const FOLDER_COLORS = [
    { name: "Cam", value: "#ff7c10" },
    { name: "Đỏ", value: "#ef4444" },
    { name: "Xanh lá", value: "#22c55e" },
    { name: "Xanh dương", value: "#3b82f6" },
    { name: "Tím", value: "#8b5cf6" },
    { name: "Hồng", value: "#ec4899" },
    { name: "Vàng", value: "#f59e0b" },
    { name: "Xanh ngọc", value: "#14b8a6" },
];

interface FolderItem {
    id: string;
    name: string;
    qrCount: number;
    color?: string;
    createdAt: string;
}

export default function FoldersPage() {
    const { toast } = useToast();
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderColor, setNewFolderColor] = useState("#ff7c10");
    const [isCreating, setIsCreating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<FolderItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchFolders = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await qrApi.get("/folders");
            const data = Array.isArray(response.data) ? response.data : response.data.items || [];
            setFolders(data);
        } catch (err: any) {
            console.error("Failed to fetch folders:", err);
            // Show empty state instead of error
            setFolders([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    const handleCreate = async () => {
        if (!newFolderName.trim()) return;
        
        setIsCreating(true);
        try {
            await qrApi.post("/folders", { name: newFolderName.trim(), color: newFolderColor });
            toast({ title: "Đã tạo thư mục", description: newFolderName });
            setNewFolderName("");
            setNewFolderColor("#ff7c10");
            setShowCreateModal(false);
            fetchFolders();
        } catch (err: any) {
            toast({
                title: "Lỗi tạo thư mục",
                description: err.response?.data?.message || "Không thể tạo thư mục",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        
        setIsDeleting(true);
        try {
            await qrApi.delete(`/folders/${deleteTarget.id}`);
            toast({ title: "Đã xóa thư mục", description: deleteTarget.name });
            setDeleteTarget(null);
            fetchFolders();
        } catch (err: any) {
            toast({
                title: "Lỗi xóa thư mục",
                description: err.response?.data?.message || "Không thể xóa thư mục",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Thư mục</h1>
                    <p className="text-muted-foreground">
                        Quản lý và sắp xếp QR codes theo thư mục
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-shiba-500 hover:bg-shiba-600 gap-2"
                >
                    <FolderPlus className="h-4 w-4" />
                    Tạo thư mục
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-2/3 bg-muted rounded" />
                                    <div className="h-3 w-1/3 bg-muted rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : folders.length === 0 ? (
                <div className="rounded-2xl border bg-card p-12 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">Chưa có thư mục nào</h2>
                    <p className="text-muted-foreground mb-4">
                        Tạo thư mục để sắp xếp QR codes của bạn
                    </p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-shiba-500 hover:bg-shiba-600 gap-2"
                    >
                        <FolderPlus className="h-4 w-4" />
                        Tạo thư mục đầu tiên
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            className="group relative rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
                        >
                            <Link href={`/dashboard/folders/${folder.id}`} className="flex items-center gap-3">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
                                    style={{ backgroundColor: (folder.color || "#ff7c10") + "20" }}
                                >
                                    <Folder className="h-6 w-6" style={{ color: folder.color || "#ff7c10" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate group-hover:text-shiba-500 transition-colors">
                                        {folder.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <QrCode className="h-3 w-3" />
                                        <span>{folder.qrCount || 0} QR codes</span>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Link>

                            {/* Actions */}
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>

                                {activeMenuId === folder.id && (
                                    <div className="absolute top-8 right-0 bg-card rounded-lg border shadow-lg py-1 min-w-[120px] z-10">
                                        <Link
                                            href={`/dashboard/folders/${folder.id}/edit`}
                                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                                            onClick={() => setActiveMenuId(null)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Sửa
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                triggerHaptic("warning");
                                                setDeleteTarget(folder);
                                                setActiveMenuId(null);
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted w-full"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
                        <h2 className="text-lg font-semibold mb-4">Tạo thư mục mới</h2>
                        
                        {/* Preview */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 mb-4">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
                                style={{ backgroundColor: newFolderColor + "20" }}
                            >
                                <Folder className="h-6 w-6" style={{ color: newFolderColor }} />
                            </div>
                            <div>
                                <p className="font-medium">{newFolderName || "Tên thư mục"}</p>
                                <p className="text-sm text-muted-foreground">Xem trước</p>
                            </div>
                        </div>
                        
                        <input
                            type="text"
                            placeholder="Tên thư mục"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-shiba-500 mb-4"
                            autoFocus
                        />
                        
                        {/* Color Picker */}
                        <div className="mb-6">
                            <label className="text-sm font-medium flex items-center gap-2 mb-3">
                                <Palette className="h-4 w-4" />
                                Màu sắc
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {FOLDER_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setNewFolderColor(c.value)}
                                        className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                                            newFolderColor === c.value ? "ring-2 ring-offset-2 ring-shiba-500" : ""
                                        }`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    >
                                        {newFolderColor === c.value && (
                                            <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewFolderName("");
                                    setNewFolderColor("#ff7c10");
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="flex-1 bg-shiba-500 hover:bg-shiba-600"
                                onClick={handleCreate}
                                disabled={isCreating || !newFolderName.trim()}
                            >
                                {isCreating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Tạo thư mục"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
                        <h2 className="text-lg font-semibold mb-2">Xóa thư mục?</h2>
                        <p className="text-muted-foreground mb-6">
                            Bạn có chắc muốn xóa thư mục &quot;{deleteTarget.name}&quot;? 
                            QR codes trong thư mục này sẽ không bị xóa.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDelete}
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

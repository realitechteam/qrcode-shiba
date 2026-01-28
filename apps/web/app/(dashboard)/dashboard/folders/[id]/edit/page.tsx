"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Folder,
    Loader2,
    Check,
    Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

interface FolderData {
    id: string;
    name: string;
    color?: string;
}

export default function FolderEditPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const folderId = params.id as string;

    const [folder, setFolder] = useState<FolderData | null>(null);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#ff7c10");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchFolder = async () => {
            try {
                setIsLoading(true);
                const response = await qrApi.get(`/folders/${folderId}`);
                setFolder(response.data);
                setName(response.data.name);
                setColor(response.data.color || "#ff7c10");
            } catch (err: any) {
                toast({
                    title: "Không tìm thấy thư mục",
                    variant: "destructive",
                });
                router.push("/dashboard/folders");
            } finally {
                setIsLoading(false);
            }
        };

        if (folderId) fetchFolder();
    }, [folderId, toast, router]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên thư mục",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            await qrApi.patch(`/folders/${folderId}`, { name: name.trim(), color });
            toast({ title: "Đã lưu", description: "Thư mục đã được cập nhật" });
            router.push(`/dashboard/folders/${folderId}`);
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err.response?.data?.message || "Không thể cập nhật thư mục",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

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
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/folders/${folderId}`}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Chỉnh sửa thư mục</h1>
                    <p className="text-sm text-muted-foreground">Cập nhật tên và màu sắc</p>
                </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border bg-card p-6 space-y-6">
                {/* Preview */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                    <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl transition-colors"
                        style={{ backgroundColor: color + "20" }}
                    >
                        <Folder className="h-7 w-7" style={{ color }} />
                    </div>
                    <div>
                        <p className="font-medium">{name || "Tên thư mục"}</p>
                        <p className="text-sm text-muted-foreground">Xem trước</p>
                    </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tên thư mục</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Dự án Marketing"
                        className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                    />
                </div>

                {/* Color Picker */}
                <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Màu sắc
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {FOLDER_COLORS.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setColor(c.value)}
                                className={`relative h-10 w-10 rounded-full transition-transform hover:scale-110 ${
                                    color === c.value ? "ring-2 ring-offset-2 ring-shiba-500" : ""
                                }`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            >
                                {color === c.value && (
                                    <Check className="h-5 w-5 text-white absolute inset-0 m-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Link href={`/dashboard/folders/${folderId}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                            Hủy
                        </Button>
                    </Link>
                    <Button
                        className="flex-1 bg-shiba-500 hover:bg-shiba-600"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>
        </div>
    );
}

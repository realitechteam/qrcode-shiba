"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderSidebar } from "@/components/folders/FolderSidebar";

// Mock data - will be replaced with API call
const mockQRCodes: any[] = [];

export default function QRCodesPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    const filteredQRCodes = mockQRCodes.filter(
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
                className="hidden md:block flex-shrink-0"
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
                {filteredQRCodes.length === 0 ? (
                    <EmptyState />
                ) : viewMode === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredQRCodes.map((qr) => (
                            <QRCardGrid key={qr.id} qr={qr} />
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
                                    <QRRowList key={qr.id} qr={qr} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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

function QRCardGrid({ qr }: { qr: any }) {
    return (
        <div className="rounded-xl border bg-card p-4 hover:shadow-lg transition-shadow group">
            {/* QR Preview */}
            <div className="aspect-square rounded-lg bg-muted mb-4 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground/50" />
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
                    <DropdownMenu />
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

function QRRowList({ qr }: { qr: any }) {
    return (
        <tr className="border-t hover:bg-muted/50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <QrCode className="h-6 w-6 text-muted-foreground" />
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
                <DropdownMenu />
            </td>
        </tr>
    );
}

function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded hover:bg-muted"
            >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-card shadow-lg py-1 z-20">
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-muted">
                            <ExternalLink className="h-4 w-4" />
                            Mở liên kết
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-muted">
                            <Download className="h-4 w-4" />
                            Tải xuống
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-muted">
                            <Pencil className="h-4 w-4" />
                            Chỉnh sửa
                        </button>
                        <hr className="my-1" />
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-muted">
                            <Trash2 className="h-4 w-4" />
                            Xóa
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

interface QRItem {
    id: string;
    name: string;
    type: string;
    url: string;
    shortCode: string;
    createdAt: string;
    user?: { email: string; name: string | null };
    _count: { scans: number };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminQRCodesPage() {
    const [qrCodes, setQRCodes] = useState<QRItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);

    const loadQRCodes = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/qrcodes?page=${page}&limit=20`);
            setQRCodes(res.data.qrCodes);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Failed to load QR codes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQRCodes();
    }, [loadQRCodes]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">QR Codes</h1>
                <p className="text-sm text-gray-400 mt-1">{pagination.total} QR codes</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tên</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Loại</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Short Code</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-medium">Lượt quét</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        <td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : qrCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Không có QR code</td>
                                </tr>
                            ) : (
                                qrCodes.map((qr) => (
                                    <tr key={qr.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                        <td className="px-4 py-3 text-gray-200 font-medium">{qr.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${qr.type === "DYNAMIC" ? "bg-purple-500/20 text-purple-300" : "bg-gray-700/50 text-gray-400"}`}>
                                                {qr.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-xs">{qr.user?.email || "—"}</td>
                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{qr.shortCode}</td>
                                        <td className="px-4 py-3 text-right text-gray-200">{qr._count.scans}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(qr.createdAt).toLocaleDateString("vi-VN")}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                        <span className="text-xs text-gray-500">Trang {pagination.page}/{pagination.totalPages}</span>
                        <div className="flex gap-2">
                            <button disabled={pagination.page === 1} onClick={() => loadQRCodes(pagination.page - 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronLeft className="h-4 w-4" /></button>
                            <button disabled={pagination.page === pagination.totalPages} onClick={() => loadQRCodes(pagination.page + 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

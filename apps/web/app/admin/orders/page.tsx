"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

interface OrderItem {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    planId: string;
    createdAt: string;
    user?: { email: string; name: string | null };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const statusColors: Record<string, string> = {
    COMPLETED: "bg-green-500/20 text-green-300",
    PENDING: "bg-yellow-500/20 text-yellow-300",
    FAILED: "bg-red-500/20 text-red-300",
    CANCELLED: "bg-gray-700/50 text-gray-400",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "20" });
            if (statusFilter) params.set("status", statusFilter);
            const res = await api.get(`/admin/orders?${params}`);
            setOrders(res.data.orders);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Failed to load orders:", error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Đơn hàng</h1>
                    <p className="text-sm text-gray-400 mt-1">{pagination.total} đơn hàng</p>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200"
                >
                    <option value="">Tất cả</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="PENDING">Đang chờ</option>
                    <option value="FAILED">Thất bại</option>
                </select>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Gói</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-medium">Số tiền</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Thanh toán</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Không có đơn hàng</td>
                                </tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{o.id.slice(0, 8)}</td>
                                        <td className="px-4 py-3 text-gray-200">{o.user?.email || "—"}</td>
                                        <td className="px-4 py-3 text-gray-300">{o.planId || "—"}</td>
                                        <td className="px-4 py-3 text-right text-gray-200 font-medium">{o.amount.toLocaleString("vi-VN")}đ</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[o.status] || "bg-gray-700/50 text-gray-400"}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{o.paymentMethod || "—"}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
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
                            <button disabled={pagination.page === 1} onClick={() => loadOrders(pagination.page - 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronLeft className="h-4 w-4" /></button>
                            <button disabled={pagination.page === pagination.totalPages} onClick={() => loadOrders(pagination.page + 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

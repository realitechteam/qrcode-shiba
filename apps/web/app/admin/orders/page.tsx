"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface OrderItem {
    id: string;
    amount: number;
    status: string;
    paymentProvider: string;
    planId: string;
    billingCycle: string | null;
    currency: string | null;
    transactionId: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    user?: { id: string; email: string; name: string | null };
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
    const { toast } = useToast();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);

    // Edit Modal
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editOrder, setEditOrder] = useState<OrderItem | null>(null);
    const [editStatus, setEditStatus] = useState("");

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

    const openEdit = (order: OrderItem) => {
        setEditOrder(order);
        setEditStatus(order.status);
        setIsEditOpen(true);
    };

    const handleSave = async () => {
        if (!editOrder) return;
        try {
            await api.patch(`/admin/orders/${editOrder.id}`, { status: editStatus });
            setIsEditOpen(false);
            setEditOrder(null);
            loadOrders(pagination.page);
            toast({ title: "Success", description: "Order updated" });
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
        }
    };

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
                    <option value="CANCELLED">Đã hủy</option>
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
                                <th className="text-right px-4 py-3 text-gray-400 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        <td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Không có đơn hàng</td>
                                </tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{o.id.slice(0, 8)}</td>
                                        <td className="px-4 py-3 text-gray-200">{o.user?.email || "—"}</td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {o.planId || "—"}
                                            {o.billingCycle && <span className="text-[10px] text-gray-500 ml-1">/{o.billingCycle}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-200 font-medium">{o.amount?.toLocaleString("vi-VN")}đ</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[o.status] || "bg-gray-700/50 text-gray-400"}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{o.paymentProvider || "—"}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openEdit(o)}
                                                className="p-1.5 rounded text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                                title="Edit Order"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
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

            {/* Edit Order Modal */}
            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Chỉnh sửa đơn hàng"
            >
                {editOrder && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">ID</p>
                                <p className="text-gray-200 mt-0.5 font-mono text-xs">{editOrder.id.slice(0, 16)}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">User</p>
                                <p className="text-gray-200 mt-0.5">{editOrder.user?.email}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Gói</p>
                                <p className="text-gray-200 mt-0.5">{editOrder.planId}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Số tiền</p>
                                <p className="text-gray-200 mt-0.5">{editOrder.amount?.toLocaleString("vi-VN")}đ</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Trạng thái</label>
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-shiba-500"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="FAILED">FAILED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                            <Button
                                onClick={handleSave}
                                disabled={editStatus === editOrder.status}
                                className="bg-shiba-500 hover:bg-shiba-600 text-white disabled:opacity-50"
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

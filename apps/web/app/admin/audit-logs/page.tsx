"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { api } from "@/lib/api";

interface AuditLog {
    id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: any;
    createdAt: string;
    admin: { email: string; name: string | null };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const actionColors: Record<string, string> = {
    BAN_USER: "bg-red-500/20 text-red-300",
    UNBAN_USER: "bg-green-500/20 text-green-300",
    DELETE_USER: "bg-red-600/20 text-red-400",
    UPDATE_USER: "bg-yellow-500/20 text-yellow-300",
    IMPERSONATE_USER: "bg-cyan-500/20 text-cyan-300",
    UPDATE_ORDER: "bg-blue-500/20 text-blue-300",
    CREATE_AFFILIATE: "bg-purple-500/20 text-purple-300",
    UPDATE_AFFILIATE: "bg-purple-500/20 text-purple-300",
    UPDATE_AFFILIATE_LINK: "bg-indigo-500/20 text-indigo-300",
};

const actionLabels: Record<string, string> = {
    BAN_USER: "Ban User",
    UNBAN_USER: "Unban User",
    DELETE_USER: "Xóa User",
    UPDATE_USER: "Sửa User",
    IMPERSONATE_USER: "Impersonate",
    UPDATE_ORDER: "Sửa Order",
    CREATE_AFFILIATE: "Tạo Affiliate",
    UPDATE_AFFILIATE: "Sửa Affiliate",
    UPDATE_AFFILIATE_LINK: "Sửa Link AF",
};

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
    const [actionFilter, setActionFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const loadLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "50" });
            if (actionFilter) params.set("action", actionFilter);
            const res = await api.get(`/admin/audit-logs?${params}`);
            setLogs(res.data.logs);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Failed to load audit logs:", error);
        } finally {
            setLoading(false);
        }
    }, [actionFilter]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const formatDetails = (details: any) => {
        if (!details) return "—";
        try {
            const entries = Object.entries(details);
            return entries.map(([k, v]) => {
                if (typeof v === "object" && v !== null) {
                    return `${k}: ${JSON.stringify(v)}`;
                }
                return `${k}: ${v}`;
            }).join(", ");
        } catch {
            return JSON.stringify(details);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Lịch sử hệ thống</h1>
                    <p className="text-sm text-gray-400 mt-1">{pagination.total} bản ghi</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200"
                    >
                        <option value="">Tất cả</option>
                        <option value="BAN_USER">Ban User</option>
                        <option value="UNBAN_USER">Unban User</option>
                        <option value="DELETE_USER">Xóa User</option>
                        <option value="UPDATE_USER">Sửa User</option>
                        <option value="IMPERSONATE_USER">Impersonate</option>
                        <option value="UPDATE_ORDER">Sửa Order</option>
                        <option value="CREATE_AFFILIATE">Tạo Affiliate</option>
                        <option value="UPDATE_AFFILIATE">Sửa Affiliate</option>
                        <option value="UPDATE_AFFILIATE_LINK">Sửa Link AF</option>
                    </select>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Thời gian</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Admin</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Hành động</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Đối tượng</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Target ID</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        <td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Chưa có lịch sử nào</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3 text-gray-200 text-xs">
                                            {log.admin?.email || "unknown"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || "bg-gray-700/50 text-gray-400"}`}>
                                                {actionLabels[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{log.targetType}</td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.targetId.slice(0, 8)}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[300px] truncate" title={formatDetails(log.details)}>
                                            {formatDetails(log.details)}
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
                            <button disabled={pagination.page === 1} onClick={() => loadLogs(pagination.page - 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronLeft className="h-4 w-4" /></button>
                            <button disabled={pagination.page === pagination.totalPages} onClick={() => loadLogs(pagination.page + 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

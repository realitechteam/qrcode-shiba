"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, X, Check } from "lucide-react";
import { api } from "@/lib/api";

interface UserItem {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    authProvider: string;
    emailVerified: boolean;
    role: string;
    tier: string;
    referredBy: string | null;
    createdAt: string;
    _count: { qrCodes: number };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTier, setEditTier] = useState("");
    const [editRole, setEditRole] = useState("");

    const loadUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "20" });
            if (search) params.set("search", search);
            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data.users);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const startEdit = (user: UserItem) => {
        setEditingId(user.id);
        setEditTier(user.tier);
        setEditRole(user.role);
    };

    const saveEdit = async (userId: string) => {
        try {
            await api.patch(`/admin/users/${userId}`, { tier: editTier, role: editRole });
            setEditingId(null);
            loadUsers(pagination.page);
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Người dùng</h1>
                    <p className="text-sm text-gray-400 mt-1">{pagination.total} người dùng</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Tìm theo email hoặc tên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadUsers(1)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-600"
                />
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tên</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tier</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">QR</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Ngày tạo</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                        <td className="px-4 py-3 text-gray-200">{u.email}</td>
                                        <td className="px-4 py-3 text-gray-300">{u.name || "—"}</td>
                                        <td className="px-4 py-3">
                                            {editingId === u.id ? (
                                                <select value={editTier} onChange={(e) => setEditTier(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200">
                                                    <option value="FREE">FREE</option>
                                                    <option value="PRO">PRO</option>
                                                    <option value="BUSINESS">BUSINESS</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.tier === "PRO" ? "bg-purple-500/20 text-purple-300" : u.tier === "BUSINESS" ? "bg-blue-500/20 text-blue-300" : "bg-gray-700/50 text-gray-400"}`}>
                                                    {u.tier}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingId === u.id ? (
                                                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200">
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === "ADMIN" ? "bg-red-500/20 text-red-300" : "bg-gray-700/50 text-gray-400"}`}>
                                                    {u.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{u._count.qrCodes}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                                        <td className="px-4 py-3 text-right">
                                            {editingId === u.id ? (
                                                <div className="flex gap-1 justify-end">
                                                    <button onClick={() => saveEdit(u.id)} className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"><Check className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-gray-700 text-gray-400 hover:bg-gray-600"><X className="h-3.5 w-3.5" /></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEdit(u)} className="p-1.5 rounded text-gray-400 hover:bg-gray-800 hover:text-gray-200"><Pencil className="h-3.5 w-3.5" /></button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                        <span className="text-xs text-gray-500">Trang {pagination.page}/{pagination.totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => loadUsers(pagination.page - 1)}
                                className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => loadUsers(pagination.page + 1)}
                                className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

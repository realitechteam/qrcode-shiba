"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, X, Check, LogIn } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

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
    bannedAt: string | null;
    _count: { qrCodes: number };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { setTokens, setUser } = useAuthStore();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [editForm, setEditForm] = useState({ tier: "", role: "" });

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
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [search, toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleEditUser = (user: UserItem) => {
        setEditingUser(user);
        setEditForm({ tier: user.tier, role: user.role });
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            await api.patch(`/admin/users/${editingUser.id}`, editForm);
            setIsEditModalOpen(false);
            setEditingUser(null);
            loadUsers(pagination.page);
            toast({
                title: "Success",
                description: "User updated successfully",
            });
        } catch (error) {
            console.error("Failed to update user:", error);
            toast({
                title: "Error",
                description: "Failed to update user",
                variant: "destructive",
            });
        }
    };

    const handleImpersonate = async (userId: string) => {
        if (!confirm("Are you sure you want to log in as this user?")) return;
        try {
            const res = await api.post(`/admin/users/${userId}/impersonate`);
            const { accessToken, refreshToken, user } = res.data;

            // Set auth store
            setTokens(accessToken, refreshToken);
            setUser(user);

            // Redirect to dashboard
            toast({
                title: "Impersonation Active",
                description: `Logged in as ${user.email}`,
            });
            router.push("/dashboard/qr");
        } catch (error: any) {
            console.error("Impersonation failed:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Impersonation failed",
                variant: "destructive",
            });
        }
    };

    const toggleBan = async (user: UserItem) => {
        if (!confirm(`Are you sure you want to ${user.bannedAt ? "unban" : "ban"} ${user.email}?`)) return;

        try {
            if (user.bannedAt) {
                await api.patch(`/admin/users/${user.id}/unban`);
            } else {
                await api.patch(`/admin/users/${user.id}/ban`);
            }
            loadUsers(pagination.page);
        } catch (error: any) {
            console.error("Failed to toggle ban:", error);
            alert(error.response?.data?.message || "Failed to update user status");
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
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Ngày tạo</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        <td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${u.bannedAt ? "bg-red-900/10" : ""}`}>
                                        <td className="px-4 py-3 text-gray-200">
                                            <div className="flex flex-col">
                                                <span>{u.email}</span>
                                                {u.emailVerified && <span className="text-[10px] text-green-500 bg-green-500/10 px-1 py-0.5 rounded w-fit mt-0.5">VERIFIED</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{u.name || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.tier === "PRO" ? "bg-purple-500/20 text-purple-300" : u.tier === "BUSINESS" ? "bg-blue-500/20 text-blue-300" : "bg-gray-700/50 text-gray-400"}`}>
                                                {u.tier}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === "ADMIN" ? "bg-red-500/20 text-red-300" : "bg-gray-700/50 text-gray-400"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{u._count.qrCodes}</td>
                                        <td className="px-4 py-3">
                                            {u.bannedAt && <span className="text-xs text-red-400 font-medium">BANNED</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {/* Impersonate */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleImpersonate(u.id)}
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                                                    title="Login as User"
                                                >
                                                    <LogIn className="h-4 w-4" />
                                                </Button>

                                                {/* Edit User */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleEditUser(u)}
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                {/* Ban/Unban */}
                                                {u.role !== "ADMIN" && (
                                                    <button
                                                        onClick={() => toggleBan(u)}
                                                        className={`p-1.5 rounded text-xs font-medium ml-2 ${u.bannedAt ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}`}
                                                        title={u.bannedAt ? "Unban User" : "Ban User"}
                                                    >
                                                        {u.bannedAt ? "UNBAN" : "BAN"}
                                                    </button>
                                                )}
                                            </div>
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

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit User"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="text"
                            value={editingUser?.email || ""}
                            disabled
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                        <select
                            value={editForm.role}
                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-shiba-500"
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tier Plan</label>
                        <select
                            value={editForm.tier}
                            onChange={(e) => setEditForm(prev => ({ ...prev, tier: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-shiba-500"
                        >
                            <option value="FREE">Free</option>
                            <option value="PRO">Pro</option>
                            <option value="BUSINESS">Business</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveUser} className="bg-shiba-500 hover:bg-shiba-600 text-white">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

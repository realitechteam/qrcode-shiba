"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, LogIn, Trash2, Eye, X, ShieldBan, ShieldCheck } from "lucide-react";
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

interface UserDetail extends UserItem {
    providerId: string | null;
    updatedAt: string;
    subscription: {
        plan: string;
        expiresAt: string | null;
    } | null;
    _count: {
        qrCodes: number;
        orders: number;
        apiKeys: number;
        folders: number;
    };
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
    const [tierFilter, setTierFilter] = useState("");
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [editForm, setEditForm] = useState({ tier: "", role: "" });

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Ban Modal State
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [banTarget, setBanTarget] = useState<UserItem | null>(null);
    const [banReason, setBanReason] = useState("");
    const [banCustomReason, setBanCustomReason] = useState("");

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
    const [transferEmail, setTransferEmail] = useState("");
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const loadUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "20" });
            if (search) params.set("search", search);
            if (tierFilter) params.set("tier", tierFilter);
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
    }, [search, tierFilter, toast]);

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

            setTokens(accessToken, refreshToken);
            setUser(user);

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

    const openBanModal = (user: UserItem) => {
        setBanTarget(user);
        setBanReason("");
        setBanCustomReason("");
        setIsBanModalOpen(true);
    };

    const handleBan = async () => {
        if (!banTarget) return;
        const reason = banReason === "OTHER" ? banCustomReason : banReason;
        try {
            await api.patch(`/admin/users/${banTarget.id}/ban`, { reason });
            setIsBanModalOpen(false);
            setBanTarget(null);
            loadUsers(pagination.page);
            toast({ title: "Success", description: `User banned successfully` });
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to ban user", variant: "destructive" });
        }
    };

    const handleUnban = async (user: UserItem) => {
        if (!confirm(`Unban ${user.email}?`)) return;
        try {
            await api.patch(`/admin/users/${user.id}/unban`);
            loadUsers(pagination.page);
            toast({ title: "Success", description: "User unbanned" });
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
        }
    };

    const openDeleteModal = (user: UserItem) => {
        setDeleteTarget(user);
        setTransferEmail("");
        setDeleteConfirmText("");
        setIsDeleteModalOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!deleteTarget || deleteConfirmText !== "DELETE") return;
        try {
            const body: any = {};
            if (transferEmail.trim()) {
                // Look up user ID by email first
                const lookupRes = await api.get(`/admin/users?search=${encodeURIComponent(transferEmail.trim())}&limit=1`);
                const foundUser = lookupRes.data.users?.[0];
                if (!foundUser) {
                    toast({ title: "Error", description: `Transfer target "${transferEmail}" not found`, variant: "destructive" });
                    return;
                }
                body.transferToUserId = foundUser.id;
            }
            await api.delete(`/admin/users/${deleteTarget.id}`, { data: body });
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
            loadUsers(pagination.page);
            toast({ title: "Done", description: "User deleted successfully" });
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to delete user", variant: "destructive" });
        }
    };

    const handleViewDetail = async (userId: string) => {
        setDetailLoading(true);
        setIsDetailModalOpen(true);
        try {
            const res = await api.get(`/admin/users/${userId}`);
            setDetailUser(res.data);
        } catch (error) {
            console.error("Failed to load user detail:", error);
            toast({ title: "Error", description: "Failed to load user detail", variant: "destructive" });
            setIsDetailModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const providerBadge = (provider: string) => {
        switch (provider) {
            case "GOOGLE": return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">Google</span>;
            case "EMAIL": return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Email</span>;
            default: return <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">{provider}</span>;
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

            {/* Search & Filter */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-md">
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
                <select
                    value={tierFilter}
                    onChange={(e) => { setTierFilter(e.target.value); }}
                    className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:border-gray-600 min-w-[120px]"
                >
                    <option value="">All Tiers</option>
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="BUSINESS">Business</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tên</th>
                                <th className="text-left px-4 py-3 text-gray-400 font-medium">Provider</th>
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
                                        <td colSpan={9} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${u.bannedAt ? "bg-red-900/10" : ""}`}>
                                        <td className="px-4 py-3 text-gray-200">
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[200px]">{u.email}</span>
                                                {u.emailVerified && <span className="text-[10px] text-green-500 bg-green-500/10 px-1 py-0.5 rounded w-fit mt-0.5">VERIFIED</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{u.name || "—"}</td>
                                        <td className="px-4 py-3">{providerBadge(u.authProvider)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.tier === "PRO" ? "bg-purple-500/20 text-purple-300" :
                                                u.tier === "BUSINESS" ? "bg-blue-500/20 text-blue-300" :
                                                    "bg-gray-700/50 text-gray-400"
                                                }`}>
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
                                            {u.bannedAt ? (
                                                <span className="text-xs text-red-400 font-medium">BANNED</span>
                                            ) : (
                                                <span className="text-xs text-green-400/60">Active</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-1 justify-end">
                                                {/* View Detail */}
                                                <Button
                                                    size="icon" variant="ghost"
                                                    onClick={() => handleViewDetail(u.id)}
                                                    className="h-7 w-7 text-gray-500 hover:text-white hover:bg-gray-700"
                                                    title="View Detail"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>

                                                {/* Impersonate */}
                                                <Button
                                                    size="icon" variant="ghost"
                                                    onClick={() => handleImpersonate(u.id)}
                                                    className="h-7 w-7 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                                                    title="Login as User"
                                                >
                                                    <LogIn className="h-3.5 w-3.5" />
                                                </Button>

                                                {/* Edit User */}
                                                <Button
                                                    size="icon" variant="ghost"
                                                    onClick={() => handleEditUser(u)}
                                                    className="h-7 w-7 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>

                                                {/* Ban/Unban */}
                                                {u.role !== "ADMIN" && (
                                                    u.bannedAt ? (
                                                        <button
                                                            onClick={() => handleUnban(u)}
                                                            className="px-1.5 py-1 rounded text-[10px] font-bold text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                                            title="Unban User"
                                                        >
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openBanModal(u)}
                                                            className="px-1.5 py-1 rounded text-[10px] font-bold text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                                            title="Ban User"
                                                        >
                                                            <ShieldBan className="h-3.5 w-3.5" />
                                                        </button>
                                                    )
                                                )}

                                                {/* Delete */}
                                                {u.role !== "ADMIN" && (
                                                    <Button
                                                        size="icon" variant="ghost"
                                                        onClick={() => openDeleteModal(u)}
                                                        className="h-7 w-7 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
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

            {/* User Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setDetailUser(null); }}
                title="User Detail"
            >
                {detailLoading ? (
                    <div className="py-8 text-center text-gray-400 animate-pulse">Loading...</div>
                ) : detailUser ? (
                    <div className="space-y-4">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-4">
                            {detailUser.avatarUrl ? (
                                <img src={detailUser.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-400">
                                    {detailUser.email[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-white font-medium">{detailUser.name || "No name"}</p>
                                <p className="text-sm text-gray-400">{detailUser.email}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Provider</p>
                                <p className="text-gray-200 mt-0.5">{providerBadge(detailUser.authProvider)}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Tier</p>
                                <p className="text-gray-200 mt-0.5">{detailUser.tier}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Role</p>
                                <p className="text-gray-200 mt-0.5">{detailUser.role}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Status</p>
                                <p className="mt-0.5">{detailUser.bannedAt ? <span className="text-red-400">Banned</span> : <span className="text-green-400">Active</span>}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">QR Codes</p>
                                <p className="text-gray-200 mt-0.5 font-mono">{detailUser._count.qrCodes}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Orders</p>
                                <p className="text-gray-200 mt-0.5 font-mono">{detailUser._count.orders}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">Folders</p>
                                <p className="text-gray-200 mt-0.5 font-mono">{detailUser._count.folders}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs">API Keys</p>
                                <p className="text-gray-200 mt-0.5 font-mono">{detailUser._count.apiKeys}</p>
                            </div>
                        </div>

                        {/* Subscription */}
                        {detailUser.subscription && (
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-500 text-xs mb-1">Subscription</p>
                                <p className="text-gray-200 text-sm">
                                    Plan: <strong>{detailUser.subscription.plan}</strong>
                                    {detailUser.subscription.expiresAt && (
                                        <> · Expires: {new Date(detailUser.subscription.expiresAt).toLocaleDateString("vi-VN")}</>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="flex gap-3 text-xs text-gray-500">
                            <span>Created: {new Date(detailUser.createdAt).toLocaleString("vi-VN")}</span>
                            <span>Updated: {new Date(detailUser.updatedAt).toLocaleString("vi-VN")}</span>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 flex gap-2 border-t border-gray-800">
                            <Button
                                size="sm" variant="outline"
                                className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                                onClick={() => { setIsDetailModalOpen(false); handleImpersonate(detailUser.id); }}
                            >
                                <LogIn className="h-3.5 w-3.5 mr-1.5" /> Impersonate
                            </Button>
                            <Button
                                size="sm" variant="outline"
                                className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                                onClick={() => { setIsDetailModalOpen(false); handleEditUser(detailUser as any); }}
                            >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                            </Button>
                            {detailUser.role !== "ADMIN" && (
                                <Button
                                    size="sm" variant="outline"
                                    className="text-red-400 border-red-500/30 hover:bg-red-500/10 ml-auto"
                                    onClick={() => { setIsDetailModalOpen(false); openDeleteModal(detailUser as any); }}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}
            </Modal>

            {/* Ban Reason Modal */}
            <Modal
                isOpen={isBanModalOpen}
                onClose={() => setIsBanModalOpen(false)}
                title={`Ban ${banTarget?.email || ""}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Lý do ban</label>
                        <select
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500"
                        >
                            <option value="">Chọn lý do...</option>
                            <option value="Vi phạm TOS">Vi phạm TOS</option>
                            <option value="Spam">Spam</option>
                            <option value="Gian lận">Gian lận</option>
                            <option value="Lạm dụng hệ thống">Lạm dụng hệ thống</option>
                            <option value="Nội dung không phù hợp">Nội dung không phù hợp</option>
                            <option value="OTHER">Khác (nhập lý do)...</option>
                        </select>
                    </div>
                    {banReason === "OTHER" && (
                        <div>
                            <input
                                type="text"
                                placeholder="Nhập lý do..."
                                value={banCustomReason}
                                onChange={(e) => setBanCustomReason(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                    )}
                    <div className="pt-2 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsBanModalOpen(false)}>Hủy</Button>
                        <Button
                            onClick={handleBan}
                            disabled={!banReason || (banReason === "OTHER" && !banCustomReason.trim())}
                            className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                        >
                            Ban User
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={`Xóa ${deleteTarget?.email || ""}`}
            >
                <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300">
                        ⚠️ Hành động này <strong>KHÔNG THỂ HOÀN TÁC</strong>. Toàn bộ dữ liệu của user sẽ bị xóa vĩnh viễn.
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Chuyển QR Codes sang tài khoản khác (tùy chọn)
                        </label>
                        <input
                            type="email"
                            placeholder="email người nhận QR..."
                            value={transferEmail}
                            onChange={(e) => setTransferEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 placeholder:text-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Để trống nếu muốn xóa toàn bộ QR codes</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Gõ <code className="text-red-400 bg-red-500/10 px-1 rounded">DELETE</code> để xác nhận
                        </label>
                        <input
                            type="text"
                            placeholder="DELETE"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Hủy</Button>
                        <Button
                            onClick={handleDeleteUser}
                            disabled={deleteConfirmText !== "DELETE"}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        >
                            Xóa vĩnh viễn
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

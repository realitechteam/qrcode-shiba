"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, X, Settings, Plus, Pencil, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface AffiliateItem {
    id: string;
    userId: string;
    totalEarnings: number;
    pendingBalance: number;
    paidBalance: number;
    status: string;
    bankName: string | null;
    bankAccount: string | null;
    bankHolder: string | null;
    user: { email: string; name: string | null };
    links: {
        id: string;
        referralCode: string;
        label: string | null;
        commissionRate: number;
        discountRate: number;
        clickCount: number;
        referralCount: number;
        isActive: boolean;
    }[];
    _count: { referrals: number; commissions: number };
}

interface PayoutItem {
    id: string;
    amount: number;
    method: string;
    status: string;
    note: string | null;
    createdAt: string;
    affiliate: {
        user: { email: string; name: string | null };
    };
}

export default function AdminAffiliatesPage() {
    const { toast } = useToast();
    const [tab, setTab] = useState<"affiliates" | "payouts" | "config">("affiliates");
    const [affiliates, setAffiliates] = useState<AffiliateItem[]>([]);
    const [payouts, setPayouts] = useState<PayoutItem[]>([]);
    const [config, setConfig] = useState<Record<string, string>>({});
    const [totalRatePercent, setTotalRatePercent] = useState("");
    const [loading, setLoading] = useState(true);
    const [affPagination, setAffPagination] = useState({ page: 1, totalPages: 0, total: 0 });
    const [payPagination, setPayPagination] = useState({ page: 1, totalPages: 0, total: 0 });

    // Create Affiliate Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createEmail, setCreateEmail] = useState("");
    const [creating, setCreating] = useState(false);

    // Edit Affiliate Modal
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editAffiliate, setEditAffiliate] = useState<AffiliateItem | null>(null);
    const [editForm, setEditForm] = useState({ status: "", bankName: "", bankAccount: "", bankHolder: "" });

    // Edit Link Modal
    const [isLinkEditOpen, setIsLinkEditOpen] = useState(false);
    const [editLink, setEditLink] = useState<AffiliateItem["links"][0] | null>(null);
    const [linkForm, setLinkForm] = useState({ commissionPercent: "", discountPercent: "", label: "", isActive: true });

    const loadAffiliates = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/affiliates?page=${page}&limit=20`);
            setAffiliates(res.data.affiliates);
            setAffPagination({ page: res.data.pagination.page, totalPages: res.data.pagination.totalPages, total: res.data.pagination.total });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPayouts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/affiliates/payouts?page=${page}&limit=20`);
            setPayouts(res.data.payouts);
            setPayPagination({ page: res.data.pagination.page, totalPages: res.data.pagination.totalPages, total: res.data.pagination.total });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadConfig = useCallback(async () => {
        try {
            const res = await api.get("/admin/config");
            setConfig(res.data);
            const rate = parseFloat(res.data.affiliate_total_rate || "0.20");
            setTotalRatePercent(String(Math.round(rate * 100)));
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (tab === "affiliates") loadAffiliates();
        if (tab === "payouts") loadPayouts();
        if (tab === "config") loadConfig();
    }, [tab, loadAffiliates, loadPayouts, loadConfig]);

    const handlePayoutAction = async (payoutId: string, status: "COMPLETED" | "FAILED") => {
        try {
            await api.patch(`/admin/affiliates/payouts/${payoutId}`, { status });
            loadPayouts(payPagination.page);
            toast({ title: "Success", description: `Payout ${status.toLowerCase()}` });
        } catch (error) {
            console.error(error);
        }
    };

    const saveConfig = async () => {
        try {
            const decimalValue = (parseFloat(totalRatePercent || "0") / 100).toFixed(4);
            await api.patch("/admin/config", { key: "affiliate_total_rate", value: decimalValue });
            toast({ title: "Success", description: "Đã lưu cấu hình!" });
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateAffiliate = async () => {
        if (!createEmail.trim()) return;
        setCreating(true);
        try {
            // Look up user by email
            const lookupRes = await api.get(`/admin/users?search=${encodeURIComponent(createEmail.trim())}&limit=1`);
            const foundUser = lookupRes.data.users?.[0];
            if (!foundUser) {
                toast({ title: "Error", description: `User "${createEmail}" not found`, variant: "destructive" });
                setCreating(false);
                return;
            }
            await api.post("/admin/affiliates", { userId: foundUser.id });
            setIsCreateOpen(false);
            setCreateEmail("");
            loadAffiliates(affPagination.page);
            toast({ title: "Success", description: "Affiliate created" });
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
        } finally {
            setCreating(false);
        }
    };

    const openEditAffiliate = (a: AffiliateItem) => {
        setEditAffiliate(a);
        setEditForm({
            status: a.status,
            bankName: a.bankName || "",
            bankAccount: a.bankAccount || "",
            bankHolder: a.bankHolder || "",
        });
        setIsEditOpen(true);
    };

    const handleSaveAffiliate = async () => {
        if (!editAffiliate) return;
        try {
            await api.patch(`/admin/affiliates/${editAffiliate.id}`, editForm);
            setIsEditOpen(false);
            loadAffiliates(affPagination.page);
            toast({ title: "Success", description: "Affiliate updated" });
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
        }
    };

    const openEditLink = (link: AffiliateItem["links"][0]) => {
        setEditLink(link);
        setLinkForm({
            commissionPercent: String(Math.round(link.commissionRate * 100)),
            discountPercent: String(Math.round(link.discountRate * 100)),
            label: link.label || "",
            isActive: link.isActive,
        });
        setIsLinkEditOpen(true);
    };

    const handleSaveLink = async () => {
        if (!editLink) return;
        try {
            await api.patch(`/admin/affiliates/links/${editLink.id}`, {
                commissionRate: parseFloat(linkForm.commissionPercent) / 100,
                discountRate: parseFloat(linkForm.discountPercent) / 100,
                label: linkForm.label || null,
                isActive: linkForm.isActive,
            });
            setIsLinkEditOpen(false);
            loadAffiliates(affPagination.page);
            toast({ title: "Success", description: "Link updated" });
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Affiliates</h1>
                    <p className="text-sm text-gray-400 mt-1">Quản lý chương trình affiliate</p>
                </div>
                {tab === "affiliates" && (
                    <Button
                        onClick={() => { setCreateEmail(""); setIsCreateOpen(true); }}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        size="sm"
                    >
                        <UserPlus className="h-4 w-4 mr-1.5" /> Tạo Affiliate
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit">
                {(["affiliates", "payouts", "config"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-gray-800 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                        {t === "affiliates" ? "Affiliates" : t === "payouts" ? "Thanh toán" : "Cấu hình"}
                    </button>
                ))}
            </div>

            {/* Affiliates Tab */}
            {tab === "affiliates" && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Links</th>
                                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Referrals</th>
                                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Tổng thu</th>
                                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Chờ rút</th>
                                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Đã trả</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                                    <th className="text-right px-4 py-3 text-gray-400 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="border-b border-gray-800/50">
                                            <td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : affiliates.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Chưa có affiliate</td></tr>
                                ) : (
                                    affiliates.map((a) => (
                                        <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                            <td className="px-4 py-3">
                                                <div className="text-gray-200">{a.user.email}</div>
                                                {a.user.name && <div className="text-xs text-gray-500">{a.user.name}</div>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {a.links.map(l => (
                                                        <button
                                                            key={l.id}
                                                            onClick={() => openEditLink(l)}
                                                            className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors"
                                                            title={`${l.referralCode} | C:${Math.round(l.commissionRate * 100)}% D:${Math.round(l.discountRate * 100)}% | Click to edit`}
                                                        >
                                                            {l.label || l.referralCode}
                                                            <span className="ml-1 text-gray-500">
                                                                {Math.round(l.commissionRate * 100)}%/{Math.round(l.discountRate * 100)}%
                                                            </span>
                                                        </button>
                                                    ))}
                                                    {a.links.length === 0 && <span className="text-xs text-gray-600">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-300">{a._count.referrals}</td>
                                            <td className="px-4 py-3 text-right text-gray-200">{a.totalEarnings.toLocaleString("vi-VN")}đ</td>
                                            <td className="px-4 py-3 text-right text-yellow-400">{a.pendingBalance.toLocaleString("vi-VN")}đ</td>
                                            <td className="px-4 py-3 text-right text-green-400">{a.paidBalance.toLocaleString("vi-VN")}đ</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.status === "ACTIVE" ? "bg-green-500/20 text-green-300" : "bg-gray-700/50 text-gray-400"}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openEditAffiliate(a)}
                                                    className="p-1.5 rounded text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                                    title="Edit Affiliate"
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

                    {affPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                            <span className="text-xs text-gray-500">Trang {affPagination.page}/{affPagination.totalPages}</span>
                            <div className="flex gap-2">
                                <button disabled={affPagination.page === 1} onClick={() => loadAffiliates(affPagination.page - 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronLeft className="h-4 w-4" /></button>
                                <button disabled={affPagination.page === affPagination.totalPages} onClick={() => loadAffiliates(affPagination.page + 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronRight className="h-4 w-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Payouts Tab */}
            {tab === "payouts" && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Số tiền</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Phương thức</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Ngày</th>
                                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="border-b border-gray-800/50">
                                            <td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : payouts.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Không có yêu cầu thanh toán</td></tr>
                                ) : (
                                    payouts.map((p) => (
                                        <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                            <td className="px-4 py-3 text-gray-200">{p.affiliate.user.email}</td>
                                            <td className="px-4 py-3 text-right text-gray-200 font-medium">{p.amount.toLocaleString("vi-VN")}đ</td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">{p.method}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === "PENDING" ? "bg-yellow-500/20 text-yellow-300" : p.status === "COMPLETED" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                                            <td className="px-4 py-3 text-right">
                                                {p.status === "PENDING" && (
                                                    <div className="flex gap-1 justify-end">
                                                        <button onClick={() => handlePayoutAction(p.id, "COMPLETED")} className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30" title="Duyệt"><Check className="h-3.5 w-3.5" /></button>
                                                        <button onClick={() => handlePayoutAction(p.id, "FAILED")} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30" title="Từ chối"><X className="h-3.5 w-3.5" /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {payPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                            <span className="text-xs text-gray-500">Trang {payPagination.page}/{payPagination.totalPages}</span>
                            <div className="flex gap-2">
                                <button disabled={payPagination.page === 1} onClick={() => loadPayouts(payPagination.page - 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronLeft className="h-4 w-4" /></button>
                                <button disabled={payPagination.page === payPagination.totalPages} onClick={() => loadPayouts(payPagination.page + 1)} className="p-1.5 rounded bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"><ChevronRight className="h-4 w-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Config Tab */}
            {tab === "config" && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-white">Cấu hình Affiliate</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Tổng tỷ lệ affiliate tối đa (commission + discount)
                            </label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="100"
                                    value={totalRatePercent}
                                    onChange={(e) => setTotalRatePercent(e.target.value)}
                                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-gray-500"
                                />
                                <span className="text-gray-300 text-lg font-medium">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Mỗi link affiliate có thể chia commission + discount nhưng tổng không vượt quá tỷ lệ này
                            </p>
                        </div>

                        <button
                            onClick={saveConfig}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Lưu cấu hình
                        </button>
                    </div>
                </div>
            )}

            {/* Create Affiliate Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Tạo Affiliate mới"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email người dùng</label>
                        <input
                            type="email"
                            placeholder="user@example.com"
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500 placeholder:text-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tìm user theo email để tạo tài khoản affiliate</p>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                        <Button
                            onClick={handleCreateAffiliate}
                            disabled={!createEmail.trim() || creating}
                            className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                        >
                            {creating ? "Đang tạo..." : "Tạo Affiliate"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Affiliate Modal */}
            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={`Chỉnh sửa: ${editAffiliate?.user.email || ""}`}
            >
                {editAffiliate && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={editForm.bankName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, bankName: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="Vietcombank"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Bank Account</label>
                            <input
                                type="text"
                                value={editForm.bankAccount}
                                onChange={(e) => setEditForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="1234567890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Bank Holder</label>
                            <input
                                type="text"
                                value={editForm.bankHolder}
                                onChange={(e) => setEditForm(prev => ({ ...prev, bankHolder: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="NGUYEN VAN A"
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                            <Button onClick={handleSaveAffiliate} className="bg-purple-500 hover:bg-purple-600 text-white">
                                Lưu
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Link Modal */}
            <Modal
                isOpen={isLinkEditOpen}
                onClose={() => setIsLinkEditOpen(false)}
                title={`Chỉnh sửa Link: ${editLink?.label || editLink?.referralCode || ""}`}
            >
                {editLink && (
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                            <p className="text-gray-500 text-xs">Referral Code</p>
                            <p className="text-gray-200 mt-0.5 font-mono">{editLink.referralCode}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Label</label>
                            <input
                                type="text"
                                value={linkForm.label}
                                onChange={(e) => setLinkForm(prev => ({ ...prev, label: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="Optional label..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Commission %</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={linkForm.commissionPercent}
                                        onChange={(e) => setLinkForm(prev => ({ ...prev, commissionPercent: e.target.value }))}
                                        className="w-full px-3 py-2 pr-7 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Discount %</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={linkForm.discountPercent}
                                        onChange={(e) => setLinkForm(prev => ({ ...prev, discountPercent: e.target.value }))}
                                        className="w-full px-3 py-2 pr-7 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-400">Active</label>
                            <button
                                onClick={() => setLinkForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`w-10 h-5 rounded-full transition-colors ${linkForm.isActive ? "bg-green-500" : "bg-gray-700"}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${linkForm.isActive ? "translate-x-5" : ""}`} />
                            </button>
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsLinkEditOpen(false)}>Hủy</Button>
                            <Button onClick={handleSaveLink} className="bg-purple-500 hover:bg-purple-600 text-white">
                                Lưu
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

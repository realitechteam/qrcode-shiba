"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, X, Clock, DollarSign, Settings } from "lucide-react";
import { api } from "@/lib/api";

interface AffiliateItem {
    id: string;
    totalEarnings: number;
    pendingBalance: number;
    paidBalance: number;
    status: string;
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
    const [tab, setTab] = useState<"affiliates" | "payouts" | "config">("affiliates");
    const [affiliates, setAffiliates] = useState<AffiliateItem[]>([]);
    const [payouts, setPayouts] = useState<PayoutItem[]>([]);
    const [config, setConfig] = useState<Record<string, string>>({});
    const [totalRate, setTotalRate] = useState("");
    const [loading, setLoading] = useState(true);
    const [affPagination, setAffPagination] = useState({ page: 1, totalPages: 0, total: 0 });
    const [payPagination, setPayPagination] = useState({ page: 1, totalPages: 0, total: 0 });

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
            setTotalRate(res.data.affiliate_total_rate || "0.20");
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
        } catch (error) {
            console.error(error);
        }
    };

    const saveConfig = async () => {
        try {
            await api.patch("/admin/config", { key: "affiliate_total_rate", value: totalRate });
            alert("Đã lưu cấu hình!");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Affiliates</h1>
                <p className="text-sm text-gray-400 mt-1">Quản lý chương trình affiliate</p>
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
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="border-b border-gray-800/50">
                                            <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : affiliates.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Chưa có affiliate</td></tr>
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
                                                        <span key={l.id} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300" title={`${l.referralCode} | C:${(l.commissionRate * 100).toFixed(0)}% D:${(l.discountRate * 100).toFixed(0)}%`}>
                                                            {l.label || l.referralCode}
                                                        </span>
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
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={totalRate}
                                    onChange={(e) => setTotalRate(e.target.value)}
                                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-gray-500"
                                />
                                <span className="text-gray-400 text-sm">= {(parseFloat(totalRate || "0") * 100).toFixed(0)}%</span>
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
        </div>
    );
}

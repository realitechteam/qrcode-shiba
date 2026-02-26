"use client";

import { useEffect, useState } from "react";
import {
    Users,
    ShoppingCart,
    QrCode,
    BadgePercent,
    TrendingUp,
    DollarSign,
    BarChart3,
    Clock,
    Search,
    Eye,
    MousePointerClick,
    ArrowUpRight,
    ArrowDownRight,
    CalendarDays,
    XCircle,
    CheckCircle2,
    AlertTriangle,
    Wallet,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Stats {
    overview: {
        totalUsers: number;
        totalQRCodes: number;
        activeSubscriptions: number;
    };
    revenue: {
        total: number;
        totalOrders: number;
        today: number;
        todayOrders: number;
        thisMonth: number;
        thisMonthOrders: number;
        thisYear: number;
        thisYearOrders: number;
    };
    orders: {
        total: number;
        pending: number;
        completed: number;
        cancelled: number;
        failed: number;
    };
    scans: {
        total: number;
        today: number;
        thisMonth: number;
        totalQRCodes: number;
    };
    affiliate: {
        totalAffiliates: number;
        activeAffiliates: number;
        totalReferrals: number;
        totalCommission: number;
        pendingPayouts: number;
        totalClicks: number;
    };
    chartData: { date: string; revenue: number; scans: number }[];
    monthlyRevenue: { month: string; revenue: number; orders: number }[];
}

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtVND = (n: number) => `${fmt(n)}đ`;

function StatCard({ label, value, icon: Icon, color, bgColor, sub }: {
    label: string; value: string | number; icon: any; color: string; bgColor: string; sub?: string;
}) {
    return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{label}</span>
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}

function SectionHeader({ title, icon: Icon, color }: { title: string; icon: any; color: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <Icon className={`h-5 w-5 ${color}`} />
            <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.set("startDate", new Date(startDate).toISOString());
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                params.set("endDate", end.toISOString());
            }
            const res = await api.get(`/admin/stats?${params.toString()}`);
            setStats(res.data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 animate-pulse">
                            <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                            <div className="h-8 bg-gray-800 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header + Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">Tổng quan hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-shiba-500"
                    />
                    <span className="text-gray-500">→</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-shiba-500"
                    />
                    <Button onClick={loadStats} className="bg-shiba-500 hover:bg-shiba-600">
                        <Search className="h-4 w-4 mr-2" />
                        Lọc
                    </Button>
                </div>
            </div>

            {/* ============================== */}
            {/* SECTION 1: WEBSITE OVERVIEW    */}
            {/* ============================== */}
            <div>
                <SectionHeader title="Tổng quan trang web" icon={Eye} color="text-blue-400" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Người dùng" value={fmt(stats.overview.totalUsers)} icon={Users} color="text-blue-400" bgColor="bg-blue-500/10" />
                    <StatCard label="QR Codes" value={fmt(stats.overview.totalQRCodes)} icon={QrCode} color="text-purple-400" bgColor="bg-purple-500/10" />
                    <StatCard label="Gói đang hoạt động" value={fmt(stats.overview.activeSubscriptions)} icon={TrendingUp} color="text-emerald-400" bgColor="bg-emerald-500/10" />
                </div>
            </div>

            {/* ============================== */}
            {/* SECTION 2: REVENUE             */}
            {/* ============================== */}
            <div>
                <SectionHeader title="Tổng quan doanh thu" icon={DollarSign} color="text-yellow-400" />

                {/* Revenue cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Doanh thu tổng"
                        value={fmtVND(stats.revenue.total)}
                        icon={Wallet}
                        color="text-yellow-400"
                        bgColor="bg-yellow-500/10"
                        sub={`${fmt(stats.revenue.totalOrders)} đơn hoàn thành`}
                    />
                    <StatCard
                        label="Hôm nay"
                        value={fmtVND(stats.revenue.today)}
                        icon={CalendarDays}
                        color="text-green-400"
                        bgColor="bg-green-500/10"
                        sub={`${fmt(stats.revenue.todayOrders)} đơn`}
                    />
                    <StatCard
                        label="Tháng này"
                        value={fmtVND(stats.revenue.thisMonth)}
                        icon={ArrowUpRight}
                        color="text-cyan-400"
                        bgColor="bg-cyan-500/10"
                        sub={`${fmt(stats.revenue.thisMonthOrders)} đơn`}
                    />
                    <StatCard
                        label="Năm nay"
                        value={fmtVND(stats.revenue.thisYear)}
                        icon={TrendingUp}
                        color="text-orange-400"
                        bgColor="bg-orange-500/10"
                        sub={`${fmt(stats.revenue.thisYearOrders)} đơn`}
                    />
                </div>

                {/* Order status breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 text-center">
                        <ShoppingCart className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-xl font-bold text-white">{fmt(stats.orders.total)}</p>
                        <p className="text-xs text-gray-500">Tổng đơn</p>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 text-center">
                        <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                        <p className="text-xl font-bold text-amber-400">{fmt(stats.orders.pending)}</p>
                        <p className="text-xs text-gray-500">Chờ TT</p>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 text-center">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mb-1" />
                        <p className="text-xl font-bold text-green-400">{fmt(stats.orders.completed)}</p>
                        <p className="text-xs text-gray-500">Hoàn thành</p>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 text-center">
                        <XCircle className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xl font-bold text-gray-400">{fmt(stats.orders.cancelled)}</p>
                        <p className="text-xs text-gray-500">Đã huỷ</p>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 text-center">
                        <AlertTriangle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                        <p className="text-xl font-bold text-red-400">{fmt(stats.orders.failed)}</p>
                        <p className="text-xs text-gray-500">Thất bại</p>
                    </div>
                </div>

                {/* Revenue Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Revenue Chart */}
                    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-4">Doanh thu theo ngày</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#f3f4f6", borderRadius: "8px" }}
                                        formatter={(value: number) => [fmtVND(value), "Doanh thu"]}
                                        labelFormatter={(label) => `Ngày ${label}`}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Revenue Chart */}
                    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-4">Doanh thu theo tháng (12 tháng)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#f3f4f6", borderRadius: "8px" }}
                                        formatter={(value: number, name: string) => {
                                            if (name === "revenue") return [fmtVND(value), "Doanh thu"];
                                            return [value, "Đơn hàng"];
                                        }}
                                        labelFormatter={(label) => `Tháng ${label}`}
                                    />
                                    <Bar dataKey="revenue" fill="#eab308" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================== */}
            {/* SECTION 3: QR & SCANS          */}
            {/* ============================== */}
            <div>
                <SectionHeader title="Lượt quét QR" icon={BarChart3} color="text-cyan-400" />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Tổng lượt quét" value={fmt(stats.scans.total)} icon={MousePointerClick} color="text-cyan-400" bgColor="bg-cyan-500/10" />
                    <StatCard label="Hôm nay" value={fmt(stats.scans.today)} icon={CalendarDays} color="text-green-400" bgColor="bg-green-500/10" />
                    <StatCard label="Tháng này" value={fmt(stats.scans.thisMonth)} icon={ArrowUpRight} color="text-blue-400" bgColor="bg-blue-500/10" />
                    <StatCard label="Tổng QR Codes" value={fmt(stats.scans.totalQRCodes)} icon={QrCode} color="text-purple-400" bgColor="bg-purple-500/10" />
                </div>

                {/* Scans Chart */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-4">Lượt quét theo ngày</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#f3f4f6", borderRadius: "8px" }}
                                    formatter={(value: number) => [value, "Lượt quét"]}
                                    labelFormatter={(label) => `Ngày ${label}`}
                                />
                                <Area type="monotone" dataKey="scans" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ============================== */}
            {/* SECTION 4: AFFILIATE           */}
            {/* ============================== */}
            <div>
                <SectionHeader title="Affiliate" icon={BadgePercent} color="text-orange-400" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        label="Tổng Affiliates"
                        value={fmt(stats.affiliate.totalAffiliates)}
                        icon={Users}
                        color="text-orange-400"
                        bgColor="bg-orange-500/10"
                        sub={`${fmt(stats.affiliate.activeAffiliates)} đang hoạt động`}
                    />
                    <StatCard
                        label="Referrals"
                        value={fmt(stats.affiliate.totalReferrals)}
                        icon={ArrowUpRight}
                        color="text-green-400"
                        bgColor="bg-green-500/10"
                        sub={`${fmt(stats.affiliate.totalClicks)} lượt click`}
                    />
                    <StatCard
                        label="Hoa hồng"
                        value={fmtVND(stats.affiliate.totalCommission)}
                        icon={DollarSign}
                        color="text-yellow-400"
                        bgColor="bg-yellow-500/10"
                        sub={`${fmt(stats.affiliate.pendingPayouts)} chờ thanh toán`}
                    />
                </div>
            </div>
        </div>
    );
}

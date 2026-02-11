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
} from "lucide-react";
import { api } from "@/lib/api";

interface Stats {
    totalUsers: number;
    totalQRCodes: number;
    totalScans: number;
    totalOrders: number;
    totalRevenue: number;
    activeSubscriptions: number;
    totalAffiliates: number;
    pendingPayouts: number;
    monthly: {
        newUsers: number;
        newOrders: number;
        revenue: number;
    };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get("/admin/stats");
            setStats(res.data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                            <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                            <div className="h-8 bg-gray-800 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        { label: "Tổng người dùng", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10" },
        { label: "Tổng QR Codes", value: stats?.totalQRCodes || 0, icon: QrCode, color: "text-purple-400", bgColor: "bg-purple-500/10" },
        { label: "Tổng lượt quét", value: stats?.totalScans || 0, icon: BarChart3, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
        { label: "Tổng đơn hàng", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-green-400", bgColor: "bg-green-500/10" },
        { label: "Doanh thu", value: `${(stats?.totalRevenue || 0).toLocaleString("vi-VN")}đ`, icon: DollarSign, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
        { label: "Gói đang hoạt động", value: stats?.activeSubscriptions || 0, icon: TrendingUp, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        { label: "Affiliates", value: stats?.totalAffiliates || 0, icon: BadgePercent, color: "text-orange-400", bgColor: "bg-orange-500/10" },
        { label: "Chờ thanh toán", value: stats?.pendingPayouts || 0, icon: Clock, color: "text-red-400", bgColor: "bg-red-500/10" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Tổng quan hệ thống</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-400">{card.label}</span>
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Monthly Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">30 ngày gần nhất</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Người dùng mới</p>
                        <p className="text-3xl font-bold text-blue-400">{stats?.monthly.newUsers || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Đơn hàng mới</p>
                        <p className="text-3xl font-bold text-green-400">{stats?.monthly.newOrders || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Doanh thu</p>
                        <p className="text-3xl font-bold text-yellow-400">
                            {(stats?.monthly.revenue || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

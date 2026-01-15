"use client";

import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Globe,
    Smartphone,
    Monitor,
    Calendar,
    Download,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsCharts } from "./components/analytics-charts";
import { TopQRCodes } from "./components/top-qr-codes";
import { LocationMap } from "./components/location-map";

// Mock data - replace with real API calls
const mockStats = {
    totalScans: 12458,
    scansChange: 12.5,
    uniqueVisitors: 8234,
    visitorsChange: -3.2,
    avgScansPerDay: 415,
    topCountry: "Việt Nam",
    topDevice: "Mobile",
    mobilePercent: 68,
};

const periods = [
    { id: "7d", name: "7 ngày" },
    { id: "30d", name: "30 ngày" },
    { id: "90d", name: "90 ngày" },
    { id: "1y", name: "1 năm" },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState("30d");
    const [isLoading, setIsLoading] = useState(false);

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">
                        Theo dõi lượt quét và hiệu suất QR codes của bạn
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <div className="flex rounded-lg border p-1">
                        {periods.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-3 py-1.5 text-sm rounded ${period === p.id
                                        ? "bg-shiba-500 text-white"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="icon" onClick={handleRefresh}>
                        <RefreshCw
                            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Xuất CSV</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng lượt quét"
                    value={mockStats.totalScans.toLocaleString()}
                    change={mockStats.scansChange}
                    icon={<BarChart3 className="h-5 w-5" />}
                    period={period}
                />
                <StatCard
                    title="Khách truy cập"
                    value={mockStats.uniqueVisitors.toLocaleString()}
                    change={mockStats.visitorsChange}
                    icon={<Globe className="h-5 w-5" />}
                    period={period}
                />
                <StatCard
                    title="Trung bình/ngày"
                    value={mockStats.avgScansPerDay.toLocaleString()}
                    subtitle="lượt quét"
                    icon={<Calendar className="h-5 w-5" />}
                />
                <StatCard
                    title="Thiết bị"
                    value={`${mockStats.mobilePercent}%`}
                    subtitle="Mobile"
                    icon={<Smartphone className="h-5 w-5" />}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <AnalyticsCharts period={period} />
                </div>
                <div>
                    <TopQRCodes />
                </div>
            </div>

            {/* Bottom section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <LocationMap />
                <DeviceBreakdown />
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    change,
    subtitle,
    icon,
    period,
}: {
    title: string;
    value: string;
    change?: number;
    subtitle?: string;
    icon: React.ReactNode;
    period?: string;
}) {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className="text-shiba-500">{icon}</div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                    {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
                    <span
                        className={`text-sm ${isPositive
                                ? "text-green-500"
                                : isNegative
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                            }`}
                    >
                        {isPositive ? "+" : ""}
                        {change}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                        so với kỳ trước
                    </span>
                </div>
            )}
            {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
        </div>
    );
}

function DeviceBreakdown() {
    const devices = [
        { name: "Mobile", value: 68, color: "bg-shiba-500" },
        { name: "Desktop", value: 25, color: "bg-blue-500" },
        { name: "Tablet", value: 7, color: "bg-green-500" },
    ];

    return (
        <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-shiba-500" />
                Thiết bị
            </h3>
            <div className="space-y-4">
                {devices.map((device) => (
                    <div key={device.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span>{device.name}</span>
                            <span className="font-medium">{device.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full ${device.color} rounded-full transition-all`}
                                style={{ width: `${device.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

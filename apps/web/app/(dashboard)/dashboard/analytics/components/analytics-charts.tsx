"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnalyticsChartsProps {
    period: string;
}

interface ChartData {
    date: string;
    scans: number;
    visitors: number;
}

export function AnalyticsCharts({ period }: AnalyticsChartsProps) {
    const [data, setData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "https://redirect-service-production-0d4b.up.railway.app";
                const token = localStorage.getItem("auth-storage");
                const parsedToken = token ? JSON.parse(token)?.state?.accessToken : null;
                
                const response = await fetch(`${redirectUrl}/analytics/scans-over-time?period=${period}`, {
                    headers: {
                        Authorization: `Bearer ${parsedToken}`,
                    },
                });
                
                if (response.ok) {
                    const result = await response.json();
                    setData(result.data || []);
                } else {
                    // Fallback to empty data
                    setData([]);
                }
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [period]);

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Lượt quét theo thời gian</h3>
                </div>
                <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    // If no data, show empty state
    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Lượt quét theo thời gian</h3>
                </div>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Chưa có dữ liệu để hiển thị
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Lượt quét theo thời gian</h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-shiba-500" />
                        <span className="text-muted-foreground">Lượt quét</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">Khách truy cập</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff7c10" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ff7c10" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            interval={period === "7d" ? 0 : period === "30d" ? 4 : 10}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                            formatter={(value: number) => [value.toLocaleString(), ""]}
                        />
                        <Area
                            type="monotone"
                            dataKey="scans"
                            stroke="#ff7c10"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorScans)"
                            name="Lượt quét"
                        />
                        <Area
                            type="monotone"
                            dataKey="visitors"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorVisitors)"
                            name="Khách truy cập"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

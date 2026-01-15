"use client";

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

// Mock data for charts
const generateChartData = (period: string) => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
            scans: Math.floor(Math.random() * 500) + 100,
            visitors: Math.floor(Math.random() * 300) + 50,
        });
    }

    return data;
};

interface AnalyticsChartsProps {
    period: string;
}

export function AnalyticsCharts({ period }: AnalyticsChartsProps) {
    const data = generateChartData(period);

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

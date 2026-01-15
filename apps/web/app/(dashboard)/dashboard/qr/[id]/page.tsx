"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    ExternalLink,
    Download,
    Copy,
    Pencil,
    Trash2,
    BarChart3,
    Calendar,
    Globe,
    Smartphone,
    Check,
    QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Mock data
const mockQR = {
    id: "1",
    name: "Menu Quán Cafe",
    shortCode: "abc123xy",
    type: "URL",
    destinationUrl: "https://example.com/menu",
    isDynamic: true,
    createdAt: "2024-01-15T10:30:00Z",
    scanCount: 1234,
    styling: {
        foregroundColor: "#000000",
        backgroundColor: "#FFFFFF",
    },
};

const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
    }),
    scans: Math.floor(Math.random() * 100) + 20,
}));

const mockStats = {
    topCountries: [
        { name: "Việt Nam", scans: 980 },
        { name: "Hoa Kỳ", scans: 120 },
        { name: "Singapore", scans: 80 },
    ],
    topDevices: [
        { name: "Mobile", percent: 72 },
        { name: "Desktop", percent: 23 },
        { name: "Tablet", percent: 5 },
    ],
};

export default function QRDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const qrUrl = `https://qr.shiba.vn/${mockQR.shortCode}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        toast({ title: "Đã sao chép link!" });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (confirm("Bạn có chắc chắn muốn xóa QR code này?")) {
            toast({ title: "Đã xóa QR code" });
            router.push("/dashboard/qr");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-muted mt-1"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold">{mockQR.name}</h1>
                        {mockQR.isDynamic && (
                            <span className="px-2 py-0.5 rounded-full bg-shiba-100 text-shiba-700 text-xs font-medium">
                                Dynamic
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        Tạo ngày {new Date(mockQR.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: QR Preview & Actions */}
                <div className="space-y-6">
                    {/* QR Preview */}
                    <div className="rounded-xl border bg-card p-6 text-center">
                        <div
                            className="inline-flex p-4 rounded-xl mb-4"
                            style={{ backgroundColor: mockQR.styling.backgroundColor }}
                        >
                            <QrCode
                                className="h-32 w-32"
                                style={{ color: mockQR.styling.foregroundColor }}
                            />
                        </div>

                        <div className="flex gap-2 justify-center">
                            <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                                <Download className="h-4 w-4" />
                                Tải xuống
                            </Button>
                        </div>
                    </div>

                    {/* Short URL */}
                    <div className="rounded-xl border bg-card p-4">
                        <label className="text-sm font-medium mb-2 block">
                            Link rút gọn
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={qrUrl}
                                readOnly
                                className="flex-1 rounded-lg border bg-muted px-3 py-2 text-sm"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(mockQR.destinationUrl, "_blank")}
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="rounded-xl border bg-card p-4 space-y-3">
                        <h3 className="font-medium">Chi tiết</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Loại</span>
                                <span>{mockQR.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Đích đến</span>
                                <a
                                    href={mockQR.destinationUrl}
                                    target="_blank"
                                    className="text-shiba-500 hover:underline truncate max-w-[200px]"
                                >
                                    {mockQR.destinationUrl}
                                </a>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Short code</span>
                                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                    {mockQR.shortCode}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Analytics */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <StatCard
                            title="Tổng lượt quét"
                            value={mockQR.scanCount.toLocaleString()}
                            icon={<BarChart3 className="h-5 w-5" />}
                        />
                        <StatCard
                            title="Hôm nay"
                            value="42"
                            icon={<Calendar className="h-5 w-5" />}
                        />
                        <StatCard
                            title="Top Quốc gia"
                            value="Việt Nam"
                            icon={<Globe className="h-5 w-5" />}
                        />
                    </div>

                    {/* Chart */}
                    <div className="rounded-xl border bg-card p-6">
                        <h3 className="font-semibold mb-4">Lượt quét 30 ngày qua</h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockChartData}>
                                    <defs>
                                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff7c10" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ff7c10" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="scans"
                                        stroke="#ff7c10"
                                        strokeWidth={2}
                                        fill="url(#colorScans)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border bg-card p-4">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-shiba-500" />
                                Top Quốc gia
                            </h3>
                            <div className="space-y-2">
                                {mockStats.topCountries.map((c) => (
                                    <div key={c.name} className="flex items-center justify-between text-sm">
                                        <span>{c.name}</span>
                                        <span className="text-muted-foreground">{c.scans}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-4">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-shiba-500" />
                                Thiết bị
                            </h3>
                            <div className="space-y-2">
                                {mockStats.topDevices.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between text-sm">
                                        <span>{d.name}</span>
                                        <span className="text-muted-foreground">{d.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className="text-shiba-500">{icon}</div>
            </div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}

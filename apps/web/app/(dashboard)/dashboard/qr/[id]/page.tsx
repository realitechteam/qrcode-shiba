"use client";

import { useState, useEffect } from "react";
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
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { qrApi } from "@/lib/qr-api";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface QRData {
    id: string;
    name: string;
    shortCode: string;
    type: string;
    destinationUrl: string | null;
    isDynamic: boolean;
    createdAt: string;
    scanCount: number;
    preview?: string;
    imageUrl?: string;
    styling: {
        foregroundColor: string;
        backgroundColor: string;
    };
    content?: {
        data: Record<string, any>;
    };
    redirectUrl?: string;
}

interface StatsData {
    total: number;
    period: string;
    byDate: Array<{ date: string; count: number }>;
    byCountry: Array<{ name: string; count: number }>;
    byDevice: Array<{ name: string; count: number }>;
    byOs?: Array<{ name: string; count: number }>;
}

export default function QRDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [qr, setQr] = useState<QRData | null>(null);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch QR data and stats
    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                const [qrRes, statsRes] = await Promise.all([
                    qrApi.get(`/qr/${params.id}`),
                    qrApi.get(`/qr/${params.id}/stats`, { params: { period: "30d" } })
                ]);
                
                setQr(qrRes.data);
                setStats(statsRes.data);
            } catch (err: any) {
                console.error("Failed to fetch QR data:", err);
                setError(err.response?.status === 404 
                    ? "QR code không tồn tại" 
                    : "Không thể tải dữ liệu"
                );
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [params.id]);

    // Transform stats for chart
    const chartData = stats?.byDate?.map((d) => ({
        date: new Date(d.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        }),
        scans: d.count,
    })) || [];

    // Calculate today's scans
    const today = new Date().toISOString().split("T")[0];
    const todayScans = stats?.byDate?.find(d => d.date === today)?.count || 0;

    // Get top country
    const topCountry = stats?.byCountry?.[0]?.name || "N/A";

    // Calculate device percentages
    const totalDeviceScans = stats?.byDevice?.reduce((sum, d) => sum + d.count, 0) || 1;
    const deviceStats = stats?.byDevice?.map(d => ({
        name: d.name,
        percent: Math.round((d.count / totalDeviceScans) * 100)
    })) || [];

    const redirectBaseUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "https://go.shiba.pw";
    const qrUrl = qr?.isDynamic 
        ? `${redirectBaseUrl}/${qr.shortCode}`
        : qr?.destinationUrl || "";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        toast({ title: "Đã sao chép link!" });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async (format: "png" | "svg" = "png") => {
        if (!qr) return;
        
        try {
            const response = await qrApi.get(`/qr/${qr.id}/download`, {
                params: { format, size: 1024 },
                responseType: "blob",
            });

            const url = URL.createObjectURL(response.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${qr.shortCode}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
            
            toast({ title: "Đã tải xuống!" });
        } catch (err) {
            toast({ title: "Lỗi tải xuống", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!qr) return;
        if (!confirm("Bạn có chắc chắn muốn xóa QR code này?")) return;
        
        setIsDeleting(true);
        try {
            await qrApi.delete(`/qr/${qr.id}`);
            toast({ title: "Đã xóa QR code" });
            router.push("/dashboard/qr");
        } catch (err) {
            toast({ title: "Lỗi xóa QR code", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-shiba-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !qr) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-lg font-medium mb-2">{error || "Không tìm thấy QR code"}</p>
                    <Button variant="outline" onClick={() => router.push("/dashboard/qr")}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold">{qr.name}</h1>
                        {qr.isDynamic && (
                            <span className="px-2 py-0.5 rounded-full bg-shiba-100 text-shiba-700 text-xs font-medium dark:bg-shiba-900/30 dark:text-shiba-400">
                                Dynamic
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        Tạo ngày {new Date(qr.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => router.push(`/dashboard/qr/${qr.id}/edit`)}
                    >
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
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
                            style={{ backgroundColor: qr.styling?.backgroundColor || "#FFFFFF" }}
                        >
                            {qr.preview || qr.imageUrl ? (
                                <img
                                    src={qr.preview || qr.imageUrl}
                                    alt={qr.name}
                                    className="h-32 w-32"
                                />
                            ) : (
                                <div className="h-32 w-32 flex items-center justify-center bg-muted rounded">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 justify-center">
                            <Button 
                                className="bg-shiba-500 hover:bg-shiba-600 gap-2"
                                onClick={() => handleDownload("png")}
                            >
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
                                onClick={() => window.open(qrUrl, "_blank")}
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
                                <span>{qr.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Đích đến</span>
                                <a
                                    href={qr.destinationUrl || "#"}
                                    target="_blank"
                                    className="text-shiba-500 hover:underline truncate max-w-[200px]"
                                >
                                    {qr.destinationUrl || "N/A"}
                                </a>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Short code</span>
                                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                                    {qr.shortCode}
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
                            value={(stats?.total || qr.scanCount || 0).toLocaleString()}
                            icon={<BarChart3 className="h-5 w-5" />}
                        />
                        <StatCard
                            title="Hôm nay"
                            value={todayScans.toLocaleString()}
                            icon={<Calendar className="h-5 w-5" />}
                        />
                        <StatCard
                            title="Top Quốc gia"
                            value={topCountry}
                            icon={<Globe className="h-5 w-5" />}
                        />
                    </div>

                    {/* Chart */}
                    <div className="rounded-xl border bg-card p-6">
                        <h3 className="font-semibold mb-4">Lượt quét 30 ngày qua</h3>
                        <div className="h-[250px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
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
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Chưa có dữ liệu quét
                                </div>
                            )}
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
                                {stats?.byCountry?.length ? (
                                    stats.byCountry.slice(0, 5).map((c) => (
                                        <div key={c.name} className="flex items-center justify-between text-sm">
                                            <span>{c.name || "Không xác định"}</span>
                                            <span className="text-muted-foreground">{c.count}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
                                )}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-4">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-shiba-500" />
                                Thiết bị
                            </h3>
                            <div className="space-y-2">
                                {deviceStats.length ? (
                                    deviceStats.map((d) => (
                                        <div key={d.name} className="flex items-center justify-between text-sm">
                                            <span>{d.name || "Khác"}</span>
                                            <span className="text-muted-foreground">{d.percent}%</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
                                )}
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

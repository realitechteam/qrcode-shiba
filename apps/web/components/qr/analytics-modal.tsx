"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    X,
    TrendingUp,
    Globe,
    Smartphone,
    Monitor,
    Tablet,
    ExternalLink,
    Download,
    Calendar,
    Lock,
    Crown,
    Sparkles,
    Pencil,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/lib/haptic";
import { useAuthStore } from "@/stores/auth-store";
import qrApi from "@/lib/qr-api";

interface QRCode {
    id: string;
    shortCode: string;
    name: string | null;
    type: string;
    isDynamic: boolean;
    destinationUrl: string | null;
    imageUrl: string | null;
    scanCount: number;
    createdAt: string;
}

interface AnalyticsModalProps {
    qr: QRCode;
    onClose: () => void;
    onDownload: () => void;
    onOpenLink: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

interface ApiStats {
    total: number;
    period: string;
    byDate: Record<string, number>;
    byCountry: Record<string, number>;
    byDevice: Record<string, number>;
    byOs: Record<string, number>;
}

interface ScanStats {
    total: number;
    today: number;
    thisWeek: number;
    byDevice: { name: string; count: number; percent: number }[];
    byCountry: { name: string; count: number }[];
    weeklyData: { day: string; count: number }[];
}

export function AnalyticsModal({ 
    qr, 
    onClose, 
    onDownload, 
    onOpenLink, 
    onEdit, 
    onDelete 
}: AnalyticsModalProps) {
    const [stats, setStats] = useState<ScanStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isPaidUser } = useAuthStore();
    
    // Check if user can view detailed analytics
    // Dynamic QR = always visible, Static QR = only for Pro users
    const canViewAnalytics = qr.isDynamic || isPaidUser();

    useEffect(() => {
        triggerHaptic("light");
        fetchStats();
    }, [qr.id]);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const response = await qrApi.get<ApiStats>(`/qr/${qr.id}/stats`, {
                params: { period: "7d" }
            });
            
            const data = response.data;
            
            // Transform API response to display format
            const transformedStats = transformApiStats(data, qr.scanCount);
            setStats(transformedStats);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
            // Show basic stats from QR object itself
            setStats({
                total: qr.scanCount || 0,
                today: 0,
                thisWeek: qr.scanCount || 0,
                byDevice: [],
                byCountry: [],
                weeklyData: generateEmptyWeeklyData(),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        triggerHaptic("light");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-hidden animate-slide-up pb-safe">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-lg border-b px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {qr.imageUrl ? (
                                <img
                                    src={qr.imageUrl}
                                    alt={qr.name || "QR Code"}
                                    className="h-12 w-12 rounded-xl object-contain bg-muted p-1"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold truncate max-w-[180px]">
                                    {qr.name || "Untitled"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">Analytics</p>
                                    {!qr.isDynamic && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                            Static
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-auto max-h-[calc(90vh-80px)] p-4 space-y-4">
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : stats ? (
                        <>
                            {/* Quick Stats - Always Visible */}
                            <div className="grid grid-cols-3 gap-3">
                                <StatCard
                                    label="Tổng quét"
                                    value={stats.total}
                                    icon={<TrendingUp className="h-4 w-4" />}
                                    color="shiba"
                                />
                                <StatCard
                                    label="Hôm nay"
                                    value={stats.today}
                                    icon={<Calendar className="h-4 w-4" />}
                                    color="blue"
                                />
                                <StatCard
                                    label="7 ngày"
                                    value={stats.thisWeek}
                                    icon={<TrendingUp className="h-4 w-4" />}
                                    color="green"
                                />
                            </div>

                            {/* Detailed Analytics - Blurred for Static QR without Pro */}
                            {canViewAnalytics ? (
                                <>
                                    {/* Weekly Chart */}
                                    <div className="rounded-xl border bg-card p-4">
                                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-shiba-500" />
                                            Lượt quét 7 ngày qua
                                        </h4>
                                        <MiniBarChart data={stats.weeklyData} />
                                    </div>

                                    {/* Device Breakdown */}
                                    {stats.byDevice.length > 0 && (
                                        <div className="rounded-xl border bg-card p-4">
                                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-shiba-500" />
                                                Thiết bị
                                            </h4>
                                            <div className="space-y-3">
                                                {stats.byDevice.map((device, index) => (
                                                    <DeviceBar
                                                        key={device.name}
                                                        name={device.name}
                                                        count={device.count}
                                                        percent={device.percent}
                                                        delay={index * 100}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {stats.byCountry.length > 0 && (
                                        <div className="rounded-xl border bg-card p-4">
                                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-shiba-500" />
                                                Vị trí
                                            </h4>
                                            <div className="space-y-2">
                                                {stats.byCountry.map((country) => (
                                                    <div
                                                        key={country.name}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <span>{country.name || "Không xác định"}</span>
                                                        <span className="font-medium">{country.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Pro Paywall for Static QR */
                                <ProPaywall qrName={qr.name || "QR Code"} />
                            )}

                            {/* Actions */}
                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="h-12 rounded-xl gap-2"
                                    onClick={() => {
                                        triggerHaptic("light");
                                        onOpenLink();
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Mở link
                                </Button>
                                <Button
                                    className="h-12 rounded-xl bg-shiba-500 hover:bg-shiba-600 gap-2"
                                    onClick={() => {
                                        triggerHaptic("medium");
                                        onDownload();
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                    Tải xuống
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="h-12 rounded-xl gap-2"
                                    onClick={() => {
                                        triggerHaptic("light");
                                        if (onEdit) onEdit();
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="h-12 rounded-xl gap-2 text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        triggerHaptic("warning");
                                        if (onDelete) onDelete();
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Xóa QR
                                </Button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function ProPaywall({ qrName }: { qrName: string }) {
    return (
        <div className="relative rounded-xl border overflow-hidden">
            {/* Blurred preview content */}
            <div className="p-4 space-y-4 blur-sm opacity-50 pointer-events-none select-none">
                <div className="rounded-xl border bg-card p-4 h-32" />
                <div className="rounded-xl border bg-card p-4">
                    <div className="space-y-3">
                        <div className="h-6 bg-muted rounded" />
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-6 bg-muted rounded w-1/2" />
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-card via-card/95 to-card/80 p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30 animate-pulse-soft">
                    <Crown className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-lg font-bold mb-2">
                    Nâng cấp lên Pro
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Xem chi tiết analytics cho Static QR với gói Pro. 
                    Bao gồm biểu đồ, thiết bị, vị trí và nhiều hơn nữa.
                </p>

                <div className="flex flex-col gap-2 w-full max-w-xs">
                    <Link href="/dashboard/billing">
                        <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2 shadow-lg shadow-orange-500/25">
                            <Sparkles className="h-4 w-4" />
                            Nâng cấp Pro
                        </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        Hoặc tạo <strong>Dynamic QR</strong> để xem analytics miễn phí
                    </p>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Static QR vẫn đếm lượt quét</span>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: "shiba" | "blue" | "green";
}) {
    const colorClasses = {
        shiba: "from-shiba-500/10 to-shiba-600/10 border-shiba-500/20 text-shiba-600 dark:text-shiba-400",
        blue: "from-blue-500/10 to-blue-600/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
        green: "from-green-500/10 to-green-600/10 border-green-500/20 text-green-600 dark:text-green-400",
    };

    return (
        <div className={`rounded-xl bg-gradient-to-br border p-3 ${colorClasses[color]}`}>
            <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-[10px] font-medium">{label}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
    );
}

function MiniBarChart({ data }: { data: { day: string; count: number }[] }) {
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="flex items-end justify-between gap-1 h-24">
            {data.map((item, index) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full bg-shiba-500 rounded-t-sm transition-all duration-500 ease-out"
                        style={{
                            height: `${(item.count / maxCount) * 100}%`,
                            minHeight: item.count > 0 ? "4px" : "2px",
                            animationDelay: `${index * 50}ms`,
                        }}
                    />
                    <span className="text-[10px] text-muted-foreground">{item.day}</span>
                </div>
            ))}
        </div>
    );
}

function DeviceBar({
    name,
    count,
    percent,
    delay,
}: {
    name: string;
    count: number;
    percent: number;
    delay: number;
}) {
    const deviceName = name?.toLowerCase() || "";
    const Icon = deviceName.includes("mobile") ? Smartphone : 
                 deviceName.includes("tablet") ? Tablet : Monitor;
    const color = deviceName.includes("mobile") ? "bg-shiba-500" : 
                  deviceName.includes("tablet") ? "bg-green-500" : "bg-blue-500";
    const displayName = deviceName.includes("mobile") ? "Mobile" :
                        deviceName.includes("tablet") ? "Tablet" : 
                        deviceName.includes("desktop") ? "Desktop" : (name || "Khác");

    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{displayName}</span>
                </div>
                <span className="font-medium">{percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
                    style={{
                        width: `${percent}%`,
                        transitionDelay: `${delay}ms`,
                    }}
                />
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border p-3 h-20 animate-shimmer" />
                ))}
            </div>
            <div className="rounded-xl border p-4 h-40 animate-shimmer" />
            <div className="rounded-xl border p-4 h-32 animate-shimmer" />
        </div>
    );
}

/**
 * Transform API response to display format
 */
function transformApiStats(data: ApiStats, totalScanCount: number): ScanStats {
    // Calculate today's date key
    const today = new Date().toISOString().split('T')[0];
    const todayScans = data.byDate?.[today] || 0;

    // Transform byDevice to array with percentages
    // Handle both object format {mobile: 10} and array format [{name: "mobile", count: 10}]
    let byDevice: { name: string; count: number; percent: number }[] = [];
    
    if (data.byDevice) {
        if (Array.isArray(data.byDevice)) {
            // Already an array
            const deviceTotal = (data.byDevice as any[]).reduce((sum, d) => sum + (d.count || 0), 0) || 1;
            byDevice = (data.byDevice as any[])
                .map((d: any) => ({
                    name: String(d.name || 'Unknown'),
                    count: Number(d.count || 0),
                    percent: Math.round(((d.count || 0) / deviceTotal) * 100),
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);
        } else {
            // Object format {mobile: 10}
            const deviceTotal = Object.values(data.byDevice).reduce((a, b) => a + b, 0) || 1;
            byDevice = Object.entries(data.byDevice)
                .map(([name, count]) => ({
                    name: String(name),
                    count: Number(count),
                    percent: Math.round((count / deviceTotal) * 100),
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);
        }
    }

    // Transform byCountry to array
    // Handle both object format {VN: 10} and array format [{name: "VN", count: 10}]
    let byCountry: { name: string; count: number }[] = [];
    
    if (data.byCountry) {
        if (Array.isArray(data.byCountry)) {
            // Already an array
            byCountry = (data.byCountry as any[])
                .map((c: any) => ({ 
                    name: String(c.name || 'Unknown'), 
                    count: Number(c.count || 0) 
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
        } else {
            // Object format {VN: 10}
            byCountry = Object.entries(data.byCountry)
                .map(([name, count]) => ({ name: String(name), count: Number(count) }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
        }
    }

    // Transform byDate to weekly data
    const weeklyData = generateWeeklyDataFromApi(data.byDate || {});

    return {
        total: totalScanCount || data.total || 0,
        today: todayScans,
        thisWeek: data.total || 0,
        byDevice,
        byCountry,
        weeklyData,
    };
}

function generateWeeklyDataFromApi(byDate: Record<string, number>): { day: string; count: number }[] {
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const result: { day: string; count: number }[] = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        
        result.push({
            day: dayName,
            count: byDate[dateKey] || 0,
        });
    }
    
    return result;
}

function generateEmptyWeeklyData(): { day: string; count: number }[] {
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const result: { day: string; count: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        result.push({ day: dayName, count: 0 });
    }
    
    return result;
}

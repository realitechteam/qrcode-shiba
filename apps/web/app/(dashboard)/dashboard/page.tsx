import Link from "next/link";
import { QrCode, BarChart3, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Tổng quan về QR codes và hoạt động của bạn
                    </p>
                </div>
                <Link href="/dashboard/qr/new">
                    <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo QR Code
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng QR Codes"
                    value="0"
                    description="QR codes đã tạo"
                    icon={<QrCode className="h-5 w-5" />}
                />
                <StatCard
                    title="Dynamic QR"
                    value="0 / 3"
                    description="Dynamic QR đã dùng"
                    icon={<QrCode className="h-5 w-5" />}
                />
                <StatCard
                    title="Lượt quét tháng này"
                    value="0"
                    description="0 / 500 giới hạn free"
                    icon={<BarChart3 className="h-5 w-5" />}
                />
                <StatCard
                    title="Lượt quét hôm nay"
                    value="0"
                    description="Tăng 0% so với hôm qua"
                    icon={<BarChart3 className="h-5 w-5" />}
                />
            </div>

            {/* Quick actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <QuickActionCard
                    title="Tạo QR Code URL"
                    description="Tạo nhanh QR code cho đường link"
                    href="/dashboard/qr/new?type=url"
                    icon={<QrCode className="h-6 w-6" />}
                />
                <QuickActionCard
                    title="Tạo vCard"
                    description="Tạo QR code cho danh thiếp điện tử"
                    href="/dashboard/qr/new?type=vcard"
                    icon={<QrCode className="h-6 w-6" />}
                />
                <QuickActionCard
                    title="Tạo WiFi QR"
                    description="Chia sẻ WiFi qua QR code"
                    href="/dashboard/qr/new?type=wifi"
                    icon={<QrCode className="h-6 w-6" />}
                />
            </div>

            {/* Recent QR codes */}
            <div className="rounded-xl border bg-card">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">QR Codes gần đây</h2>
                        <Link
                            href="/dashboard/qr"
                            className="text-sm text-shiba-500 hover:text-shiba-600 flex items-center gap-1"
                        >
                            Xem tất cả
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
                <div className="p-12 text-center text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="mb-4">Bạn chưa tạo QR code nào</p>
                    <Link href="/dashboard/qr/new">
                        <Button className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo QR Code đầu tiên
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className="text-shiba-500">{icon}</div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
    );
}

function QuickActionCard({
    title,
    description,
    href,
    icon,
}: {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="rounded-xl border bg-card p-6 hover:shadow-lg hover:border-shiba-500/50 transition-all group"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-shiba-100 text-shiba-600 dark:bg-shiba-900/30 dark:text-shiba-400 group-hover:bg-shiba-500 group-hover:text-white transition-colors">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </Link>
    );
}

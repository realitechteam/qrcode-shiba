"use client";

import Link from "next/link";
import { QrCode, ArrowUpRight } from "lucide-react";

// Mock data
const topQRCodes = [
    { id: "1", name: "Menu Quán Cafe", scans: 1234, type: "URL" },
    { id: "2", name: "WiFi Guest", scans: 987, type: "WIFI" },
    { id: "3", name: "Danh thiếp CEO", scans: 756, type: "VCARD" },
    { id: "4", name: "Khuyến mãi Tết", scans: 543, type: "URL" },
    { id: "5", name: "App Download", scans: 432, type: "URL" },
];

export function TopQRCodes() {
    const maxScans = Math.max(...topQRCodes.map((q) => q.scans));

    return (
        <div className="rounded-xl border bg-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Top QR Codes</h3>
                <Link
                    href="/dashboard/qr"
                    className="text-sm text-shiba-500 hover:text-shiba-600 flex items-center gap-1"
                >
                    Xem tất cả
                    <ArrowUpRight className="h-3 w-3" />
                </Link>
            </div>

            {topQRCodes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <QrCode className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Chưa có dữ liệu</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {topQRCodes.map((qr, index) => (
                        <Link
                            key={qr.id}
                            href={`/dashboard/qr/${qr.id}`}
                            className="flex items-center gap-3 group"
                        >
                            <span className="text-sm font-medium text-muted-foreground w-5">
                                {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate group-hover:text-shiba-500 transition-colors">
                                    {qr.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-shiba-500 rounded-full"
                                            style={{ width: `${(qr.scans / maxScans) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-12 text-right">
                                        {qr.scans.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

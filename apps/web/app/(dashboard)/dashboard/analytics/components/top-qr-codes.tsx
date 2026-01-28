"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, ArrowUpRight, Loader2 } from "lucide-react";
import qrApi from "@/lib/qr-api";

interface QRCodeItem {
    id: string;
    name: string | null;
    shortCode: string;
    scanCount: number;
    type: string;
}

export function TopQRCodes() {
    const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTopQRCodes = async () => {
            try {
                setIsLoading(true);
                const response = await qrApi.get("/qr");
                const data = Array.isArray(response.data) ? response.data : response.data.items || [];
                
                // Sort by scanCount and take top 5
                const topQRs = data
                    .sort((a: QRCodeItem, b: QRCodeItem) => (b.scanCount || 0) - (a.scanCount || 0))
                    .slice(0, 5)
                    .map((qr: any) => ({
                        id: qr.id,
                        name: qr.name || qr.shortCode,
                        shortCode: qr.shortCode,
                        scanCount: qr.scanCount || 0,
                        type: qr.type || "URL",
                    }));
                
                setQrCodes(topQRs);
            } catch (error) {
                console.error("Failed to fetch top QR codes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopQRCodes();
    }, []);

    const maxScans = Math.max(...qrCodes.map((q) => q.scanCount), 1);

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Top QR Codes</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

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

            {qrCodes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <QrCode className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Chưa có dữ liệu</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {qrCodes.map((qr, index) => (
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
                                            style={{ width: `${(qr.scanCount / maxScans) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-12 text-right">
                                        {qr.scanCount.toLocaleString()}
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

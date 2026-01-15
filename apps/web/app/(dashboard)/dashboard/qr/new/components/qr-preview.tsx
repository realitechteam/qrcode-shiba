"use client";

import { QrCode, Loader2 } from "lucide-react";

interface QRPreviewProps {
    preview: string | null;
    isLoading: boolean;
    styling: {
        foregroundColor: string;
        backgroundColor: string;
    };
}

export function QRPreview({ preview, isLoading, styling }: QRPreviewProps) {
    return (
        <div className="flex flex-col items-center">
            {/* Preview container */}
            <div
                className="w-full aspect-square max-w-[300px] rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: styling.backgroundColor }}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-sm">Đang tạo preview...</span>
                    </div>
                ) : preview ? (
                    <img
                        src={preview}
                        alt="QR Code Preview"
                        className="w-full h-full object-contain p-4"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <QrCode
                            className="h-24 w-24 opacity-20"
                            style={{ color: styling.foregroundColor }}
                        />
                        <span className="text-sm">Nhập thông tin để xem preview</span>
                    </div>
                )}
            </div>

            {/* Color info */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: styling.foregroundColor }}
                    />
                    <span>QR: {styling.foregroundColor}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: styling.backgroundColor }}
                    />
                    <span>Nền: {styling.backgroundColor}</span>
                </div>
            </div>

            {/* Size info */}
            <p className="mt-4 text-xs text-muted-foreground text-center">
                Preview: 300×300px · Tải xuống: 1024×1024px
            </p>
        </div>
    );
}

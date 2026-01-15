"use client";

import { MapPin } from "lucide-react";

// Mock data for locations
const topLocations = [
    { country: "Việt Nam", code: "VN", scans: 8245, percent: 66 },
    { country: "Hoa Kỳ", code: "US", scans: 1523, percent: 12 },
    { country: "Singapore", code: "SG", scans: 987, percent: 8 },
    { country: "Nhật Bản", code: "JP", scans: 654, percent: 5 },
    { country: "Hàn Quốc", code: "KR", scans: 432, percent: 3 },
    { country: "Khác", code: "OTHER", scans: 617, percent: 6 },
];

export function LocationMap() {
    return (
        <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-shiba-500" />
                Vị trí quét
            </h3>

            {/* Simple list view instead of map */}
            <div className="space-y-3">
                {topLocations.map((location) => (
                    <div key={location.code} className="flex items-center gap-3">
                        <div className="w-8 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                            {location.code === "OTHER" ? "🌍" : getFlagEmoji(location.code)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="truncate">{location.country}</span>
                                <span className="text-muted-foreground">
                                    {location.scans.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-shiba-500 rounded-full"
                                    style={{ width: `${location.percent}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-sm font-medium w-10 text-right">
                            {location.percent}%
                        </span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
                Dựa trên địa chỉ IP của người quét
            </p>
        </div>
    );
}

function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

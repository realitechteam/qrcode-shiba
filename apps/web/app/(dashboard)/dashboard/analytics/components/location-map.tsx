"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface LocationData {
    country: string;
    count: number;
    percentage: number;
}

// Country code to Vietnamese name mapping
const countryNames: Record<string, string> = {
    VN: "Việt Nam",
    US: "Hoa Kỳ",
    SG: "Singapore",
    JP: "Nhật Bản",
    KR: "Hàn Quốc",
    CN: "Trung Quốc",
    TH: "Thái Lan",
    MY: "Malaysia",
    AU: "Úc",
    GB: "Anh",
    DE: "Đức",
    FR: "Pháp",
    CA: "Canada",
    ID: "Indonesia",
    PH: "Philippines",
    IN: "Ấn Độ",
};

interface LocationMapProps {
    period?: string;
}

export function LocationMap({ period = "30d" }: LocationMapProps) {
    const { accessToken } = useAuthStore();
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3002";
            
            const response = await fetch(`${redirectUrl}/analytics/country-breakdown?period=${period}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLocations(Array.isArray(data) ? data : []);
            } else {
                setLocations([]);
            }
        } catch (error) {
            console.error("Failed to fetch country breakdown:", error);
            setLocations([]);
        } finally {
            setIsLoading(false);
        }
    }, [period, accessToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getCountryName = (code: string): string => {
        return countryNames[code] || code;
    };

    return (
        <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-shiba-500" />
                Vị trí quét
            </h3>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : locations.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                    Chưa có dữ liệu vị trí
                </div>
            ) : (
                <div className="space-y-3">
                    {locations.map((location) => (
                        <div key={location.country} className="flex items-center gap-3">
                            <div className="w-8 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                                {location.country === "OTHER" ? "🌍" : getFlagEmoji(location.country)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="truncate">
                                        {location.country === "OTHER" ? "Khác" : getCountryName(location.country)}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {location.count.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-shiba-500 rounded-full"
                                        style={{ width: `${location.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-medium w-10 text-right">
                                {Math.round(location.percentage)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground mt-4 text-center">
                Dựa trên địa chỉ IP của người quét
            </p>
        </div>
    );
}

function getFlagEmoji(countryCode: string): string {
    try {
        const codePoints = countryCode
            .toUpperCase()
            .split("")
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    } catch {
        return "🌍";
    }
}

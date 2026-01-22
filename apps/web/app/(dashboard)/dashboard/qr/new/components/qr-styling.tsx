"use client";

import { cn } from "@/lib/utils";

export interface StylingOptions {
    foregroundColor: string;
    backgroundColor: string;
    dotsStyle: "square" | "rounded" | "dots" | "classy" | "classy-rounded";
    cornersSquareStyle: "square" | "dot" | "extra-rounded";
    cornersDotStyle: "square" | "dot";
}

interface QRStylingProps {
    styling: StylingOptions;
    onChange: (styling: StylingOptions) => void;
}

const colorPresets = [
    { fg: "#000000", bg: "#FFFFFF", name: "Classic" },
    { fg: "#1E40AF", bg: "#DBEAFE", name: "Blue" },
    { fg: "#166534", bg: "#DCFCE7", name: "Green" },
    { fg: "#9333EA", bg: "#F3E8FF", name: "Purple" },
    { fg: "#DC2626", bg: "#FEE2E2", name: "Red" },
    { fg: "#EA580C", bg: "#FFF7ED", name: "Orange" },
];

const dotsStyles = [
    { id: "square", name: "Vuông" },
    { id: "rounded", name: "Bo tròn" },
    { id: "dots", name: "Tròn" },
    { id: "classy", name: "Classic" },
    { id: "classy-rounded", name: "Classic tròn" },
];

const cornerStyles = [
    { id: "square", name: "Vuông" },
    { id: "dot", name: "Tròn" },
    { id: "extra-rounded", name: "Bo góc" },
];

export function QRStyling({ styling, onChange }: QRStylingProps) {
    const updateStyling = (key: keyof StylingOptions, value: any) => {
        onChange({ ...styling, [key]: value });
    };

    return (
        <div className="space-y-6">
            <h2 className="font-semibold text-lg">Tùy chỉnh giao diện</h2>

            {/* Color Presets */}
            <div className="space-y-3">
                <label className="text-sm font-medium">Màu sắc có sẵn</label>
                <div className="flex flex-wrap gap-2">
                    {colorPresets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => {
                                updateStyling("foregroundColor", preset.fg);
                                updateStyling("backgroundColor", preset.bg);
                            }}
                            className={cn(
                                "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
                                styling.foregroundColor === preset.fg &&
                                    styling.backgroundColor === preset.bg
                                    ? "border-shiba-500 ring-2 ring-shiba-500/20"
                                    : "border-transparent hover:border-muted-foreground/30"
                            )}
                            style={{ backgroundColor: preset.bg }}
                            title={preset.name}
                        >
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{ backgroundColor: preset.fg }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Màu QR</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={styling.foregroundColor}
                            onChange={(e) => updateStyling("foregroundColor", e.target.value)}
                            className="w-10 h-10 rounded-lg border cursor-pointer"
                        />
                        <input
                            type="text"
                            value={styling.foregroundColor}
                            onChange={(e) => updateStyling("foregroundColor", e.target.value)}
                            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm uppercase"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Màu nền</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={styling.backgroundColor}
                            onChange={(e) => updateStyling("backgroundColor", e.target.value)}
                            className="w-10 h-10 rounded-lg border cursor-pointer"
                        />
                        <input
                            type="text"
                            value={styling.backgroundColor}
                            onChange={(e) => updateStyling("backgroundColor", e.target.value)}
                            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* Dots Style */}
            <div className="space-y-3">
                <label className="text-sm font-medium">Kiểu điểm</label>
                <div className="flex flex-wrap gap-2">
                    {dotsStyles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => updateStyling("dotsStyle", style.id as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg border text-sm transition-all",
                                styling.dotsStyle === style.id
                                    ? "border-shiba-500 bg-shiba-50 text-shiba-700 dark:bg-shiba-900/20"
                                    : "hover:border-muted-foreground/50"
                            )}
                        >
                            {style.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Corner Style */}
            <div className="space-y-3">
                <label className="text-sm font-medium">Kiểu góc</label>
                <div className="flex flex-wrap gap-2">
                    {cornerStyles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => updateStyling("cornersSquareStyle", style.id as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg border text-sm transition-all",
                                styling.cornersSquareStyle === style.id
                                    ? "border-shiba-500 bg-shiba-50 text-shiba-700 dark:bg-shiba-900/20"
                                    : "hover:border-muted-foreground/50"
                            )}
                        >
                            {style.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">💡 Mẹo</p>
                <p>
                    Đảm bảo độ tương phản giữa màu QR và màu nền đủ cao để máy quét có thể đọc được.
                </p>
            </div>
        </div>
    );
}

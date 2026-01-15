"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRType {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
}

interface QRTypeSelectorProps {
    types: QRType[];
    selected: string;
    onSelect: (type: string) => void;
}

export function QRTypeSelector({
    types,
    selected,
    onSelect,
}: QRTypeSelectorProps) {
    return (
        <div className="space-y-4">
            <h2 className="font-semibold text-lg">Chọn loại QR Code</h2>
            <div className="grid grid-cols-2 gap-3">
                {types.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selected === type.id;

                    return (
                        <button
                            key={type.id}
                            onClick={() => onSelect(type.id)}
                            className={cn(
                                "p-4 rounded-xl border text-left transition-all",
                                isSelected
                                    ? "border-shiba-500 bg-shiba-50 dark:bg-shiba-900/20"
                                    : "hover:border-shiba-500/50 hover:bg-muted/50"
                            )}
                        >
                            <div
                                className={cn(
                                    "inline-flex p-2 rounded-lg mb-2",
                                    isSelected
                                        ? "bg-shiba-500 text-white"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-medium text-sm">{type.name}</h3>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useDroppable } from "@dnd-kit/core";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface DroppableFolderProps {
    id: string;
    name: string;
    color?: string;
    qrCount: number;
    isActive?: boolean;
}

export function DroppableFolder({ id, name, color, qrCount, isActive }: DroppableFolderProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `folder-${id}`,
        data: {
            type: "folder",
            folderId: id,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                isOver 
                    ? "border-shiba-500 bg-shiba-50 dark:bg-shiba-900/30 scale-105 shadow-lg" 
                    : "border-transparent hover:bg-muted/50",
                isActive && "bg-shiba-50 dark:bg-shiba-900/20"
            )}
        >
            <div
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                style={{ backgroundColor: (color || "#ff7c10") + "20" }}
            >
                <Folder className="h-5 w-5" style={{ color: color || "#ff7c10" }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{qrCount} QR</p>
            </div>
            {isOver && (
                <span className="text-xs text-shiba-500 font-medium animate-pulse">
                    Thả vào đây
                </span>
            )}
        </div>
    );
}

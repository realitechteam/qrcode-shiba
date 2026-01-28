"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface DraggableQRCardProps {
    id: string;
    children: React.ReactNode;
    disabled?: boolean;
}

export function DraggableQRCard({ id, children, disabled }: DraggableQRCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        disabled,
    });

    const style = transform
        ? {
              transform: CSS.Translate.toString(transform),
              zIndex: isDragging ? 50 : undefined,
              opacity: isDragging ? 0.8 : 1,
          }
        : undefined;

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle */}
            <div
                {...listeners}
                {...attributes}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none z-10"
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            {children}
        </div>
    );
}

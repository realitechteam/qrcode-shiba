"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    className?: string;
}

export function PullToRefresh({ onRefresh, children, className = "" }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const isPulling = useRef(false);

    const THRESHOLD = 80; // Minimum pull distance to trigger refresh
    const MAX_PULL = 120; // Maximum visual pull distance

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Only enable pull-to-refresh when scrolled to top
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling.current || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0) {
            // Apply resistance - pull gets harder as you pull further
            const resistance = 0.5;
            const pullDist = Math.min(diff * resistance, MAX_PULL);
            setPullDistance(pullDist);

            // Haptic at threshold
            if (pullDist >= THRESHOLD && pullDistance < THRESHOLD) {
                triggerHaptic("medium");
            }
        }
    }, [isRefreshing, pullDistance]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        if (pullDistance >= THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            triggerHaptic("success");
            
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, isRefreshing, onRefresh]);

    const indicatorOpacity = Math.min(pullDistance / THRESHOLD, 1);
    const indicatorScale = 0.5 + (indicatorOpacity * 0.5);
    const rotation = (pullDistance / THRESHOLD) * 360;

    return (
        <div className={`relative ${className}`}>
            {/* Pull indicator */}
            <div
                className="absolute left-1/2 -translate-x-1/2 z-30 transition-all duration-200 pointer-events-none"
                style={{
                    top: pullDistance - 40,
                    opacity: indicatorOpacity,
                    transform: `translateX(-50%) scale(${indicatorScale})`,
                }}
            >
                <div
                    className="w-10 h-10 rounded-full bg-shiba-500 flex items-center justify-center shadow-lg"
                    style={{
                        transform: isRefreshing ? "none" : `rotate(${rotation}deg)`,
                    }}
                >
                    <Loader2
                        className={`h-5 w-5 text-white ${isRefreshing ? "animate-spin" : ""}`}
                    />
                </div>
            </div>

            {/* Content container */}
            <div
                ref={containerRef}
                className="h-full overflow-auto touch-pan-y"
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: isPulling.current ? "none" : "transform 0.3s ease-out",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}

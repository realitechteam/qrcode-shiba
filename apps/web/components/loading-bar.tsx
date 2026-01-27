"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Reset loading state on route change
        setIsLoading(true);
        setProgress(0);

        // Start progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 100);

        // Complete loading after a short delay to simulate completion
        // This is necessary because Next.js 13+ router events are not fully exposed yet
        // and we're relying on the fact that this effect runs when route changes
        const timeout = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 200);
        }, 500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [pathname, searchParams]);

    if (!isLoading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-shiba-400 to-shiba-600 transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

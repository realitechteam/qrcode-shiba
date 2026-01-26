"use client";

// Haptic feedback utility for native-like feel
export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light") {
    // Check if vibration API is available (mobile browsers)
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        switch (type) {
            case "light":
                navigator.vibrate(10);
                break;
            case "medium":
                navigator.vibrate(20);
                break;
            case "heavy":
                navigator.vibrate(40);
                break;
            case "success":
                navigator.vibrate([10, 50, 20]); // Short-pause-short pattern
                break;
            case "warning":
                navigator.vibrate([20, 30, 20, 30, 20]);
                break;
            case "error":
                navigator.vibrate([50, 30, 50]);
                break;
        }
    }
}

// Check if haptic feedback is supported
export function isHapticSupported(): boolean {
    return typeof navigator !== "undefined" && "vibrate" in navigator;
}

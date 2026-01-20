/**
 * Pending QR utility - manages QR data persistence between signup/login
 * When a guest creates a QR on homepage and signs up, we save the QR data
 * and process it after authentication to create the QR for their account.
 */

import qrApi from "./qr-api";

const PENDING_QR_KEY = "pending-qr";

export interface PendingQR {
    type: string;
    data: Record<string, any>;
    styling: {
        foregroundColor: string;
        backgroundColor?: string;
    };
    preview?: string;
    createdAt: number;
}

/**
 * Save pending QR data to localStorage
 */
export function savePendingQR(qr: Omit<PendingQR, "createdAt">): void {
    if (typeof window === "undefined") return;

    const pendingQR: PendingQR = {
        ...qr,
        createdAt: Date.now(),
    };

    localStorage.setItem(PENDING_QR_KEY, JSON.stringify(pendingQR));
}

/**
 * Get pending QR data from localStorage
 * Returns null if no pending QR or if it's older than 1 hour
 */
export function getPendingQR(): PendingQR | null {
    if (typeof window === "undefined") return null;

    try {
        const stored = localStorage.getItem(PENDING_QR_KEY);
        if (!stored) return null;

        const pendingQR: PendingQR = JSON.parse(stored);

        // Expire after 1 hour
        const ONE_HOUR = 60 * 60 * 1000;
        if (Date.now() - pendingQR.createdAt > ONE_HOUR) {
            clearPendingQR();
            return null;
        }

        return pendingQR;
    } catch {
        return null;
    }
}

/**
 * Clear pending QR from localStorage
 */
export function clearPendingQR(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PENDING_QR_KEY);
}

/**
 * Generate a name for the QR based on its type and data
 */
function generateQRName(type: string, data: Record<string, any>): string {
    switch (type) {
        case "URL":
            try {
                const url = new URL(data.url);
                return `QR - ${url.hostname}`;
            } catch {
                return "QR - Link";
            }
        case "TEXT":
            const text = data.text || "Text";
            return `QR - ${text.substring(0, 20)}${text.length > 20 ? "..." : ""}`;
        case "EMAIL":
            return `QR - Email ${data.email || ""}`;
        case "PHONE":
            return `QR - Call ${data.phone || ""}`;
        case "SMS":
            return `QR - SMS ${data.phone || ""}`;
        case "WIFI":
            return `QR - WiFi ${data.ssid || ""}`;
        case "VCARD":
            return `QR - ${data.name || data.firstName || "Contact"}`;
        default:
            return `QR - ${type}`;
    }
}

/**
 * Process pending QR - create it for the authenticated user
 * Returns the created QR data or null if no pending QR
 */
export async function processPendingQR(): Promise<{
    success: boolean;
    qrName?: string;
    error?: string;
}> {
    const pendingQR = getPendingQR();
    if (!pendingQR) {
        return { success: false };
    }

    try {
        // IMPORTANT: Clear pending QR BEFORE API call to prevent duplicate processing
        // This is crucial because React may re-render and call this again
        clearPendingQR();

        // Create static QR for user
        const response = await qrApi.post("/qr", {
            name: generateQRName(pendingQR.type, pendingQR.data),
            type: pendingQR.type,
            data: pendingQR.data,
            styling: pendingQR.styling,
            isDynamic: false,
        });

        return {
            success: true,
            qrName: response.data.name,
        };
    } catch (error: any) {
        console.error("Failed to process pending QR:", error);

        // Note: pending is already cleared, user needs to recreate QR on homepage if failed
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Lỗi tạo QR",
        };
    }
}

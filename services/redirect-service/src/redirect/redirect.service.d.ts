import { PrismaService } from "../prisma/prisma.service";
import { TrackingService, ParsedTrackingData } from "./tracking.service";
export declare class RedirectService {
    private readonly prisma;
    private readonly tracking;
    constructor(prisma: PrismaService, tracking: TrackingService);
    /**
     * Find QR code by short code and return destination URL
     */
    findDestination(shortCode: string): Promise<string>;
    /**
     * Record a scan event
     */
    recordScan(shortCode: string, trackingData: ParsedTrackingData): Promise<void>;
    /**
     * Get fallback URL for errors
     */
    getFallbackUrl(): string;
}
//# sourceMappingURL=redirect.service.d.ts.map
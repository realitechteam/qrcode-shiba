export interface TrackingData {
    ip: string;
    userAgent: string;
    referer?: string;
    acceptLanguage?: string;
}
export interface ParsedTrackingData {
    ip: string;
    country?: string;
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    deviceType: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    referer?: string;
    language?: string;
}
export declare class TrackingService {
    /**
     * Parse raw tracking data into structured format
     */
    parse(data: TrackingData): ParsedTrackingData;
    /**
     * Normalize IP address (handle localhost, IPv6, etc.)
     */
    private normalizeIp;
    /**
     * Check if this is a bot/crawler
     */
    isBot(userAgent: string): boolean;
}
//# sourceMappingURL=tracking.service.d.ts.map
import {
    Controller,
    Get,
    Query,
    UseGuards,
    Req,
} from "@nestjs/common";
import { Request } from "express";
import { AnalyticsService } from "./analytics.service";

// Simple JWT extraction (since this service might not have full auth module)
function extractUserIdFromToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }
    
    try {
        const token = authHeader.substring(7);
        // Decode JWT payload (without verification - just for extracting user ID)
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        return payload.sub || null;
    } catch {
        return null;
    }
}

@Controller("analytics")
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    /**
     * Get scans over time for charts
     */
    @Get("scans-over-time")
    async getScansOverTime(
        @Req() req: Request,
        @Query("period") period: string = "30d"
    ) {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return { error: "Unauthorized", data: [] };
        }
        
        const data = await this.analyticsService.getScansOverTime(userId, period);
        return { data };
    }

    /**
     * Get device breakdown
     */
    @Get("device-breakdown")
    async getDeviceBreakdown(
        @Req() req: Request,
        @Query("period") period: string = "30d"
    ) {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return { error: "Unauthorized", data: [] };
        }
        
        const data = await this.analyticsService.getDeviceBreakdown(userId, period);
        return { data };
    }

    /**
     * Get country breakdown
     */
    @Get("country-breakdown")
    async getCountryBreakdown(
        @Req() req: Request,
        @Query("period") period: string = "30d"
    ) {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return { error: "Unauthorized", data: [] };
        }
        
        const data = await this.analyticsService.getCountryBreakdown(userId, period);
        return { data };
    }

    /**
     * Get overall stats
     */
    @Get("stats")
    async getStats(
        @Req() req: Request,
        @Query("period") period: string = "30d"
    ) {
        const userId = extractUserIdFromToken(req);
        if (!userId) {
            return { error: "Unauthorized", data: null };
        }
        
        const data = await this.analyticsService.getStats(userId, period);
        return { data };
    }
}

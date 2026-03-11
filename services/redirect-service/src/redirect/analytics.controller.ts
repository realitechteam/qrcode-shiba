import {
    Controller,
    Get,
    Query,
    Req,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
    private readonly jwtSecret: string;

    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly configService: ConfigService,
    ) {
        const secret = this.configService.get<string>("JWT_ACCESS_SECRET");
        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET environment variable is required");
        }
        this.jwtSecret = secret;
    }

    private extractAndVerifyToken(req: Request): string {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid authorization header");
        }

        try {
            const token = authHeader.substring(7);
            const payload = jwt.verify(token, this.jwtSecret) as { sub: string };
            if (!payload.sub) {
                throw new UnauthorizedException("Invalid token payload");
            }
            return payload.sub;
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }

    /**
     * Get scans over time for charts
     */
    @Get("scans-over-time")
    async getScansOverTime(
        @Req() req: Request,
        @Query("period") period: string = "30d"
    ) {
        const userId = this.extractAndVerifyToken(req);
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
        const userId = this.extractAndVerifyToken(req);
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
        const userId = this.extractAndVerifyToken(req);
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
        const userId = this.extractAndVerifyToken(req);
        const data = await this.analyticsService.getStats(userId, period);
        return { data };
    }
}

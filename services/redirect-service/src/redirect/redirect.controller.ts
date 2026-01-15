import {
    Controller,
    Get,
    Param,
    Req,
    Res,
    HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { RedirectService } from "./redirect.service";
import { TrackingService } from "./tracking.service";

@Controller()
export class RedirectController {
    constructor(
        private readonly redirectService: RedirectService,
        private readonly trackingService: TrackingService
    ) { }

    /**
     * Handle QR code scan redirect
     * Main endpoint: GET /:shortCode
     */
    @Get(":shortCode")
    async redirect(
        @Param("shortCode") shortCode: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            // Get tracking data from request
            const trackingData = {
                ip: this.getClientIp(req),
                userAgent: req.headers["user-agent"] || "",
                referer: (req.headers["referer"] || req.headers["referrer"] || "") as string,
                acceptLanguage: (req.headers["accept-language"] || "") as string,
            };

            // Skip bot tracking
            const isBot = this.trackingService.isBot(trackingData.userAgent);

            // Find destination
            const destination = await this.redirectService.findDestination(shortCode);

            // Record scan asynchronously (don't wait)
            if (!isBot) {
                const parsed = this.trackingService.parse(trackingData);
                this.redirectService.recordScan(shortCode, parsed).catch((err) => {
                    console.error("Failed to record scan:", err);
                });
            }

            // Redirect to destination
            return res.redirect(HttpStatus.FOUND, destination);
        } catch (error) {
            // Redirect to fallback on error
            const fallback = this.redirectService.getFallbackUrl();
            return res.redirect(HttpStatus.FOUND, fallback + "/not-found");
        }
    }

    /**
     * Health check endpoint
     */
    @Get("health")
    health() {
        return { status: "ok", service: "redirect-service" };
    }

    /**
     * Get client IP from request (handle proxies)
     */
    private getClientIp(req: Request): string {
        // Check various headers for real IP
        const forwardedFor = req.headers["x-forwarded-for"];
        if (forwardedFor) {
            const ips = Array.isArray(forwardedFor)
                ? forwardedFor[0]
                : forwardedFor.split(",")[0];
            return ips.trim();
        }

        const realIp = req.headers["x-real-ip"];
        if (realIp) {
            return Array.isArray(realIp) ? realIp[0] : realIp;
        }

        return req.ip || req.socket.remoteAddress || "0.0.0.0";
    }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const redirect_service_1 = require("./redirect.service");
const tracking_service_1 = require("./tracking.service");
let RedirectController = class RedirectController {
    redirectService;
    trackingService;
    constructor(redirectService, trackingService) {
        this.redirectService = redirectService;
        this.trackingService = trackingService;
    }
    /**
     * Handle QR code scan redirect
     * Main endpoint: GET /:shortCode
     */
    async redirect(shortCode, req, res) {
        try {
            // Get tracking data from request
            const trackingData = {
                ip: this.getClientIp(req),
                userAgent: req.headers["user-agent"] || "",
                referer: req.headers["referer"] || req.headers["referrer"],
                acceptLanguage: req.headers["accept-language"],
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
            return res.redirect(common_1.HttpStatus.FOUND, destination);
        }
        catch (error) {
            // Redirect to fallback on error
            const fallback = this.redirectService.getFallbackUrl();
            return res.redirect(common_1.HttpStatus.FOUND, fallback + "/not-found");
        }
    }
    /**
     * Health check endpoint
     */
    health() {
        return { status: "ok", service: "redirect-service" };
    }
    /**
     * Get client IP from request (handle proxies)
     */
    getClientIp(req) {
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
};
exports.RedirectController = RedirectController;
__decorate([
    (0, common_1.Get)(":shortCode"),
    __param(0, (0, common_1.Param)("shortCode")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], RedirectController.prototype, "redirect", null);
__decorate([
    (0, common_1.Get)("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RedirectController.prototype, "health", null);
exports.RedirectController = RedirectController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [redirect_service_1.RedirectService,
        tracking_service_1.TrackingService])
], RedirectController);

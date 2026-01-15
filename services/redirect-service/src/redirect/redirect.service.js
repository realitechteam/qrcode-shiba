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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tracking_service_1 = require("./tracking.service");
let RedirectService = class RedirectService {
    prisma;
    tracking;
    constructor(prisma, tracking) {
        this.prisma = prisma;
        this.tracking = tracking;
    }
    /**
     * Find QR code by short code and return destination URL
     */
    async findDestination(shortCode) {
        const qr = await this.prisma.qRCode.findFirst({
            where: {
                shortCode,
                status: "ACTIVE",
            },
            select: {
                id: true,
                isDynamic: true,
                destinationUrl: true,
                content: {
                    select: {
                        data: true,
                    },
                },
            },
        });
        if (!qr) {
            throw new common_1.NotFoundException("QR code not found");
        }
        // For dynamic QR codes, use the current destination URL
        if (qr.isDynamic && qr.destinationUrl) {
            return qr.destinationUrl;
        }
        // For static QR codes, extract URL from content
        const content = qr.content?.data;
        if (content?.url) {
            return content.url;
        }
        throw new common_1.NotFoundException("No destination URL found");
    }
    /**
     * Record a scan event
     */
    async recordScan(shortCode, trackingData) {
        const qr = await this.prisma.qRCode.findFirst({
            where: { shortCode },
            select: { id: true },
        });
        if (!qr)
            return;
        await this.prisma.scan.create({
            data: {
                qrId: qr.id,
                scannedAt: new Date(),
                ip: trackingData.ip,
                country: trackingData.country,
                city: trackingData.city,
                region: trackingData.region,
                latitude: trackingData.latitude,
                longitude: trackingData.longitude,
                deviceType: trackingData.deviceType,
                browser: trackingData.browser,
                browserVersion: trackingData.browserVersion,
                os: trackingData.os,
                osVersion: trackingData.osVersion,
                referer: trackingData.referer,
                language: trackingData.language,
            },
        });
    }
    /**
     * Get fallback URL for errors
     */
    getFallbackUrl() {
        return process.env.FRONTEND_URL || "https://qrcode-shiba.com";
    }
};
exports.RedirectService = RedirectService;
exports.RedirectService = RedirectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tracking_service_1.TrackingService])
], RedirectService);

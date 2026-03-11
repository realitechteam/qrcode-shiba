import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TrackingService, ParsedTrackingData } from "./tracking.service";

/** Only allow safe URL protocols for redirects */
function isSafeUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

@Injectable()
export class RedirectService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tracking: TrackingService
    ) { }

    /**
     * Find QR code by short code and return destination URL
     */
    async findDestination(shortCode: string): Promise<string> {
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
            throw new NotFoundException("QR code not found");
        }

        // For dynamic QR codes, use the current destination URL
        if (qr.isDynamic && qr.destinationUrl) {
            if (!isSafeUrl(qr.destinationUrl)) {
                throw new NotFoundException("Invalid destination URL");
            }
            return qr.destinationUrl;
        }

        // For static QR codes, extract URL from content
        const content = qr.content?.data as Record<string, any>;
        if (content?.url) {
            if (!isSafeUrl(content.url)) {
                throw new NotFoundException("Invalid destination URL");
            }
            return content.url;
        }

        throw new NotFoundException("No destination URL found");
    }

    /**
     * Record a scan event
     */
    async recordScan(shortCode: string, trackingData: ParsedTrackingData): Promise<void> {
        const qr = await this.prisma.qRCode.findFirst({
            where: { shortCode },
            select: { id: true },
        });

        if (!qr) return;

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
    getFallbackUrl(): string {
        return process.env.FRONTEND_URL || "https://qrcode-shiba.com";
    }
}

import { Injectable } from "@nestjs/common";
import * as geoip from "geoip-lite";
import * as UAParser from "ua-parser-js";

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

@Injectable()
export class TrackingService {
    /**
     * Parse raw tracking data into structured format
     */
    parse(data: TrackingData): ParsedTrackingData {
        // Parse User Agent
        const parser = new UAParser.UAParser(data.userAgent);
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        const os = parser.getOS();

        // Determine device type
        let deviceType = "Desktop";
        if (device.type === "mobile") {
            deviceType = "Mobile";
        } else if (device.type === "tablet") {
            deviceType = "Tablet";
        }

        // Parse GeoIP
        const geo = geoip.lookup(this.normalizeIp(data.ip));

        // Parse language from Accept-Language header
        let language: string | undefined;
        if (data.acceptLanguage) {
            const match = data.acceptLanguage.match(/^([a-z]{2})/i);
            if (match) {
                language = match[1].toLowerCase();
            }
        }

        return {
            ip: this.normalizeIp(data.ip),
            country: geo?.country,
            city: geo?.city,
            region: geo?.region,
            latitude: geo?.ll?.[0],
            longitude: geo?.ll?.[1],
            deviceType,
            browser: browser.name,
            browserVersion: browser.version,
            os: os.name,
            osVersion: os.version,
            referer: data.referer,
            language,
        };
    }

    /**
     * Normalize IP address (handle localhost, IPv6, etc.)
     */
    private normalizeIp(ip: string): string {
        // Handle localhost
        if (ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
            return "127.0.0.1";
        }

        // Strip IPv6 prefix
        if (ip.startsWith("::ffff:")) {
            return ip.substring(7);
        }

        return ip;
    }

    /**
     * Check if this is a bot/crawler
     */
    isBot(userAgent: string): boolean {
        const botPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /googlebot/i,
            /bingbot/i,
            /yandex/i,
            /baidu/i,
            /facebookexternalhit/i,
            /twitterbot/i,
            /linkedinbot/i,
            /whatsapp/i,
            /telegram/i,
            /slackbot/i,
        ];

        return botPatterns.some((pattern) => pattern.test(userAgent));
    }
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const geoip = __importStar(require("geoip-lite"));
const UAParser = __importStar(require("ua-parser-js"));
let TrackingService = class TrackingService {
    /**
     * Parse raw tracking data into structured format
     */
    parse(data) {
        // Parse User Agent
        const parser = new UAParser.UAParser(data.userAgent);
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        const os = parser.getOS();
        // Determine device type
        let deviceType = "Desktop";
        if (device.type === "mobile") {
            deviceType = "Mobile";
        }
        else if (device.type === "tablet") {
            deviceType = "Tablet";
        }
        // Parse GeoIP
        const geo = geoip.lookup(this.normalizeIp(data.ip));
        // Parse language from Accept-Language header
        let language;
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
    normalizeIp(ip) {
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
    isBot(userAgent) {
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
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)()
], TrackingService);

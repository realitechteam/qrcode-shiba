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
exports.GeneratorService = void 0;
const common_1 = require("@nestjs/common");
const QRCode = __importStar(require("qrcode"));
let GeneratorService = class GeneratorService {
    /**
     * Generate QR data string based on type
     */
    generateDataString(type, data) {
        switch (type) {
            case "url":
                return data.url;
            case "text":
                return data.text;
            case "email":
                const emailParts = [`mailto:${data.email}`];
                const emailParams = [];
                if (data.subject)
                    emailParams.push(`subject=${encodeURIComponent(data.subject)}`);
                if (data.body)
                    emailParams.push(`body=${encodeURIComponent(data.body)}`);
                if (emailParams.length > 0) {
                    emailParts.push(`?${emailParams.join("&")}`);
                }
                return emailParts.join("");
            case "phone":
                return `tel:${data.phone}`;
            case "sms":
                return `sms:${data.phone}${data.message ? `?body=${encodeURIComponent(data.message)}` : ""}`;
            case "wifi":
                // WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;H:<hidden>;;
                const wifiParts = [
                    "WIFI:",
                    `S:${this.escapeWifiString(data.ssid)}`,
                    `;T:${data.encryption || "WPA"}`,
                    `;P:${this.escapeWifiString(data.password || "")}`,
                ];
                if (data.hidden)
                    wifiParts.push(";H:true");
                wifiParts.push(";;");
                return wifiParts.join("");
            case "vcard":
                return this.generateVCard(data);
            case "location":
                return `geo:${data.latitude},${data.longitude}`;
            default:
                return data.content || JSON.stringify(data);
        }
    }
    /**
     * Generate vCard string
     */
    generateVCard(data) {
        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${data.lastName || ""};${data.firstName || ""};;;`,
            `FN:${data.firstName || ""} ${data.lastName || ""}`.trim(),
        ];
        if (data.organization)
            lines.push(`ORG:${data.organization}`);
        if (data.title)
            lines.push(`TITLE:${data.title}`);
        if (data.phone)
            lines.push(`TEL;TYPE=CELL:${data.phone}`);
        if (data.workPhone)
            lines.push(`TEL;TYPE=WORK:${data.workPhone}`);
        if (data.email)
            lines.push(`EMAIL:${data.email}`);
        if (data.website)
            lines.push(`URL:${data.website}`);
        if (data.address) {
            lines.push(`ADR;TYPE=WORK:;;${data.address.street || ""};${data.address.city || ""};${data.address.state || ""};${data.address.zip || ""};${data.address.country || ""}`);
        }
        lines.push("END:VCARD");
        return lines.join("\n");
    }
    /**
     * Escape special characters in WiFi string
     */
    escapeWifiString(str) {
        return str.replace(/[\\;,:]/g, "\\$&");
    }
    /**
     * Generate QR code as data URL (PNG base64)
     */
    async generateDataUrl(content, options = {}) {
        const qrOptions = {
            errorCorrectionLevel: options.errorCorrectionLevel || "M",
            margin: options.margin ?? 2,
            width: options.size || 300,
            color: {
                dark: options.foregroundColor || "#000000",
                light: options.backgroundColor || "#FFFFFF",
            },
        };
        return QRCode.toDataURL(content, qrOptions);
    }
    /**
     * Generate QR code as SVG string
     */
    async generateSvg(content, options = {}) {
        const qrOptions = {
            type: "svg",
            errorCorrectionLevel: options.errorCorrectionLevel || "M",
            margin: options.margin ?? 2,
            width: options.size || 300,
            color: {
                dark: options.foregroundColor || "#000000",
                light: options.backgroundColor || "#FFFFFF",
            },
        };
        return QRCode.toString(content, qrOptions);
    }
    /**
     * Generate QR code as PNG buffer
     */
    async generateBuffer(content, options = {}) {
        const qrOptions = {
            errorCorrectionLevel: options.errorCorrectionLevel || "M",
            margin: options.margin ?? 2,
            width: options.size || 300,
            color: {
                dark: options.foregroundColor || "#000000",
                light: options.backgroundColor || "#FFFFFF",
            },
        };
        return QRCode.toBuffer(content, qrOptions);
    }
    /**
     * Generate QR matrix (for custom rendering)
     */
    async generateMatrix(content, options = {}) {
        const qr = QRCode.create(content, {
            errorCorrectionLevel: options.errorCorrectionLevel || "M",
        });
        const modules = qr.modules;
        const size = modules.size;
        const data = [];
        for (let row = 0; row < size; row++) {
            const rowData = [];
            for (let col = 0; col < size; col++) {
                rowData.push(modules.get(row, col) === 1);
            }
            data.push(rowData);
        }
        return {
            size,
            data,
        };
    }
};
exports.GeneratorService = GeneratorService;
exports.GeneratorService = GeneratorService = __decorate([
    (0, common_1.Injectable)()
], GeneratorService);

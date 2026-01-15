import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";
import { QROptions, QRMatrix } from "./types";

@Injectable()
export class GeneratorService {
    /**
     * Generate QR data string based on type
     */
    generateDataString(type: string, data: Record<string, any>): string {
        switch (type) {
            case "url":
                return data.url;

            case "text":
                return data.text;

            case "email":
                const emailParts = [`mailto:${data.email}`];
                const emailParams: string[] = [];
                if (data.subject) emailParams.push(`subject=${encodeURIComponent(data.subject)}`);
                if (data.body) emailParams.push(`body=${encodeURIComponent(data.body)}`);
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
                if (data.hidden) wifiParts.push(";H:true");
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
    private generateVCard(data: Record<string, any>): string {
        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${data.lastName || ""};${data.firstName || ""};;;`,
            `FN:${data.firstName || ""} ${data.lastName || ""}`.trim(),
        ];

        if (data.organization) lines.push(`ORG:${data.organization}`);
        if (data.title) lines.push(`TITLE:${data.title}`);
        if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
        if (data.workPhone) lines.push(`TEL;TYPE=WORK:${data.workPhone}`);
        if (data.email) lines.push(`EMAIL:${data.email}`);
        if (data.website) lines.push(`URL:${data.website}`);
        if (data.address) {
            lines.push(
                `ADR;TYPE=WORK:;;${data.address.street || ""};${data.address.city || ""};${data.address.state || ""};${data.address.zip || ""};${data.address.country || ""}`
            );
        }

        lines.push("END:VCARD");
        return lines.join("\n");
    }

    /**
     * Escape special characters in WiFi string
     */
    private escapeWifiString(str: string): string {
        return str.replace(/[\\;,:]/g, "\\$&");
    }

    /**
     * Generate QR code as data URL (PNG base64)
     */
    async generateDataUrl(
        content: string,
        options: QROptions = {}
    ): Promise<string> {
        const qrOptions: QRCode.QRCodeToDataURLOptions = {
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
    async generateSvg(content: string, options: QROptions = {}): Promise<string> {
        const qrOptions: QRCode.QRCodeToStringOptions = {
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
    async generateBuffer(
        content: string,
        options: QROptions = {}
    ): Promise<Buffer> {
        const qrOptions: QRCode.QRCodeToBufferOptions = {
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
    async generateMatrix(
        content: string,
        options: QROptions = {}
    ): Promise<QRMatrix> {
        const qr = QRCode.create(content, {
            errorCorrectionLevel: options.errorCorrectionLevel || "M",
        });

        const modules = qr.modules;
        const size = modules.size;
        const data: boolean[][] = [];

        for (let row = 0; row < size; row++) {
            const rowData: boolean[] = [];
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
}

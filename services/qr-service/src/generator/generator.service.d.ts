import { QROptions, QRMatrix } from "./types";
export declare class GeneratorService {
    /**
     * Generate QR data string based on type
     */
    generateDataString(type: string, data: Record<string, any>): string;
    /**
     * Generate vCard string
     */
    private generateVCard;
    /**
     * Escape special characters in WiFi string
     */
    private escapeWifiString;
    /**
     * Generate QR code as data URL (PNG base64)
     */
    generateDataUrl(content: string, options?: QROptions): Promise<string>;
    /**
     * Generate QR code as SVG string
     */
    generateSvg(content: string, options?: QROptions): Promise<string>;
    /**
     * Generate QR code as PNG buffer
     */
    generateBuffer(content: string, options?: QROptions): Promise<Buffer>;
    /**
     * Generate QR matrix (for custom rendering)
     */
    generateMatrix(content: string, options?: QROptions): Promise<QRMatrix>;
}
//# sourceMappingURL=generator.service.d.ts.map
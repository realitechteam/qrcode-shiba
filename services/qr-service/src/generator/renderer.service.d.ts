import { LogoOptions } from "./types";
export declare class RendererService {
    /**
     * Convert SVG string to PNG buffer
     */
    svgToPng(svg: string, width?: number): Promise<Buffer>;
    /**
     * Add logo overlay to QR code image
     */
    addLogoOverlay(qrBuffer: Buffer, logoOptions: LogoOptions, qrSize: number): Promise<Buffer>;
    /**
     * Add logo to SVG string
     */
    addLogoToSvg(svg: string, logoDataUrl: string, logoOptions: LogoOptions, qrSize: number): string;
    /**
     * Optimize PNG for web delivery
     */
    optimizePng(buffer: Buffer): Promise<Buffer>;
    /**
     * Generate different sizes for download
     */
    generateSizes(svg: string, sizes: number[]): Promise<Map<number, Buffer>>;
}
//# sourceMappingURL=renderer.service.d.ts.map
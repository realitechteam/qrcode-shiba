import { Injectable } from "@nestjs/common";
import sharp from "sharp";
import { LogoOptions } from "./types";

@Injectable()
export class RendererService {
    /**
     * Convert SVG string to PNG buffer
     */
    async svgToPng(svg: string, width: number = 300): Promise<Buffer> {
        return sharp(Buffer.from(svg))
            .resize(width, width)
            .png()
            .toBuffer();
    }

    /**
     * Add logo overlay to QR code image
     */
    async addLogoOverlay(
        qrBuffer: Buffer,
        logoOptions: LogoOptions,
        qrSize: number
    ): Promise<Buffer> {
        const logoSizePercent = logoOptions.size || 20;
        const logoSize = Math.floor((qrSize * logoSizePercent) / 100);
        const logoMargin = logoOptions.margin || 5;

        // Resize logo
        let logo = sharp(logoOptions.image).resize(
            logoSize - logoMargin * 2,
            logoSize - logoMargin * 2,
            { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }
        );

        // Apply border radius if specified
        if (logoOptions.borderRadius && logoOptions.borderRadius > 0) {
            const roundedCorners = Buffer.from(
                `<svg><rect x="0" y="0" width="${logoSize - logoMargin * 2}" height="${logoSize - logoMargin * 2}" rx="${logoOptions.borderRadius}" ry="${logoOptions.borderRadius}"/></svg>`
            );

            logo = logo.composite([
                {
                    input: roundedCorners,
                    blend: "dest-in",
                },
            ]);
        }

        const logoBuffer = await logo.png().toBuffer();

        // Calculate center position
        const left = Math.floor((qrSize - logoSize) / 2);
        const top = Math.floor((qrSize - logoSize) / 2);

        // Create background circle/square for logo
        const bgColor = logoOptions.backgroundColor || "#FFFFFF";
        const logoBackground = Buffer.from(
            `<svg width="${logoSize}" height="${logoSize}">
        <rect width="${logoSize}" height="${logoSize}" fill="${bgColor}" rx="${logoOptions.borderRadius || 0}"/>
      </svg>`
        );

        // Composite QR with logo background and logo
        return sharp(qrBuffer)
            .composite([
                {
                    input: await sharp(logoBackground).png().toBuffer(),
                    left,
                    top,
                },
                {
                    input: logoBuffer,
                    left: left + logoMargin,
                    top: top + logoMargin,
                },
            ])
            .png()
            .toBuffer();
    }

    /**
     * Add logo to SVG string
     */
    addLogoToSvg(
        svg: string,
        logoDataUrl: string,
        logoOptions: LogoOptions,
        qrSize: number
    ): string {
        const logoSizePercent = logoOptions.size || 20;
        const logoSize = Math.floor((qrSize * logoSizePercent) / 100);
        const logoMargin = logoOptions.margin || 5;
        const position = (qrSize - logoSize) / 2;

        const bgColor = logoOptions.backgroundColor || "#FFFFFF";
        const borderRadius = logoOptions.borderRadius || 0;

        const logoSvg = `
      <rect 
        x="${position}" 
        y="${position}" 
        width="${logoSize}" 
        height="${logoSize}" 
        fill="${bgColor}" 
        rx="${borderRadius}"
      />
      <image 
        x="${position + logoMargin}" 
        y="${position + logoMargin}" 
        width="${logoSize - logoMargin * 2}" 
        height="${logoSize - logoMargin * 2}" 
        href="${logoDataUrl}"
        preserveAspectRatio="xMidYMid meet"
      />
    `;

        // Insert logo before closing </svg> tag
        return svg.replace("</svg>", `${logoSvg}</svg>`);
    }

    /**
     * Optimize PNG for web delivery
     */
    async optimizePng(buffer: Buffer): Promise<Buffer> {
        return sharp(buffer)
            .png({
                compressionLevel: 9,
                adaptiveFiltering: true,
            })
            .toBuffer();
    }

    /**
     * Generate different sizes for download
     */
    async generateSizes(
        svg: string,
        sizes: number[]
    ): Promise<Map<number, Buffer>> {
        const result = new Map<number, Buffer>();

        for (const size of sizes) {
            const buffer = await this.svgToPng(svg, size);
            result.set(size, buffer);
        }

        return result;
    }
}

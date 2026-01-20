import { Injectable } from "@nestjs/common";
import { QRStyling, QRMatrix, DEFAULT_STYLING } from "./types";

@Injectable()
export class StylerService {
    /**
     * Generate styled SVG from QR matrix
     */
    generateStyledSvg(
        matrix: QRMatrix,
        styling: Partial<QRStyling> = {},
        size: number = 300
    ): string {
        const style = { ...DEFAULT_STYLING, ...styling };
        const moduleSize = size / (matrix.size + 4); // Add margin
        const margin = moduleSize * 2;

        // Calculate frame dimensions
        const hasFrame = style.frameStyle && style.frameStyle !== "none";
        const framePadding = hasFrame ? 15 : 0;
        const frameTextHeight = hasFrame && style.frameText ? 35 : 0;

        // Total SVG dimensions (expanded for frame)
        const totalWidth = size + framePadding * 2;
        const totalHeight = size + framePadding * 2 + frameTextHeight;

        const svgParts: string[] = [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">`,
        ];

        // Background (covers entire area including frame)
        svgParts.push(`<rect width="${totalWidth}" height="${totalHeight}" fill="${style.backgroundColor}"/>`);

        // Defs for gradients and patterns
        if (style.gradientType !== "none" && style.gradientColors?.length) {
            svgParts.push(this.generateGradientDefs(style));
        }

        // Frame border if enabled (draw before QR so it's behind)
        if (hasFrame) {
            svgParts.push(this.generateFrame(totalWidth, totalHeight, framePadding, style));
        }

        // Generate QR modules (offset by frame padding)
        const modulesGroup = this.generateModules(
            matrix,
            moduleSize,
            margin,
            style,
            framePadding // Pass offset
        );
        svgParts.push(modulesGroup);

        // Frame text if enabled
        if (hasFrame && style.frameText) {
            const textColor = style.frameTextColor || style.frameColor || style.foregroundColor;
            svgParts.push(`<text x="${totalWidth / 2}" y="${totalHeight - 10}" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="bold" font-family="Arial, sans-serif">${style.frameText}</text>`);
        }

        svgParts.push("</svg>");

        return svgParts.join("\n");
    }

    private generateBackground(size: number, style: QRStyling): string {
        return `<rect width="${size}" height="${size}" fill="${style.backgroundColor}"/>`;
    }

    private generateGradientDefs(style: QRStyling): string {
        if (!style.gradientColors?.length) return "";

        const stops = style.gradientColors
            .map((color, i) => {
                const offset = (i / (style.gradientColors!.length - 1)) * 100;
                return `<stop offset="${offset}%" stop-color="${color}"/>`;
            })
            .join("");

        if (style.gradientType === "linear") {
            const angle = style.gradientDirection || 0;
            const radian = (angle * Math.PI) / 180;
            const x2 = 50 + 50 * Math.cos(radian);
            const y2 = 50 + 50 * Math.sin(radian);
            return `<defs><linearGradient id="qr-gradient" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient></defs>`;
        } else if (style.gradientType === "radial") {
            return `<defs><radialGradient id="qr-gradient" cx="50%" cy="50%" r="50%">${stops}</radialGradient></defs>`;
        }

        return "";
    }

    private generateModules(
        matrix: QRMatrix,
        moduleSize: number,
        margin: number,
        style: QRStyling,
        offset: number = 0 // Frame padding offset
    ): string {
        const fillColor =
            style.gradientType !== "none" && style.gradientColors?.length
                ? "url(#qr-gradient)"
                : style.foregroundColor;

        const paths: string[] = [];

        for (let row = 0; row < matrix.size; row++) {
            for (let col = 0; col < matrix.size; col++) {
                if (!matrix.data[row][col]) continue;

                // Add offset to position QR inside the frame
                const x = offset + margin + col * moduleSize;
                const y = offset + margin + row * moduleSize;

                // Check if this is a corner finder pattern
                const isCorner = this.isFinderPattern(row, col, matrix.size);

                if (isCorner.isSquare) {
                    paths.push(
                        this.generateCornerSquare(
                            x,
                            y,
                            moduleSize,
                            style.cornersSquareStyle
                        )
                    );
                } else if (isCorner.isDot) {
                    paths.push(
                        this.generateCornerDot(x, y, moduleSize, style.cornersDotStyle)
                    );
                } else {
                    paths.push(
                        this.generateModule(x, y, moduleSize, style.dotsStyle)
                    );
                }
            }
        }

        return `<g fill="${fillColor}">${paths.join("")}</g>`;
    }

    private isFinderPattern(
        row: number,
        col: number,
        size: number
    ): { isSquare: boolean; isDot: boolean } {
        // Top-left, top-right, bottom-left finder patterns
        const patterns = [
            { r: 0, c: 0 },
            { r: 0, c: size - 7 },
            { r: size - 7, c: 0 },
        ];

        for (const pattern of patterns) {
            const rowOff = row - pattern.r;
            const colOff = col - pattern.c;

            if (rowOff >= 0 && rowOff < 7 && colOff >= 0 && colOff < 7) {
                // Outer square (row/col = 0 or 6)
                if (
                    rowOff === 0 ||
                    rowOff === 6 ||
                    colOff === 0 ||
                    colOff === 6
                ) {
                    return { isSquare: true, isDot: false };
                }
                // Inner dot (row/col = 2-4)
                if (
                    rowOff >= 2 &&
                    rowOff <= 4 &&
                    colOff >= 2 &&
                    colOff <= 4
                ) {
                    return { isSquare: false, isDot: true };
                }
            }
        }

        return { isSquare: false, isDot: false };
    }

    private generateModule(
        x: number,
        y: number,
        size: number,
        style: QRStyling["dotsStyle"]
    ): string {
        const gap = size * 0.1;
        const s = size - gap;

        switch (style) {
            case "rounded":
                const r = s * 0.3;
                return `<rect x="${x + gap / 2}" y="${y + gap / 2}" width="${s}" height="${s}" rx="${r}" ry="${r}"/>`;

            case "dots":
                const radius = s / 2;
                const cx = x + size / 2;
                const cy = y + size / 2;
                return `<circle cx="${cx}" cy="${cy}" r="${radius}"/>`;

            case "classy":
                return `<path d="M${x + gap / 2} ${y + gap / 2}h${s}v${s}h${-s}z"/>`;

            case "classy-rounded":
                const cr = s * 0.2;
                return `<rect x="${x + gap / 2}" y="${y + gap / 2}" width="${s}" height="${s}" rx="${cr}" ry="${cr}"/>`;

            case "square":
            default:
                return `<rect x="${x + gap / 2}" y="${y + gap / 2}" width="${s}" height="${s}"/>`;
        }
    }

    private generateCornerSquare(
        x: number,
        y: number,
        size: number,
        style: QRStyling["cornersSquareStyle"]
    ): string {
        switch (style) {
            case "dot":
                const r = size / 2;
                return `<circle cx="${x + r}" cy="${y + r}" r="${r}"/>`;

            case "extra-rounded":
                const er = size * 0.5;
                return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${er}" ry="${er}"/>`;

            case "square":
            default:
                return `<rect x="${x}" y="${y}" width="${size}" height="${size}"/>`;
        }
    }

    private generateCornerDot(
        x: number,
        y: number,
        size: number,
        style: QRStyling["cornersDotStyle"]
    ): string {
        switch (style) {
            case "dot":
                const r = size / 2;
                return `<circle cx="${x + r}" cy="${y + r}" r="${r}"/>`;

            case "square":
            default:
                return `<rect x="${x}" y="${y}" width="${size}" height="${size}"/>`;
        }
    }

    private generateFrame(totalWidth: number, totalHeight: number, padding: number, style: QRStyling): string {
        if (!style.frameStyle || style.frameStyle === "none") return "";

        const frameColor = style.frameColor || style.foregroundColor;
        const radius = style.frameStyle === "rounded" ? 12 : 0;
        const strokeWidth = 3;
        const inset = strokeWidth / 2; // So stroke doesn't clip

        // Draw frame border inside the SVG bounds
        return `<rect x="${inset}" y="${inset}" width="${totalWidth - strokeWidth}" height="${totalHeight - strokeWidth}" rx="${radius}" fill="none" stroke="${frameColor}" stroke-width="${strokeWidth}"/>`;
    }
}

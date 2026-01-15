"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylerService = void 0;
const common_1 = require("@nestjs/common");
const types_1 = require("./types");
let StylerService = class StylerService {
    /**
     * Generate styled SVG from QR matrix
     */
    generateStyledSvg(matrix, styling = {}, size = 300) {
        const style = { ...types_1.DEFAULT_STYLING, ...styling };
        const moduleSize = size / (matrix.size + 4); // Add margin
        const margin = moduleSize * 2;
        const svgParts = [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
        ];
        // Background
        svgParts.push(this.generateBackground(size, style));
        // Defs for gradients and patterns
        if (style.gradientType !== "none" && style.gradientColors?.length) {
            svgParts.push(this.generateGradientDefs(style));
        }
        // Generate QR modules
        const modulesGroup = this.generateModules(matrix, moduleSize, margin, style);
        svgParts.push(modulesGroup);
        // Frame if enabled
        if (style.frameStyle && style.frameStyle !== "none") {
            svgParts.push(this.generateFrame(size, style));
        }
        svgParts.push("</svg>");
        return svgParts.join("\n");
    }
    generateBackground(size, style) {
        return `<rect width="${size}" height="${size}" fill="${style.backgroundColor}"/>`;
    }
    generateGradientDefs(style) {
        if (!style.gradientColors?.length)
            return "";
        const stops = style.gradientColors
            .map((color, i) => {
            const offset = (i / (style.gradientColors.length - 1)) * 100;
            return `<stop offset="${offset}%" stop-color="${color}"/>`;
        })
            .join("");
        if (style.gradientType === "linear") {
            const angle = style.gradientDirection || 0;
            const radian = (angle * Math.PI) / 180;
            const x2 = 50 + 50 * Math.cos(radian);
            const y2 = 50 + 50 * Math.sin(radian);
            return `<defs><linearGradient id="qr-gradient" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient></defs>`;
        }
        else if (style.gradientType === "radial") {
            return `<defs><radialGradient id="qr-gradient" cx="50%" cy="50%" r="50%">${stops}</radialGradient></defs>`;
        }
        return "";
    }
    generateModules(matrix, moduleSize, margin, style) {
        const fillColor = style.gradientType !== "none" && style.gradientColors?.length
            ? "url(#qr-gradient)"
            : style.foregroundColor;
        const paths = [];
        for (let row = 0; row < matrix.size; row++) {
            for (let col = 0; col < matrix.size; col++) {
                if (!matrix.data[row][col])
                    continue;
                const x = margin + col * moduleSize;
                const y = margin + row * moduleSize;
                // Check if this is a corner finder pattern
                const isCorner = this.isFinderPattern(row, col, matrix.size);
                if (isCorner.isSquare) {
                    paths.push(this.generateCornerSquare(x, y, moduleSize, style.cornersSquareStyle));
                }
                else if (isCorner.isDot) {
                    paths.push(this.generateCornerDot(x, y, moduleSize, style.cornersDotStyle));
                }
                else {
                    paths.push(this.generateModule(x, y, moduleSize, style.dotsStyle));
                }
            }
        }
        return `<g fill="${fillColor}">${paths.join("")}</g>`;
    }
    isFinderPattern(row, col, size) {
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
                if (rowOff === 0 ||
                    rowOff === 6 ||
                    colOff === 0 ||
                    colOff === 6) {
                    return { isSquare: true, isDot: false };
                }
                // Inner dot (row/col = 2-4)
                if (rowOff >= 2 &&
                    rowOff <= 4 &&
                    colOff >= 2 &&
                    colOff <= 4) {
                    return { isSquare: false, isDot: true };
                }
            }
        }
        return { isSquare: false, isDot: false };
    }
    generateModule(x, y, size, style) {
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
    generateCornerSquare(x, y, size, style) {
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
    generateCornerDot(x, y, size, style) {
        switch (style) {
            case "dot":
                const r = size / 2;
                return `<circle cx="${x + r}" cy="${y + r}" r="${r}"/>`;
            case "square":
            default:
                return `<rect x="${x}" y="${y}" width="${size}" height="${size}"/>`;
        }
    }
    generateFrame(size, style) {
        if (!style.frameStyle || style.frameStyle === "none")
            return "";
        const frameColor = style.frameColor || style.foregroundColor;
        const padding = 10;
        const frameWidth = size + padding * 2;
        const frameHeight = size + padding * 2 + (style.frameText ? 30 : 0);
        const radius = style.frameStyle === "rounded" ? 10 : 0;
        let frameSvg = `<rect x="${-padding}" y="${-padding}" width="${frameWidth}" height="${frameHeight}" rx="${radius}" fill="none" stroke="${frameColor}" stroke-width="2"/>`;
        if (style.frameText) {
            const textColor = style.frameTextColor || frameColor;
            frameSvg += `<text x="${size / 2}" y="${size + padding + 20}" text-anchor="middle" fill="${textColor}" font-size="14" font-family="Arial, sans-serif">${style.frameText}</text>`;
        }
        return frameSvg;
    }
};
exports.StylerService = StylerService;
exports.StylerService = StylerService = __decorate([
    (0, common_1.Injectable)()
], StylerService);

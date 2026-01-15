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
exports.RendererService = void 0;
const common_1 = require("@nestjs/common");
const sharp = __importStar(require("sharp"));
let RendererService = class RendererService {
    /**
     * Convert SVG string to PNG buffer
     */
    async svgToPng(svg, width = 300) {
        return sharp(Buffer.from(svg))
            .resize(width, width)
            .png()
            .toBuffer();
    }
    /**
     * Add logo overlay to QR code image
     */
    async addLogoOverlay(qrBuffer, logoOptions, qrSize) {
        const logoSizePercent = logoOptions.size || 20;
        const logoSize = Math.floor((qrSize * logoSizePercent) / 100);
        const logoMargin = logoOptions.margin || 5;
        // Resize logo
        let logo = sharp(logoOptions.image).resize(logoSize - logoMargin * 2, logoSize - logoMargin * 2, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } });
        // Apply border radius if specified
        if (logoOptions.borderRadius && logoOptions.borderRadius > 0) {
            const roundedCorners = Buffer.from(`<svg><rect x="0" y="0" width="${logoSize - logoMargin * 2}" height="${logoSize - logoMargin * 2}" rx="${logoOptions.borderRadius}" ry="${logoOptions.borderRadius}"/></svg>`);
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
        const logoBackground = Buffer.from(`<svg width="${logoSize}" height="${logoSize}">
        <rect width="${logoSize}" height="${logoSize}" fill="${bgColor}" rx="${logoOptions.borderRadius || 0}"/>
      </svg>`);
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
    addLogoToSvg(svg, logoDataUrl, logoOptions, qrSize) {
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
    async optimizePng(buffer) {
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
    async generateSizes(svg, sizes) {
        const result = new Map();
        for (const size of sizes) {
            const buffer = await this.svgToPng(svg, size);
            result.set(size, buffer);
        }
        return result;
    }
};
exports.RendererService = RendererService;
exports.RendererService = RendererService = __decorate([
    (0, common_1.Injectable)()
], RendererService);

import { QRStyling, QRMatrix } from "./types";
export declare class StylerService {
    /**
     * Generate styled SVG from QR matrix
     */
    generateStyledSvg(matrix: QRMatrix, styling?: Partial<QRStyling>, size?: number): string;
    private generateBackground;
    private generateGradientDefs;
    private generateModules;
    private isFinderPattern;
    private generateModule;
    private generateCornerSquare;
    private generateCornerDot;
    private generateFrame;
}
//# sourceMappingURL=styler.service.d.ts.map
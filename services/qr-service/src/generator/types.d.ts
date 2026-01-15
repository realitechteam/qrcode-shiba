export interface QROptions {
    size?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    foregroundColor?: string;
    backgroundColor?: string;
}
export interface QRMatrix {
    size: number;
    data: boolean[][];
}
export interface QRStyling {
    foregroundColor: string;
    backgroundColor: string;
    gradientType?: "none" | "linear" | "radial";
    gradientColors?: string[];
    gradientDirection?: number;
    dotsStyle: "square" | "rounded" | "dots" | "classy" | "classy-rounded";
    cornersSquareStyle: "square" | "dot" | "extra-rounded";
    cornersDotStyle: "square" | "dot";
    frameStyle?: "none" | "basic" | "rounded";
    frameColor?: string;
    frameText?: string;
    frameTextColor?: string;
}
export interface LogoOptions {
    image: Buffer;
    size?: number;
    margin?: number;
    borderRadius?: number;
    backgroundColor?: string;
}
export interface QRGenerateInput {
    type: string;
    data: Record<string, any>;
    styling?: Partial<QRStyling>;
    logo?: LogoOptions;
    size?: number;
}
export interface QRGenerateOutput {
    dataUrl: string;
    svg?: string;
    shortCode: string;
}
export declare const DEFAULT_STYLING: QRStyling;
//# sourceMappingURL=types.d.ts.map
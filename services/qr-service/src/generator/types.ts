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
    // Colors
    foregroundColor: string;
    backgroundColor: string;
    gradientType?: "none" | "linear" | "radial";
    gradientColors?: string[];
    gradientDirection?: number; // degrees for linear gradient

    // Patterns
    dotsStyle: "square" | "rounded" | "dots" | "classy" | "classy-rounded";
    cornersSquareStyle: "square" | "dot" | "extra-rounded";
    cornersDotStyle: "square" | "dot";

    // Frame
    frameStyle?: "none" | "basic" | "rounded";
    frameColor?: string;
    frameText?: string;
    frameTextColor?: string;
}

export interface LogoOptions {
    image: Buffer;
    size?: number; // Percentage of QR size (0-50)
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

export const DEFAULT_STYLING: QRStyling = {
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    gradientType: "none",
    dotsStyle: "square",
    cornersSquareStyle: "square",
    cornersDotStyle: "square",
    frameStyle: "none",
};

export declare enum QRTypeEnum {
    URL = "URL",
    TEXT = "TEXT",
    VCARD = "VCARD",
    WIFI = "WIFI",
    EMAIL = "EMAIL",
    SMS = "SMS",
    PHONE = "PHONE",
    LOCATION = "LOCATION"
}
export declare class StylingDto {
    foregroundColor?: string;
    backgroundColor?: string;
    gradientType?: "none" | "linear" | "radial";
    gradientColors?: string[];
    gradientDirection?: number;
    dotsStyle?: "square" | "rounded" | "dots" | "classy" | "classy-rounded";
    cornersSquareStyle?: "square" | "dot" | "extra-rounded";
    cornersDotStyle?: "square" | "dot";
    frameStyle?: "none" | "basic" | "rounded";
    frameColor?: string;
    frameText?: string;
}
export declare class CreateQRDto {
    name?: string;
    type: QRTypeEnum;
    data: Record<string, any>;
    isDynamic?: boolean;
    styling?: StylingDto;
    folderId?: string;
}
export declare class UpdateQRDto {
    name?: string;
    data?: Record<string, any>;
    styling?: StylingDto;
    destinationUrl?: string;
    folderId?: string;
}
export declare class GeneratePreviewDto {
    type: QRTypeEnum;
    data: Record<string, any>;
    styling?: StylingDto;
    size?: number;
}
//# sourceMappingURL=qr.dto.d.ts.map
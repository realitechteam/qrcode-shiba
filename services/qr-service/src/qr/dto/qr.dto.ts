import {
    IsString,
    IsOptional,
    IsObject,
    IsBoolean,
    IsEnum,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export enum QRTypeEnum {
    URL = "URL",
    TEXT = "TEXT",
    VCARD = "VCARD",
    WIFI = "WIFI",
    EMAIL = "EMAIL",
    SMS = "SMS",
    PHONE = "PHONE",
    LOCATION = "LOCATION",
}

export class StylingDto {
    @IsOptional()
    @IsString()
    foregroundColor?: string;

    @IsOptional()
    @IsString()
    backgroundColor?: string;

    @IsOptional()
    @IsString()
    gradientType?: "none" | "linear" | "radial";

    @IsOptional()
    @IsString({ each: true })
    gradientColors?: string[];

    @IsOptional()
    gradientDirection?: number;

    @IsOptional()
    @IsString()
    dotsStyle?: "square" | "rounded" | "dots" | "classy" | "classy-rounded";

    @IsOptional()
    @IsString()
    cornersSquareStyle?: "square" | "dot" | "extra-rounded";

    @IsOptional()
    @IsString()
    cornersDotStyle?: "square" | "dot";

    @IsOptional()
    @IsString()
    frameStyle?: "none" | "basic" | "rounded";

    @IsOptional()
    @IsString()
    frameColor?: string;

    @IsOptional()
    @IsString()
    frameText?: string;
}

export class CreateQRDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsEnum(QRTypeEnum)
    type: QRTypeEnum;

    @IsObject()
    data: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    isDynamic?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => StylingDto)
    styling?: StylingDto;

    @IsOptional()
    @IsString()
    folderId?: string;
}

export class UpdateQRDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsObject()
    data?: Record<string, any>;

    @IsOptional()
    @ValidateNested()
    @Type(() => StylingDto)
    styling?: StylingDto;

    @IsOptional()
    @IsString()
    destinationUrl?: string;

    @IsOptional()
    @IsString()
    folderId?: string;
}

export class GeneratePreviewDto {
    @IsEnum(QRTypeEnum)
    type: QRTypeEnum;

    @IsObject()
    data: Record<string, any>;

    @IsOptional()
    @ValidateNested()
    @Type(() => StylingDto)
    styling?: StylingDto;

    @IsOptional()
    size?: number;
}

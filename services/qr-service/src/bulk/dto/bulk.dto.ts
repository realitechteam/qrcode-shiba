import {
    IsArray,
    IsString,
    IsOptional,
    ValidateNested,
    IsEnum,
    IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

export class BulkQRItemDto {
    @IsString()
    name: string;

    @IsEnum(["URL", "TEXT", "VCARD", "WIFI", "EMAIL", "SMS", "PHONE", "LOCATION"])
    type: string;

    @IsOptional()
    data?: Record<string, any>;

    @IsOptional()
    @IsString()
    url?: string; // Shortcut for URL type

    @IsOptional()
    @IsBoolean()
    isDynamic?: boolean;

    @IsOptional()
    @IsString()
    folderId?: string;
}

export class BulkCreateDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkQRItemDto)
    items: BulkQRItemDto[];

    @IsOptional()
    styling?: Record<string, any>;

    @IsOptional()
    @IsString()
    folderId?: string; // Default folder for all items
}

export class BulkJobResult {
    jobId: string;
    total: number;
    created: number;
    failed: number;
    errors: { index: number; error: string }[];
    qrCodes: { id: string; name: string; shortCode: string }[];
}

import { IsString, IsOptional, MinLength, MaxLength, Matches } from "class-validator";

export class CreateFolderDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    parentId?: string;

    @IsOptional()
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: "Color must be a valid hex color" })
    color?: string;
}

export class UpdateFolderDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    parentId?: string;

    @IsOptional()
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: "Color must be a valid hex color" })
    color?: string;
}

export class MoveQRToFolderDto {
    @IsOptional()
    @IsString()
    folderId?: string | null; // null to move to root
}

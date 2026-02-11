import { IsString, IsOptional, IsNumber, Min, Max, MaxLength, MinLength } from 'class-validator';

export class RegisterAffiliateDto {
    @IsOptional()
    @IsString()
    bankName?: string;

    @IsOptional()
    @IsString()
    bankAccount?: string;

    @IsOptional()
    @IsString()
    bankHolder?: string;
}

export class CreateLinkDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    referralCode?: string; // Custom code, auto-generated if not provided

    @IsOptional()
    @IsString()
    @MaxLength(50)
    label?: string; // e.g. "Facebook Campaign"

    @IsNumber()
    @Min(0)
    @Max(1)
    commissionRate: number; // e.g. 0.10 = 10% (what affiliate keeps)

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    discountRate?: number; // e.g. 0.10 = 10% (discount for referred user)
}

export class UpdateLinkDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    label?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    commissionRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    discountRate?: number;

    @IsOptional()
    isActive?: boolean;
}

export class UpdateBankInfoDto {
    @IsString()
    bankName: string;

    @IsString()
    bankAccount: string;

    @IsString()
    bankHolder: string;
}

export class RequestPayoutDto {
    @IsNumber()
    @Min(500000) // Minimum 500,000 VND
    amount: number;

    @IsOptional()
    @IsString()
    note?: string;
}

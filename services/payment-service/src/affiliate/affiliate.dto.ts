import { IsString, IsOptional, IsNumber, Min, MaxLength, MinLength } from 'class-validator';

export class RegisterAffiliateDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    referralCode?: string; // Custom code, auto-generated if not provided

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

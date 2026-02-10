import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Query,
    Headers,
    BadRequestException,
} from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { RegisterAffiliateDto, UpdateBankInfoDto, RequestPayoutDto } from './affiliate.dto';

@Controller('affiliate')
export class AffiliateController {
    constructor(private readonly affiliateService: AffiliateService) { }

    /**
     * Register as affiliate
     */
    @Post('register')
    async register(
        @Headers('x-user-id') userId: string,
        @Body() dto: RegisterAffiliateDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.register(userId, dto);
    }

    /**
     * Get affiliate dashboard
     */
    @Get('dashboard')
    async getDashboard(@Headers('x-user-id') userId: string) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getDashboard(userId);
    }

    /**
     * Get referrals list
     */
    @Get('referrals')
    async getReferrals(
        @Headers('x-user-id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getReferrals(
            userId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    /**
     * Get commissions list
     */
    @Get('commissions')
    async getCommissions(
        @Headers('x-user-id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getCommissions(
            userId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    /**
     * Get payout history
     */
    @Get('payouts')
    async getPayouts(
        @Headers('x-user-id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getPayouts(
            userId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    /**
     * Update bank information
     */
    @Patch('bank-info')
    async updateBankInfo(
        @Headers('x-user-id') userId: string,
        @Body() dto: UpdateBankInfoDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.updateBankInfo(userId, dto);
    }

    /**
     * Request a payout
     */
    @Post('payout')
    async requestPayout(
        @Headers('x-user-id') userId: string,
        @Body() dto: RequestPayoutDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.requestPayout(userId, dto);
    }

    /**
     * Validate referral code (public endpoint)
     */
    @Get('validate-code')
    async validateCode(@Query('code') code: string) {
        if (!code) throw new BadRequestException('Code required');
        const affiliate = await this.affiliateService.getAffiliateByCode(code);
        return { valid: !!affiliate };
    }

    /**
     * Track a referral (called internally when a user registers with a referral code)
     */
    @Post('track-referral')
    async trackReferral(
        @Body() body: { referralCode: string; referredUserId: string },
    ) {
        await this.affiliateService.trackReferral(body.referralCode, body.referredUserId);
        return { success: true };
    }

    /**
     * Process commission (called internally when an order is completed)
     */
    @Post('process-commission')
    async processCommission(
        @Body() body: { orderId: string; userId: string; amount: number },
    ) {
        await this.affiliateService.processCommission(body.orderId, body.userId, body.amount);
        return { success: true };
    }
}

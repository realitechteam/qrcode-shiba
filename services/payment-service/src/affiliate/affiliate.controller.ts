import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Headers,
    BadRequestException,
} from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { RegisterAffiliateDto, CreateLinkDto, UpdateLinkDto, UpdateBankInfoDto, RequestPayoutDto } from './affiliate.dto';

@Controller('affiliate')
export class AffiliateController {
    constructor(private readonly affiliateService: AffiliateService) { }

    // ==========================================
    // REGISTRATION
    // ==========================================

    @Post('register')
    async register(
        @Headers('x-user-id') userId: string,
        @Body() dto: RegisterAffiliateDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.register(userId, dto);
    }

    // ==========================================
    // LINKS MANAGEMENT
    // ==========================================

    @Post('links')
    async createLink(
        @Headers('x-user-id') userId: string,
        @Body() dto: CreateLinkDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.createLink(userId, dto);
    }

    @Get('links')
    async getLinks(@Headers('x-user-id') userId: string) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getLinks(userId);
    }

    @Patch('links/:id')
    async updateLink(
        @Headers('x-user-id') userId: string,
        @Param('id') linkId: string,
        @Body() dto: UpdateLinkDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.updateLink(userId, linkId, dto);
    }

    @Delete('links/:id')
    async deleteLink(
        @Headers('x-user-id') userId: string,
        @Param('id') linkId: string,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.deleteLink(userId, linkId);
    }

    // ==========================================
    // DASHBOARD & DATA
    // ==========================================

    @Get('dashboard')
    async getDashboard(@Headers('x-user-id') userId: string) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getDashboard(userId);
    }

    @Get('referrals')
    async getReferrals(
        @Headers('x-user-id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getReferrals(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }

    @Get('commissions')
    async getCommissions(
        @Headers('x-user-id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getCommissions(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }

    @Get('payouts')
    async getPayouts(
        @Headers('x-user-id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.getPayouts(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }

    // ==========================================
    // BANK INFO & PAYOUT
    // ==========================================

    @Patch('bank-info')
    async updateBankInfo(
        @Headers('x-user-id') userId: string,
        @Body() dto: UpdateBankInfoDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.updateBankInfo(userId, dto);
    }

    @Post('payout')
    async requestPayout(
        @Headers('x-user-id') userId: string,
        @Body() dto: RequestPayoutDto,
    ) {
        if (!userId) throw new BadRequestException('User ID required');
        return this.affiliateService.requestPayout(userId, dto);
    }

    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * Get discount info for a referral code (used during checkout)
     */
    @Get('discount/:code')
    async getDiscount(@Param('code') code: string) {
        return this.affiliateService.getDiscountForCode(code);
    }

    /**
     * Validate referral code & get basic info
     */
    @Get('validate-code')
    async validateCode(@Query('code') code: string) {
        if (!code) throw new BadRequestException('Code required');
        const result = await this.affiliateService.getDiscountForCode(code);
        return { valid: result.valid, discountRate: result.discountRate };
    }

    /**
     * Track a referral (called by frontend after user signup)
     */
    @Post('track-referral')
    async trackReferral(
        @Body() body: { referralCode: string; referredUserId: string },
    ) {
        await this.affiliateService.trackReferral(body.referralCode, body.referredUserId);
        return { success: true };
    }

    /**
     * Track a click (called by /ref/[code] page)
     */
    @Post('track-click')
    async trackClick(@Body() body: { referralCode: string }) {
        await this.affiliateService.trackClick(body.referralCode);
        return { success: true };
    }

    /**
     * Process commission (called when an order is completed)
     */
    @Post('process-commission')
    async processCommission(
        @Body() body: { orderId: string; userId: string; amount: number },
    ) {
        await this.affiliateService.processCommission(body.orderId, body.userId, body.amount);
        return { success: true };
    }
}

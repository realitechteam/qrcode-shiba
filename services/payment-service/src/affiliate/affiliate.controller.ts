import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { RegisterAffiliateDto, CreateLinkDto, UpdateLinkDto, UpdateBankInfoDto, RequestPayoutDto } from './affiliate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('affiliate')
export class AffiliateController {
    constructor(private readonly affiliateService: AffiliateService) { }

    // ==========================================
    // REGISTRATION (authenticated)
    // ==========================================

    @Post('register')
    @UseGuards(JwtAuthGuard)
    async register(
        @CurrentUser('id') userId: string,
        @Body() dto: RegisterAffiliateDto,
    ) {
        return this.affiliateService.register(userId, dto);
    }

    // ==========================================
    // LINKS MANAGEMENT (authenticated)
    // ==========================================

    @Post('links')
    @UseGuards(JwtAuthGuard)
    async createLink(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateLinkDto,
    ) {
        return this.affiliateService.createLink(userId, dto);
    }

    @Get('links')
    @UseGuards(JwtAuthGuard)
    async getLinks(@CurrentUser('id') userId: string) {
        return this.affiliateService.getLinks(userId);
    }

    @Patch('links/:id')
    @UseGuards(JwtAuthGuard)
    async updateLink(
        @CurrentUser('id') userId: string,
        @Param('id') linkId: string,
        @Body() dto: UpdateLinkDto,
    ) {
        return this.affiliateService.updateLink(userId, linkId, dto);
    }

    @Delete('links/:id')
    @UseGuards(JwtAuthGuard)
    async deleteLink(
        @CurrentUser('id') userId: string,
        @Param('id') linkId: string,
    ) {
        return this.affiliateService.deleteLink(userId, linkId);
    }

    // ==========================================
    // DASHBOARD & DATA (authenticated)
    // ==========================================

    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    async getDashboard(@CurrentUser('id') userId: string) {
        return this.affiliateService.getDashboard(userId);
    }

    @Get('referrals')
    @UseGuards(JwtAuthGuard)
    async getReferrals(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.affiliateService.getReferrals(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }

    @Get('commissions')
    @UseGuards(JwtAuthGuard)
    async getCommissions(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.affiliateService.getCommissions(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }

    @Get('payouts')
    @UseGuards(JwtAuthGuard)
    async getPayouts(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.affiliateService.getPayouts(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }

    // ==========================================
    // BANK INFO & PAYOUT (authenticated)
    // ==========================================

    @Patch('bank-info')
    @UseGuards(JwtAuthGuard)
    async updateBankInfo(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateBankInfoDto,
    ) {
        return this.affiliateService.updateBankInfo(userId, dto);
    }

    @Post('payout')
    @UseGuards(JwtAuthGuard)
    async requestPayout(
        @CurrentUser('id') userId: string,
        @Body() dto: RequestPayoutDto,
    ) {
        return this.affiliateService.requestPayout(userId, dto);
    }

    // ==========================================
    // PUBLIC ENDPOINTS (no auth required)
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
        if (!body.referralCode || !body.referredUserId) {
            throw new BadRequestException('referralCode and referredUserId are required');
        }
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
     * Process commission (admin-only, called when an order is completed)
     */
    @Post('process-commission')
    @UseGuards(JwtAuthGuard)
    async processCommission(
        @CurrentUser() user: any,
        @Body() body: { orderId: string; userId: string; amount: number },
    ) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        await this.affiliateService.processCommission(body.orderId, body.userId, body.amount);
        return { success: true };
    }
}

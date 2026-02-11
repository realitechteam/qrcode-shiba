import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAffiliateDto, CreateLinkDto, UpdateLinkDto, UpdateBankInfoDto, RequestPayoutDto } from './affiliate.dto';
import { randomUUID } from 'crypto';

function generateCode(length = 8): string {
    return randomUUID().replace(/-/g, '').slice(0, length).toUpperCase();
}

const MIN_PAYOUT_AMOUNT = 500_000; // 500,000 VND
const DEFAULT_TOTAL_RATE = 0.20; // 20%

@Injectable()
export class AffiliateService {
    private readonly logger = new Logger(AffiliateService.name);

    constructor(private readonly prisma: PrismaService) { }

    // =============================================
    // CONFIG
    // =============================================

    /**
     * Get the global affiliate total rate from SystemConfig
     */
    private async getTotalRate(): Promise<number> {
        try {
            const config = await this.prisma.systemConfig.findUnique({
                where: { key: 'affiliate_total_rate' },
            });
            return config ? parseFloat(config.value) : DEFAULT_TOTAL_RATE;
        } catch {
            return DEFAULT_TOTAL_RATE;
        }
    }

    // =============================================
    // REGISTRATION
    // =============================================

    /**
     * Register as affiliate
     */
    async register(userId: string, dto: RegisterAffiliateDto) {
        const existing = await this.prisma.affiliateAccount.findUnique({
            where: { userId },
        });

        if (existing) {
            throw new ConflictException('Bạn đã đăng ký Affiliate rồi');
        }

        const affiliate = await this.prisma.affiliateAccount.create({
            data: {
                userId,
                bankName: dto.bankName,
                bankAccount: dto.bankAccount,
                bankHolder: dto.bankHolder,
            },
        });

        return {
            id: affiliate.id,
            status: affiliate.status,
        };
    }

    // =============================================
    // LINKS MANAGEMENT
    // =============================================

    /**
     * Create a new referral link
     */
    async createLink(userId: string, dto: CreateLinkDto) {
        const affiliate = await this.getAffiliateOrThrow(userId);
        const totalRate = await this.getTotalRate();

        const discountRate = dto.discountRate || 0;

        // Validate: commissionRate + discountRate <= totalRate
        if (dto.commissionRate + discountRate > totalRate + 0.001) {
            throw new BadRequestException(
                `Tổng hoa hồng + giảm giá (${((dto.commissionRate + discountRate) * 100).toFixed(0)}%) không được vượt quá ${(totalRate * 100).toFixed(0)}%`
            );
        }

        // Generate or validate referral code
        let referralCode = dto.referralCode?.toUpperCase().replace(/\s/g, '') || generateCode(8);

        // Check uniqueness
        const codeExists = await this.prisma.affiliateLink.findUnique({
            where: { referralCode },
        });
        if (codeExists) {
            if (dto.referralCode) {
                throw new ConflictException('Mã giới thiệu này đã được sử dụng');
            }
            referralCode = generateCode(8);
        }

        const link = await this.prisma.affiliateLink.create({
            data: {
                affiliateId: affiliate.id,
                referralCode,
                label: dto.label,
                commissionRate: dto.commissionRate,
                discountRate,
            },
        });

        return {
            id: link.id,
            referralCode: link.referralCode,
            label: link.label,
            commissionRate: link.commissionRate,
            discountRate: link.discountRate,
            referralLink: `https://shiba.pw/ref/${link.referralCode}`,
        };
    }

    /**
     * Get all links for an affiliate
     */
    async getLinks(userId: string) {
        const affiliate = await this.getAffiliateOrThrow(userId);

        const links = await this.prisma.affiliateLink.findMany({
            where: { affiliateId: affiliate.id },
            orderBy: { createdAt: 'desc' },
        });

        return links.map(l => ({
            id: l.id,
            referralCode: l.referralCode,
            label: l.label,
            commissionRate: l.commissionRate,
            discountRate: l.discountRate,
            clickCount: l.clickCount,
            referralCount: l.referralCount,
            isActive: l.isActive,
            referralLink: `https://shiba.pw/ref/${l.referralCode}`,
            createdAt: l.createdAt,
        }));
    }

    /**
     * Update a link
     */
    async updateLink(userId: string, linkId: string, dto: UpdateLinkDto) {
        const affiliate = await this.getAffiliateOrThrow(userId);

        const link = await this.prisma.affiliateLink.findFirst({
            where: { id: linkId, affiliateId: affiliate.id },
        });

        if (!link) {
            throw new NotFoundException('Link không tồn tại');
        }

        // Validate rates if changed
        if (dto.commissionRate !== undefined || dto.discountRate !== undefined) {
            const totalRate = await this.getTotalRate();
            const newCommission = dto.commissionRate ?? link.commissionRate;
            const newDiscount = dto.discountRate ?? link.discountRate;

            if (newCommission + newDiscount > totalRate + 0.001) {
                throw new BadRequestException(
                    `Tổng hoa hồng + giảm giá không được vượt quá ${(totalRate * 100).toFixed(0)}%`
                );
            }
        }

        const updated = await this.prisma.affiliateLink.update({
            where: { id: linkId },
            data: {
                label: dto.label,
                commissionRate: dto.commissionRate,
                discountRate: dto.discountRate,
                isActive: dto.isActive,
            },
        });

        return {
            id: updated.id,
            referralCode: updated.referralCode,
            label: updated.label,
            commissionRate: updated.commissionRate,
            discountRate: updated.discountRate,
            isActive: updated.isActive,
        };
    }

    /**
     * Delete (deactivate) a link
     */
    async deleteLink(userId: string, linkId: string) {
        const affiliate = await this.getAffiliateOrThrow(userId);

        const link = await this.prisma.affiliateLink.findFirst({
            where: { id: linkId, affiliateId: affiliate.id },
        });

        if (!link) {
            throw new NotFoundException('Link không tồn tại');
        }

        await this.prisma.affiliateLink.update({
            where: { id: linkId },
            data: { isActive: false },
        });

        return { success: true };
    }

    // =============================================
    // DASHBOARD
    // =============================================

    /**
     * Get affiliate dashboard data
     */
    async getDashboard(userId: string) {
        const affiliate = await this.prisma.affiliateAccount.findUnique({
            where: { userId },
            include: {
                links: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        referralCode: true,
                        label: true,
                        commissionRate: true,
                        discountRate: true,
                        clickCount: true,
                        referralCount: true,
                    },
                },
                _count: {
                    select: {
                        referrals: true,
                        commissions: true,
                    },
                },
            },
        });

        if (!affiliate) {
            throw new NotFoundException('Bạn chưa đăng ký Affiliate');
        }

        const convertedCount = await this.prisma.affiliateReferral.count({
            where: {
                affiliateId: affiliate.id,
                status: 'CONVERTED',
            },
        });

        const totalRate = await this.getTotalRate();

        const conversionRate = affiliate._count.referrals > 0
            ? (convertedCount / affiliate._count.referrals * 100).toFixed(1)
            : '0.0';

        return {
            totalRate,
            totalEarnings: affiliate.totalEarnings,
            pendingBalance: affiliate.pendingBalance,
            paidBalance: affiliate.paidBalance,
            totalReferrals: affiliate._count.referrals,
            convertedReferrals: convertedCount,
            conversionRate: `${conversionRate}%`,
            totalCommissions: affiliate._count.commissions,
            status: affiliate.status,
            links: affiliate.links.map(l => ({
                ...l,
                referralLink: `https://shiba.pw/ref/${l.referralCode}`,
            })),
            bankInfo: {
                bankName: affiliate.bankName,
                bankAccount: affiliate.bankAccount,
                bankHolder: affiliate.bankHolder,
            },
        };
    }

    // =============================================
    // REFERRALS, COMMISSIONS, PAYOUTS
    // =============================================

    async getReferrals(userId: string, page = 1, limit = 20) {
        const affiliate = await this.getAffiliateOrThrow(userId);
        const skip = (page - 1) * limit;

        const [total, referrals] = await Promise.all([
            this.prisma.affiliateReferral.count({
                where: { affiliateId: affiliate.id },
            }),
            this.prisma.affiliateReferral.findMany({
                where: { affiliateId: affiliate.id },
                include: {
                    link: {
                        select: { referralCode: true, label: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { items: referrals, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getCommissions(userId: string, page = 1, limit = 20) {
        const affiliate = await this.getAffiliateOrThrow(userId);
        const skip = (page - 1) * limit;

        const [total, commissions] = await Promise.all([
            this.prisma.affiliateCommission.count({
                where: { affiliateId: affiliate.id },
            }),
            this.prisma.affiliateCommission.findMany({
                where: { affiliateId: affiliate.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { items: commissions, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async updateBankInfo(userId: string, dto: UpdateBankInfoDto) {
        const affiliate = await this.getAffiliateOrThrow(userId);

        const updated = await this.prisma.affiliateAccount.update({
            where: { id: affiliate.id },
            data: {
                bankName: dto.bankName,
                bankAccount: dto.bankAccount,
                bankHolder: dto.bankHolder,
            },
        });

        return {
            bankName: updated.bankName,
            bankAccount: updated.bankAccount,
            bankHolder: updated.bankHolder,
        };
    }

    async requestPayout(userId: string, dto: RequestPayoutDto) {
        const affiliate = await this.getAffiliateOrThrow(userId);

        if (affiliate.pendingBalance < MIN_PAYOUT_AMOUNT) {
            throw new BadRequestException(
                `Số dư tối thiểu để rút là ${MIN_PAYOUT_AMOUNT.toLocaleString('vi-VN')} VND`
            );
        }

        if (dto.amount > affiliate.pendingBalance) {
            throw new BadRequestException('Số tiền rút vượt quá số dư khả dụng');
        }

        if (!affiliate.bankName || !affiliate.bankAccount || !affiliate.bankHolder) {
            throw new BadRequestException('Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền');
        }

        const [payout] = await this.prisma.$transaction([
            this.prisma.affiliatePayout.create({
                data: {
                    affiliateId: affiliate.id,
                    amount: dto.amount,
                    method: 'BANK_TRANSFER',
                    note: dto.note,
                },
            }),
            this.prisma.affiliateAccount.update({
                where: { id: affiliate.id },
                data: {
                    pendingBalance: { decrement: dto.amount },
                },
            }),
        ]);

        return payout;
    }

    async getPayouts(userId: string, page = 1, limit = 20) {
        const affiliate = await this.getAffiliateOrThrow(userId);
        const skip = (page - 1) * limit;

        const [total, payouts] = await Promise.all([
            this.prisma.affiliatePayout.count({
                where: { affiliateId: affiliate.id },
            }),
            this.prisma.affiliatePayout.findMany({
                where: { affiliateId: affiliate.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { items: payouts, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // =============================================
    // INTERNAL METHODS (called by payment webhooks)
    // =============================================

    /**
     * Track referral when a new user registers with a referral code
     */
    async trackReferral(referralCode: string, referredUserId: string) {
        try {
            // Find the link by referralCode
            const link = await this.prisma.affiliateLink.findUnique({
                where: { referralCode },
                include: { affiliate: true },
            });

            if (!link || !link.isActive || link.affiliate.status !== 'ACTIVE') {
                this.logger.warn(`Invalid or inactive referral code: ${referralCode}`);
                return;
            }

            // Don't allow self-referral
            if (link.affiliate.userId === referredUserId) {
                this.logger.warn(`Self-referral attempt: ${referralCode}`);
                return;
            }

            await this.prisma.$transaction([
                this.prisma.affiliateReferral.create({
                    data: {
                        affiliateId: link.affiliate.id,
                        linkId: link.id,
                        referredUserId,
                        status: 'REGISTERED',
                    },
                }),
                // Increment link stats
                this.prisma.affiliateLink.update({
                    where: { id: link.id },
                    data: { referralCount: { increment: 1 } },
                }),
            ]);

            this.logger.log(`Referral tracked: ${referralCode} -> ${referredUserId}`);
        } catch (error) {
            if ((error as any)?.code === 'P2002') {
                this.logger.warn(`Referral already tracked for user ${referredUserId}`);
                return;
            }
            this.logger.error('Failed to track referral:', error);
        }
    }

    /**
     * Calculate and record commission when an order is completed.
     * Uses the per-link commissionRate.
     */
    async processCommission(orderId: string, userId: string, amount: number) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { referredBy: true },
            });

            if (!user?.referredBy) return;

            // Find the link that referred this user
            const link = await this.prisma.affiliateLink.findUnique({
                where: { referralCode: user.referredBy },
                include: { affiliate: true },
            });

            if (!link || link.affiliate.status !== 'ACTIVE') return;

            const commissionAmount = Math.floor(amount * link.commissionRate);

            await this.prisma.$transaction([
                this.prisma.affiliateCommission.create({
                    data: {
                        affiliateId: link.affiliate.id,
                        orderId,
                        amount: commissionAmount,
                        rate: link.commissionRate,
                        status: 'PENDING',
                    },
                }),
                this.prisma.affiliateAccount.update({
                    where: { id: link.affiliate.id },
                    data: {
                        totalEarnings: { increment: commissionAmount },
                        pendingBalance: { increment: commissionAmount },
                    },
                }),
                this.prisma.affiliateReferral.updateMany({
                    where: {
                        affiliateId: link.affiliate.id,
                        referredUserId: userId,
                        status: 'REGISTERED',
                    },
                    data: {
                        status: 'CONVERTED',
                        convertedAt: new Date(),
                    },
                }),
            ]);

            this.logger.log(
                `Commission: ${commissionAmount} VND for affiliate (link: ${link.referralCode}, order: ${orderId})`
            );
        } catch (error) {
            this.logger.error(`Failed to process commission for order ${orderId}:`, error);
        }
    }

    /**
     * Get discount rate for a referral code (used during checkout)
     */
    async getDiscountForCode(code: string) {
        const link = await this.prisma.affiliateLink.findUnique({
            where: { referralCode: code, isActive: true },
            select: {
                discountRate: true,
                referralCode: true,
                affiliate: {
                    select: { status: true },
                },
            },
        });

        if (!link || link.affiliate.status !== 'ACTIVE') {
            return { valid: false, discountRate: 0 };
        }

        return {
            valid: true,
            discountRate: link.discountRate,
            referralCode: link.referralCode,
        };
    }

    /**
     * Track link click (increment clickCount)
     */
    async trackClick(referralCode: string) {
        try {
            await this.prisma.affiliateLink.update({
                where: { referralCode },
                data: { clickCount: { increment: 1 } },
            });
        } catch {
            // ignore if link not found
        }
    }

    // =============================================
    // HELPERS
    // =============================================

    private async getAffiliateOrThrow(userId: string) {
        const affiliate = await this.prisma.affiliateAccount.findUnique({
            where: { userId },
        });

        if (!affiliate) {
            throw new NotFoundException('Bạn chưa đăng ký Affiliate');
        }

        return affiliate;
    }
}

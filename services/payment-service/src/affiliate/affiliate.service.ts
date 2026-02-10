import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAffiliateDto, UpdateBankInfoDto, RequestPayoutDto } from './affiliate.dto';
import { randomUUID } from 'crypto';

function generateCode(length = 8): string {
    return randomUUID().replace(/-/g, '').slice(0, length).toUpperCase();
}

const MIN_PAYOUT_AMOUNT = 500_000; // 500,000 VND

@Injectable()
export class AffiliateService {
    private readonly logger = new Logger(AffiliateService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Register as affiliate
     */
    async register(userId: string, dto: RegisterAffiliateDto) {
        // Check if already registered
        const existing = await this.prisma.affiliateAccount.findUnique({
            where: { userId },
        });

        if (existing) {
            throw new ConflictException('Bạn đã đăng ký Affiliate rồi');
        }

        // Generate or validate referral code
        let referralCode = dto.referralCode?.toUpperCase().replace(/\s/g, '') || generateCode(8);

        // Check uniqueness
        const codeExists = await this.prisma.affiliateAccount.findUnique({
            where: { referralCode },
        });
        if (codeExists) {
            referralCode = generateCode(8);
        }

        const affiliate = await this.prisma.affiliateAccount.create({
            data: {
                userId,
                referralCode,
                bankName: dto.bankName,
                bankAccount: dto.bankAccount,
                bankHolder: dto.bankHolder,
            },
        });

        return {
            id: affiliate.id,
            referralCode: affiliate.referralCode,
            commissionRate: affiliate.commissionRate,
            status: affiliate.status,
            referralLink: `https://shiba.pw/ref/${affiliate.referralCode}`,
        };
    }

    /**
     * Get affiliate dashboard data
     */
    async getDashboard(userId: string) {
        const affiliate = await this.prisma.affiliateAccount.findUnique({
            where: { userId },
            include: {
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

        // Count converted referrals
        const convertedCount = await this.prisma.affiliateReferral.count({
            where: {
                affiliateId: affiliate.id,
                status: 'CONVERTED',
            },
        });

        const conversionRate = affiliate._count.referrals > 0
            ? (convertedCount / affiliate._count.referrals * 100).toFixed(1)
            : '0.0';

        return {
            referralCode: affiliate.referralCode,
            referralLink: `https://shiba.pw/ref/${affiliate.referralCode}`,
            commissionRate: affiliate.commissionRate,
            totalEarnings: affiliate.totalEarnings,
            pendingBalance: affiliate.pendingBalance,
            paidBalance: affiliate.paidBalance,
            totalReferrals: affiliate._count.referrals,
            convertedReferrals: convertedCount,
            conversionRate: `${conversionRate}%`,
            totalCommissions: affiliate._count.commissions,
            status: affiliate.status,
            bankInfo: {
                bankName: affiliate.bankName,
                bankAccount: affiliate.bankAccount,
                bankHolder: affiliate.bankHolder,
            },
        };
    }

    /**
     * Get referrals list
     */
    async getReferrals(userId: string, page = 1, limit = 20) {
        const affiliate = await this.getAffiliateOrThrow(userId);
        const skip = (page - 1) * limit;

        const [total, referrals] = await Promise.all([
            this.prisma.affiliateReferral.count({
                where: { affiliateId: affiliate.id },
            }),
            this.prisma.affiliateReferral.findMany({
                where: { affiliateId: affiliate.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return {
            items: referrals,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get commissions list
     */
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

        return {
            items: commissions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Update bank information
     */
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

    /**
     * Request payout
     */
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

        // Create payout request and deduct from pending balance
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

    /**
     * Get payout history
     */
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

        return {
            items: payouts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // =============================================
    // INTERNAL METHODS (called by payment webhooks)
    // =============================================

    /**
     * Track referral when a new user registers with a referral code
     */
    async trackReferral(referralCode: string, referredUserId: string) {
        try {
            const affiliate = await this.prisma.affiliateAccount.findUnique({
                where: { referralCode },
            });

            if (!affiliate || affiliate.status !== 'ACTIVE') {
                this.logger.warn(`Invalid or inactive referral code: ${referralCode}`);
                return;
            }

            // Don't allow self-referral
            if (affiliate.userId === referredUserId) {
                this.logger.warn(`Self-referral attempt: ${referralCode}`);
                return;
            }

            await this.prisma.affiliateReferral.create({
                data: {
                    affiliateId: affiliate.id,
                    referredUserId,
                    status: 'REGISTERED',
                },
            });

            this.logger.log(`Referral tracked: ${referralCode} -> ${referredUserId}`);
        } catch (error) {
            // Unique constraint violation = already tracked
            if ((error as any)?.code === 'P2002') {
                this.logger.warn(`Referral already tracked for user ${referredUserId}`);
                return;
            }
            this.logger.error('Failed to track referral:', error);
        }
    }

    /**
     * Calculate and record commission when an order is completed
     */
    async processCommission(orderId: string, userId: string, amount: number) {
        try {
            // Find if this user was referred
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { referredBy: true },
            });

            if (!user?.referredBy) return;

            const affiliate = await this.prisma.affiliateAccount.findUnique({
                where: { referralCode: user.referredBy },
            });

            if (!affiliate || affiliate.status !== 'ACTIVE') return;

            const commissionAmount = Math.floor(amount * affiliate.commissionRate);

            // Record commission and update balances in a transaction
            await this.prisma.$transaction([
                this.prisma.affiliateCommission.create({
                    data: {
                        affiliateId: affiliate.id,
                        orderId,
                        amount: commissionAmount,
                        rate: affiliate.commissionRate,
                        status: 'PENDING',
                    },
                }),
                this.prisma.affiliateAccount.update({
                    where: { id: affiliate.id },
                    data: {
                        totalEarnings: { increment: commissionAmount },
                        pendingBalance: { increment: commissionAmount },
                    },
                }),
                // Mark referral as CONVERTED
                this.prisma.affiliateReferral.updateMany({
                    where: {
                        affiliateId: affiliate.id,
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
                `Commission recorded: ${commissionAmount} VND for affiliate ${affiliate.referralCode} (order: ${orderId})`
            );
        } catch (error) {
            this.logger.error(`Failed to process commission for order ${orderId}:`, error);
        }
    }

    /**
     * Get affiliate status for a user (used by auth-service during registration)
     */
    async getAffiliateByCode(code: string) {
        return this.prisma.affiliateAccount.findUnique({
            where: { referralCode: code, status: 'ACTIVE' },
            select: { id: true, referralCode: true, userId: true },
        });
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

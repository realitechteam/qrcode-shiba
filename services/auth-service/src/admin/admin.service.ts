import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    // ==========================================
    // DASHBOARD STATS
    // ==========================================

    async getStats() {
        const [
            totalUsers,
            totalQRCodes,
            totalScans,
            totalOrders,
            totalRevenue,
            activeSubscriptions,
            totalAffiliates,
            pendingPayouts,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.qRCode.count(),
            this.prisma.scan.count(),
            this.prisma.order.count(),
            this.prisma.order.aggregate({
                _sum: { amount: true },
                where: { status: "COMPLETED" },
            }),
            this.prisma.subscription.count({
                where: { status: "ACTIVE" },
            }),
            this.prisma.affiliateAccount.count(),
            this.prisma.affiliatePayout.count({
                where: { status: "PENDING" },
            }),
        ]);

        // Monthly growth
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [newUsersThisMonth, newOrdersThisMonth, revenueThisMonth] =
            await Promise.all([
                this.prisma.user.count({
                    where: { createdAt: { gte: thirtyDaysAgo } },
                }),
                this.prisma.order.count({
                    where: {
                        createdAt: { gte: thirtyDaysAgo },
                        status: "COMPLETED",
                    },
                }),
                this.prisma.order.aggregate({
                    _sum: { amount: true },
                    where: {
                        createdAt: { gte: thirtyDaysAgo },
                        status: "COMPLETED",
                    },
                }),
            ]);

        return {
            totalUsers,
            totalQRCodes,
            totalScans,
            totalOrders,
            totalRevenue: totalRevenue._sum.amount || 0,
            activeSubscriptions,
            totalAffiliates,
            pendingPayouts,
            monthly: {
                newUsers: newUsersThisMonth,
                newOrders: newOrdersThisMonth,
                revenue: revenueThisMonth._sum.amount || 0,
            },
        };
    }

    // ==========================================
    // USERS
    // ==========================================

    async getUsers(page = 1, limit = 20, search?: string, tier?: string) {
        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
            ];
        }
        if (tier) {
            where.tier = tier;
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                    authProvider: true,
                    emailVerified: true,
                    role: true,
                    tier: true,
                    referredBy: true,
                    createdAt: true,
                    _count: {
                        select: { qrCodes: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateUser(
        userId: string,
        data: { tier?: string; role?: string; name?: string }
    ) {
        return this.prisma.user.update({
            where: { id: userId },
            data: data as any,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tier: true,
                bannedAt: true,
            },
        });
    }

    async updateUser(id: string, data: { tier?: string; role?: "USER" | "ADMIN" }) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async banUser(id: string) {
        // Prevent banning other admins
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (user?.role === "ADMIN") {
            throw new Error("Cannot ban an admin");
        }

        return this.prisma.user.update({
            where: { id },
            data: { bannedAt: new Date() },
        });
    }

    async unbanUser(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { bannedAt: null },
        });
    }

    // ==========================================
    // ORDERS
    // ==========================================

    async getOrders(page = 1, limit = 20, status?: string): Promise<{ orders: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    paymentProvider: true,
                    planId: true,
                    createdAt: true,
                    user: {
                        select: { email: true, name: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ==========================================
    // QR CODES
    // ==========================================

    async getQRCodes(page = 1, limit = 20, userId?: string, type?: string): Promise<{ qrCodes: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
        const where: any = {};
        if (userId) where.userId = userId;
        if (type) where.type = type;

        const [qrCodes, total] = await Promise.all([
            this.prisma.qRCode.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    type: true,
                    destinationUrl: true,
                    shortCode: true,
                    createdAt: true,
                    user: {
                        select: { email: true, name: true },
                    },
                    _count: {
                        select: { scans: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.qRCode.count({ where }),
        ]);

        return {
            qrCodes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ==========================================
    // AFFILIATES
    // ==========================================

    async getAffiliates(page = 1, limit = 20) {
        const [affiliates, total] = await Promise.all([
            this.prisma.affiliateAccount.findMany({
                include: {
                    user: {
                        select: { email: true, name: true },
                    },
                    links: {
                        select: {
                            id: true,
                            referralCode: true,
                            label: true,
                            commissionRate: true,
                            discountRate: true,
                            clickCount: true,
                            referralCount: true,
                            isActive: true,
                        },
                    },
                    _count: {
                        select: {
                            referrals: true,
                            commissions: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.affiliateAccount.count(),
        ]);

        return {
            affiliates,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getPendingPayouts(page = 1, limit = 20) {
        const [payouts, total] = await Promise.all([
            this.prisma.affiliatePayout.findMany({
                where: { status: "PENDING" },
                include: {
                    affiliate: {
                        include: {
                            user: {
                                select: { email: true, name: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.affiliatePayout.count({
                where: { status: "PENDING" },
            }),
        ]);

        return {
            payouts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updatePayoutStatus(
        payoutId: string,
        status: "PROCESSING" | "COMPLETED" | "FAILED",
        note?: string
    ) {
        const payout = await this.prisma.affiliatePayout.update({
            where: { id: payoutId },
            data: {
                status,
                processedAt: status === "COMPLETED" ? new Date() : undefined,
                note,
            },
            include: {
                affiliate: true,
            },
        });

        // If completed, move from pendingBalance to paidBalance
        if (status === "COMPLETED") {
            await this.prisma.affiliateAccount.update({
                where: { id: payout.affiliateId },
                data: {
                    pendingBalance: { decrement: payout.amount },
                    paidBalance: { increment: payout.amount },
                },
            });
        }

        // If failed, refund to pendingBalance (it was already deducted when payout was requested)
        if (status === "FAILED") {
            await this.prisma.affiliateAccount.update({
                where: { id: payout.affiliateId },
                data: {
                    pendingBalance: { increment: payout.amount },
                },
            });
        }

        return payout;
    }

    // ==========================================
    // SYSTEM CONFIG
    // ==========================================

    async getConfig() {
        const configs = await this.prisma.systemConfig.findMany();
        const configMap: Record<string, string> = {};
        for (const c of configs) {
            configMap[c.key] = c.value;
        }
        return configMap;
    }

    async updateConfig(key: string, value: string) {
        return this.prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
}

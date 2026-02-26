import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    // ==========================================
    // DASHBOARD STATS
    // ==========================================

    async getStats(startDate?: Date, endDate?: Date) {
        const now = new Date();
        const dateFilter = startDate && endDate ? { gte: startDate, lte: endDate } : undefined;
        const dateWhere = dateFilter ? { createdAt: dateFilter } : {};
        const scanWhere = dateFilter ? { scannedAt: dateFilter } : {};

        // ==========================================
        // SECTION 1: WEBSITE OVERVIEW
        // ==========================================
        const [totalUsers, totalQRCodes, activeSubscriptions] = await Promise.all([
            this.prisma.user.count({ where: dateWhere }),
            this.prisma.qRCode.count({ where: dateWhere }),
            this.prisma.subscription.count({ where: { status: "ACTIVE" } }),
        ]);

        // ==========================================
        // SECTION 2: REVENUE (only COMPLETED orders, by createdAt)
        // ==========================================
        const completedFilter = { status: "COMPLETED" as const, ...dateWhere };

        // Total revenue
        const totalRevenueAgg = await this.prisma.order.aggregate({
            _sum: { amount: true },
            _count: true,
            where: completedFilter,
        });

        // Revenue today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        const revenueTodayAgg = await this.prisma.order.aggregate({
            _sum: { amount: true },
            _count: true,
            where: { status: "COMPLETED", createdAt: { gte: todayStart, lte: todayEnd } },
        });

        // Revenue this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const revenueMonthAgg = await this.prisma.order.aggregate({
            _sum: { amount: true },
            _count: true,
            where: { status: "COMPLETED", createdAt: { gte: monthStart, lte: monthEnd } },
        });

        // Revenue this year
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        const revenueYearAgg = await this.prisma.order.aggregate({
            _sum: { amount: true },
            _count: true,
            where: { status: "COMPLETED", createdAt: { gte: yearStart, lte: yearEnd } },
        });

        // Order counts by status
        const [totalOrders, pendingOrders, completedOrders, cancelledOrders, failedOrders] = await Promise.all([
            this.prisma.order.count({ where: dateWhere }),
            this.prisma.order.count({ where: { status: "PENDING", ...dateWhere } }),
            this.prisma.order.count({ where: { status: "COMPLETED", ...dateWhere } }),
            this.prisma.order.count({ where: { status: "CANCELLED", ...dateWhere } }),
            this.prisma.order.count({ where: { status: "FAILED", ...dateWhere } }),
        ]);

        // ==========================================
        // SECTION 3: QR & SCANS
        // ==========================================
        const [totalScans, scansToday, scansMonth] = await Promise.all([
            this.prisma.scan.count({ where: scanWhere }),
            this.prisma.scan.count({
                where: { scannedAt: { gte: todayStart, lte: todayEnd } },
            }),
            this.prisma.scan.count({
                where: { scannedAt: { gte: monthStart, lte: monthEnd } },
            }),
        ]);

        // ==========================================
        // SECTION 4: AFFILIATE
        // ==========================================
        const [
            totalAffiliates,
            activeAffiliates,
            totalReferrals,
            totalCommissionAgg,
            pendingPayouts,
            totalClicks,
        ] = await Promise.all([
            this.prisma.affiliateAccount.count(),
            this.prisma.affiliateAccount.count({ where: { status: "ACTIVE" } }),
            this.prisma.affiliateReferral.count({ where: dateWhere }),
            this.prisma.affiliateCommission.aggregate({
                _sum: { amount: true },
                where: dateWhere,
            }),
            this.prisma.affiliatePayout.count({ where: { status: "PENDING" } }),
            this.prisma.affiliateLink.aggregate({ _sum: { clickCount: true } }),
        ]);

        // ==========================================
        // CHART DATA: Daily Revenue + Scans
        // ==========================================
        const chartStart = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const chartEnd = endDate || now;

        const [ordersForChart, scansForChart] = await Promise.all([
            this.prisma.order.findMany({
                where: { createdAt: { gte: chartStart, lte: chartEnd }, status: "COMPLETED" },
                select: { createdAt: true, amount: true },
            }),
            this.prisma.scan.findMany({
                where: { scannedAt: { gte: chartStart, lte: chartEnd } },
                select: { scannedAt: true },
            }),
        ]);

        const chartDataMap = new Map<string, { date: string; revenue: number; scans: number }>();
        for (let d = new Date(chartStart); d <= chartEnd; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            chartDataMap.set(dateStr, { date: dateStr, revenue: 0, scans: 0 });
        }

        ordersForChart.forEach((order) => {
            const dateStr = order.createdAt.toISOString().split("T")[0];
            if (chartDataMap.has(dateStr)) {
                chartDataMap.get(dateStr)!.revenue += order.amount;
            }
        });

        scansForChart.forEach((scan) => {
            const dateStr = scan.scannedAt.toISOString().split("T")[0];
            if (chartDataMap.has(dateStr)) {
                chartDataMap.get(dateStr)!.scans += 1;
            }
        });

        const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        // ==========================================
        // MONTHLY REVENUE CHART (last 12 months)
        // ==========================================
        const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
        for (let i = 11; i >= 0; i--) {
            const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
            const label = `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(2, "0")}`;
            monthlyRevenue.push({ month: label, revenue: 0, orders: 0 });
        }

        // Fetch all completed orders for the last 12 months
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const ordersLast12 = await this.prisma.order.findMany({
            where: { status: "COMPLETED", createdAt: { gte: twelveMonthsAgo } },
            select: { createdAt: true, amount: true },
        });

        ordersLast12.forEach((order) => {
            const label = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
            const entry = monthlyRevenue.find((m) => m.month === label);
            if (entry) {
                entry.revenue += order.amount;
                entry.orders += 1;
            }
        });

        return {
            overview: {
                totalUsers,
                totalQRCodes,
                activeSubscriptions,
            },
            revenue: {
                total: totalRevenueAgg._sum.amount || 0,
                totalOrders: totalRevenueAgg._count,
                today: revenueTodayAgg._sum.amount || 0,
                todayOrders: revenueTodayAgg._count,
                thisMonth: revenueMonthAgg._sum.amount || 0,
                thisMonthOrders: revenueMonthAgg._count,
                thisYear: revenueYearAgg._sum.amount || 0,
                thisYearOrders: revenueYearAgg._count,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                cancelled: cancelledOrders,
                failed: failedOrders,
            },
            scans: {
                total: totalScans,
                today: scansToday,
                thisMonth: scansMonth,
                totalQRCodes,
            },
            affiliate: {
                totalAffiliates,
                activeAffiliates,
                totalReferrals,
                totalCommission: totalCommissionAgg._sum.amount || 0,
                pendingPayouts,
                totalClicks: totalClicks._sum.clickCount || 0,
            },
            chartData,
            monthlyRevenue,
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

    async banUser(id: string, reason?: string, adminId?: string) {
        // Prevent banning other admins
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (user?.role === "ADMIN") {
            throw new Error("Cannot ban an admin");
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: { bannedAt: new Date(), banReason: reason || null },
        });

        if (adminId) {
            await this.logAction(adminId, "BAN_USER", "USER", id, { reason });
        }

        return updated;
    }

    async unbanUser(id: string, adminId?: string) {
        const updated = await this.prisma.user.update({
            where: { id },
            data: { bannedAt: null, banReason: null },
        });

        if (adminId) {
            await this.logAction(adminId, "UNBAN_USER", "USER", id);
        }

        return updated;
    }

    async impersonateUser(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }

        // Use AuthService logic to generate tokens (we need to inject AuthService or replicate logic)
        // Since AdminService is likely used by AdminController, better to return user and let controller handle token gen?
        // Or inject AuthService.
        // For simplicity here, let's replicate token generation or assume we can move token generation to a shared utility or UsersService.
        // Actually, let's just use JwtService directly as we have it injected in AuthService.
        // But AdminService doesn't have JwtService injected.

        return user;
    }

    async getUserDetail(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
                _count: {
                    select: {
                        qrCodes: true,
                        orders: true,
                        apiKeys: true,
                        folders: true,
                    },
                },
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async deleteUser(userId: string, transferToUserId?: string, adminId?: string) {
        // Prevent deleting admins
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role === "ADMIN") {
            throw new Error("Cannot delete an admin user");
        }

        // If transferToUserId is provided, transfer QR codes first
        if (transferToUserId) {
            const targetUser = await this.prisma.user.findUnique({ where: { id: transferToUserId } });
            if (!targetUser) {
                throw new Error("Transfer target user not found");
            }
            await this.prisma.qRCode.updateMany({
                where: { userId },
                data: { userId: transferToUserId },
            });
        }

        // Cascade delete all associated data
        await this.prisma.$transaction([
            this.prisma.refreshToken.deleteMany({ where: { userId } }),
            this.prisma.magicLink.deleteMany({ where: { email: user.email } }),
            ...(transferToUserId ? [] : [this.prisma.qRCode.deleteMany({ where: { userId } })]),
            this.prisma.order.deleteMany({ where: { userId } }),
            this.prisma.subscription.deleteMany({ where: { userId } }),
            this.prisma.apiKey.deleteMany({ where: { userId } }),
            this.prisma.folder.deleteMany({ where: { userId } }),
            this.prisma.teamMember.deleteMany({ where: { userId } }),
            this.prisma.user.delete({ where: { id: userId } }),
        ]);

        if (adminId) {
            await this.logAction(adminId, "DELETE_USER", "USER", userId, {
                email: user.email,
                transferToUserId,
            });
        }

        return { message: "User deleted successfully" };
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
                    billingCycle: true,
                    currency: true,
                    transactionId: true,
                    paidAt: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: { id: true, email: true, name: true },
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

    async updateOrder(orderId: string, data: { status?: string; amount?: number; paidAt?: Date | null }, adminId?: string): Promise<any> {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new Error("Order not found");
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: data as any,
            include: { user: { select: { email: true } } },
        });

        if (adminId) {
            await this.logAction(adminId, "UPDATE_ORDER", "ORDER", orderId, {
                changes: data,
                previousStatus: order.status,
            });
        }

        return updated;
    }

    async deleteOrder(orderId: string, adminId?: string): Promise<any> {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new Error("Order not found");
        }

        await this.prisma.order.delete({
            where: { id: orderId }
        });

        if (adminId) {
            await this.logAction(adminId, "DELETE_ORDER", "ORDER", orderId, {
                amount: order.amount,
                status: order.status,
                planId: order.planId,
            });
        }

        return { message: "Order deleted successfully" };
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

    // ==========================================
    // AFFILIATE MANAGEMENT
    // ==========================================

    async createAffiliate(userId: string, adminId?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }

        // Check if affiliate already exists
        const existing = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
        if (existing) {
            throw new Error("User already has an affiliate account");
        }

        const affiliate = await this.prisma.affiliateAccount.create({
            data: { userId },
            include: { user: { select: { email: true, name: true } } },
        });

        if (adminId) {
            await this.logAction(adminId, "CREATE_AFFILIATE", "AFFILIATE", affiliate.id, { userId, email: user.email });
        }

        return affiliate;
    }

    async updateAffiliate(affiliateId: string, data: { status?: string; bankName?: string; bankAccount?: string; bankHolder?: string }, adminId?: string) {
        const updated = await this.prisma.affiliateAccount.update({
            where: { id: affiliateId },
            data: data as any,
            include: { user: { select: { email: true, name: true } } },
        });

        if (adminId) {
            await this.logAction(adminId, "UPDATE_AFFILIATE", "AFFILIATE", affiliateId, { changes: data });
        }

        return updated;
    }

    async updateAffiliateLink(linkId: string, data: { commissionRate?: number; discountRate?: number; label?: string; isActive?: boolean }, adminId?: string) {
        const updated = await this.prisma.affiliateLink.update({
            where: { id: linkId },
            data: data as any,
        });

        if (adminId) {
            await this.logAction(adminId, "UPDATE_AFFILIATE_LINK", "AFFILIATE_LINK", linkId, { changes: data });
        }

        return updated;
    }

    // ==========================================
    // AUDIT LOG
    // ==========================================

    async logAction(adminId: string, action: string, targetType: string, targetId: string, details?: any) {
        try {
            await this.prisma.adminAuditLog.create({
                data: {
                    adminId,
                    action,
                    targetType,
                    targetId,
                    details: details || undefined,
                },
            });
        } catch (e) {
            console.error("Failed to log admin action:", e);
        }
    }

    async getAuditLogs(page = 1, limit = 50, action?: string): Promise<any> {
        const where: any = {};
        if (action) where.action = action;

        const [logs, total] = await Promise.all([
            this.prisma.adminAuditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.adminAuditLog.count({ where }),
        ]);

        // Resolve admin emails
        const adminIds = [...new Set(logs.map(l => l.adminId))];
        const admins = await this.prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, email: true, name: true },
        });
        const adminMap = Object.fromEntries(admins.map(a => [a.id, a]));

        return {
            logs: logs.map(l => ({
                ...l,
                admin: adminMap[l.adminId] || { email: "unknown", name: null },
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

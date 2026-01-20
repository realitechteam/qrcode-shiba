import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface PlanDetails {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    limits: {
        dynamicQRCodes: number;
        staticQRCodes: number;
        scansPerMonth: number;
        folders: number;
        teamMembers: number;
        apiAccess: boolean;
        customDomain: boolean;
        analytics: string;
    };
}

@Injectable()
export class SubscriptionService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all available plans
     */
    getPlans(): PlanDetails[] {
        return [
            {
                id: "free",
                name: "Miễn phí",
                description: "Dành cho cá nhân bắt đầu",
                monthlyPrice: 0,
                yearlyPrice: 0,
                features: [
                    "Không giới hạn QR codes tĩnh",
                    "3 QR codes động",
                    "Tùy chỉnh màu sắc cơ bản",
                    "Xuất PNG",
                    "100 lượt quét/tháng",
                ],
                limits: {
                    dynamicQRCodes: 3,
                    staticQRCodes: -1, // unlimited
                    scansPerMonth: 100,
                    folders: 1,
                    teamMembers: 1,
                    apiAccess: false,
                    customDomain: false,
                    analytics: "basic",
                },
            },
            {
                id: "pro",
                name: "Pro",
                description: "Dành cho freelancers và startups",
                monthlyPrice: 99000,
                yearlyPrice: 990000,
                features: [
                    "50 QR codes động",
                    "Tùy chỉnh logo và kiểu dáng",
                    "Xuất PNG, SVG, PDF",
                    "10,000 lượt quét/tháng",
                    "Analytics nâng cao",
                    "10 thư mục",
                    "Hỗ trợ email",
                ],
                limits: {
                    dynamicQRCodes: 50,
                    staticQRCodes: -1,
                    scansPerMonth: 10000,
                    folders: 10,
                    teamMembers: 1,
                    apiAccess: false,
                    customDomain: false,
                    analytics: "advanced",
                },
            },
            {
                id: "business",
                name: "Business",
                description: "Dành cho doanh nghiệp vừa và nhỏ",
                monthlyPrice: 299000,
                yearlyPrice: 2990000,
                features: [
                    "500 QR codes động",
                    "Bulk QR generation",
                    "100,000 lượt quét/tháng",
                    "API Access",
                    "Thư mục không giới hạn",
                    "5 thành viên team",
                    "Hỗ trợ ưu tiên",
                ],
                limits: {
                    dynamicQRCodes: 500,
                    staticQRCodes: -1,
                    scansPerMonth: 100000,
                    folders: -1,
                    teamMembers: 5,
                    apiAccess: true,
                    customDomain: false,
                    analytics: "advanced",
                },
            },
            {
                id: "enterprise",
                name: "Enterprise",
                description: "Dành cho doanh nghiệp lớn",
                monthlyPrice: 999000,
                yearlyPrice: 9990000,
                features: [
                    "QR codes không giới hạn",
                    "Lượt quét không giới hạn",
                    "Custom domain",
                    "Thành viên không giới hạn",
                    "SSO / SAML",
                    "SLA 99.9%",
                    "Account manager riêng",
                ],
                limits: {
                    dynamicQRCodes: -1,
                    staticQRCodes: -1,
                    scansPerMonth: -1,
                    folders: -1,
                    teamMembers: -1,
                    apiAccess: true,
                    customDomain: true,
                    analytics: "enterprise",
                },
            },
        ];
    }

    /**
     * Get user's current subscription
     */
    async getUserSubscription(userId: string) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { tier: true },
        });

        const planId = subscription?.planId || user?.tier?.toLowerCase() || "free";
        const plan = this.getPlans().find((p) => p.id === planId);

        return {
            subscription,
            plan,
            isActive: subscription?.status === "ACTIVE",
            willExpire: subscription?.endDate
                ? new Date(subscription.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                : false,
        };
    }

    /**
     * Get user's order history
     */
    async getOrderHistory(userId: string, page: number = 1, limit: number = 10): Promise<any> {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where: { userId } }),
        ]);

        return {
            orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(userId: string) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            throw new NotFoundException("No active subscription");
        }

        await this.prisma.subscription.update({
            where: { userId },
            data: {
                status: "CANCELED",
                cancelledAt: new Date(),
            },
        });

        return { message: "Subscription cancelled" };
    }

    /**
     * Check user's usage limits
     */
    async checkLimits(userId: string) {
        const { plan } = await this.getUserSubscription(userId);

        if (!plan) {
            return { allowed: false, reason: "No plan found" };
        }

        // Count user's current usage
        const [dynamicQRCount, scanCount] = await Promise.all([
            this.prisma.qRCode.count({
                where: { userId, isDynamic: true },
            }),
            this.prisma.scan.count({
                where: {
                    qr: { userId },
                    scannedAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        return {
            plan: plan.id,
            usage: {
                dynamicQRCodes: dynamicQRCount,
                scansThisMonth: scanCount,
            },
            limits: plan.limits,
            remaining: {
                dynamicQRCodes:
                    plan.limits.dynamicQRCodes === -1
                        ? -1
                        : Math.max(0, plan.limits.dynamicQRCodes - dynamicQRCount),
                scansThisMonth:
                    plan.limits.scansPerMonth === -1
                        ? -1
                        : Math.max(0, plan.limits.scansPerMonth - scanCount),
            },
        };
    }
}

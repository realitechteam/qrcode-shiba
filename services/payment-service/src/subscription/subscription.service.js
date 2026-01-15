"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionService = class SubscriptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get all available plans
     */
    getPlans() {
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
    async getUserSubscription(userId) {
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
    async getOrderHistory(userId, page = 1, limit = 10) {
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
    async cancelSubscription(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription) {
            throw new common_1.NotFoundException("No active subscription");
        }
        await this.prisma.subscription.update({
            where: { userId },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
            },
        });
        return { message: "Subscription cancelled" };
    }
    /**
     * Check user's usage limits
     */
    async checkLimits(userId) {
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
                dynamicQRCodes: plan.limits.dynamicQRCodes === -1
                    ? -1
                    : Math.max(0, plan.limits.dynamicQRCodes - dynamicQRCount),
                scansThisMonth: plan.limits.scansPerMonth === -1
                    ? -1
                    : Math.max(0, plan.limits.scansPerMonth - scanCount),
            },
        };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);

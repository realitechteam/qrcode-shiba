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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomoController = void 0;
const common_1 = require("@nestjs/common");
const momo_service_1 = require("./momo.service");
const prisma_service_1 = require("../prisma/prisma.service");
let MomoController = class MomoController {
    momoService;
    prisma;
    constructor(momoService, prisma) {
        this.momoService = momoService;
        this.prisma = prisma;
    }
    /**
     * Create MoMo payment
     */
    async createPayment(body, userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        const pricing = this.getPlanPricing(body.planId, body.billingCycle);
        // Create order
        const order = await this.prisma.order.create({
            data: {
                userId,
                planId: body.planId,
                billingCycle: body.billingCycle,
                amount: pricing.amount,
                currency: "VND",
                status: "PENDING",
                paymentProvider: "MOMO",
            },
        });
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const paymentUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";
        const result = await this.momoService.createPayment({
            orderId: order.id,
            amount: pricing.amount,
            orderInfo: `QRCode-Shiba ${body.planId} ${body.billingCycle}`,
            returnUrl: `${frontendUrl}/payment/result`,
            notifyUrl: `${paymentUrl}/api/v1/momo/ipn`,
        });
        if (result.resultCode !== 0) {
            throw new common_1.BadRequestException(this.momoService.getResultMessage(result.resultCode));
        }
        return {
            paymentUrl: result.payUrl,
            qrCodeUrl: result.qrCodeUrl,
            deeplink: result.deeplink,
            orderId: order.id,
        };
    }
    /**
     * MoMo IPN callback
     */
    async handleIpn(data) {
        // Verify signature
        if (!this.momoService.verifySignature(data)) {
            return { resultCode: 97, message: "Invalid signature" };
        }
        const orderId = data.orderId;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            return { resultCode: 1, message: "Order not found" };
        }
        if (order.status === "COMPLETED") {
            return { resultCode: 0, message: "Already processed" };
        }
        const isSuccess = this.momoService.isPaymentSuccessful(data.resultCode);
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: isSuccess ? "COMPLETED" : "FAILED",
                transactionId: data.transId.toString(),
                paidAt: isSuccess ? new Date() : null,
                metadata: data,
            },
        });
        if (isSuccess) {
            await this.activateSubscription(orderId);
        }
        return { resultCode: 0, message: "Success" };
    }
    /**
     * Get plan pricing
     */
    getPlanPricing(planId, billingCycle) {
        const pricing = {
            pro: { monthly: 99000, yearly: 990000 },
            business: { monthly: 299000, yearly: 2990000 },
            enterprise: { monthly: 999000, yearly: 9990000 },
        };
        const plan = pricing[planId.toLowerCase()];
        if (!plan) {
            throw new common_1.BadRequestException("Invalid plan");
        }
        return { amount: plan[billingCycle] };
    }
    /**
     * Activate subscription
     */
    async activateSubscription(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true, planId: true, billingCycle: true },
        });
        if (!order)
            return;
        const endDate = new Date();
        if (order.billingCycle === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }
        else {
            endDate.setMonth(endDate.getMonth() + 1);
        }
        await this.prisma.subscription.upsert({
            where: { userId: order.userId },
            create: {
                userId: order.userId,
                planId: order.planId,
                status: "ACTIVE",
                startDate: new Date(),
                endDate,
                billingCycle: order.billingCycle,
            },
            update: {
                planId: order.planId,
                status: "ACTIVE",
                startDate: new Date(),
                endDate,
                billingCycle: order.billingCycle,
            },
        });
        await this.prisma.user.update({
            where: { id: order.userId },
            data: { tier: order.planId.toUpperCase() },
        });
    }
};
exports.MomoController = MomoController;
__decorate([
    (0, common_1.Post)("create-payment"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MomoController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)("ipn"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MomoController.prototype, "handleIpn", null);
exports.MomoController = MomoController = __decorate([
    (0, common_1.Controller)("momo"),
    __metadata("design:paramtypes", [momo_service_1.MomoService,
        prisma_service_1.PrismaService])
], MomoController);

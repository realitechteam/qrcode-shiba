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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VnpayController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const vnpay_service_1 = require("./vnpay.service");
const prisma_service_1 = require("../prisma/prisma.service");
let VnpayController = class VnpayController {
    vnpayService;
    prisma;
    constructor(vnpayService, prisma) {
        this.vnpayService = vnpayService;
        this.prisma = prisma;
    }
    /**
     * Create VNPay payment URL
     */
    async createPayment(body, userId, req) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        // Get plan pricing
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
                paymentProvider: "VNPAY",
            },
        });
        const ipAddr = req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.ip ||
            "127.0.0.1";
        const paymentUrl = this.vnpayService.createPaymentUrl({
            orderId: order.id,
            amount: pricing.amount,
            orderInfo: `QRCode-Shiba ${body.planId} ${body.billingCycle}`,
            returnUrl: `${process.env.FRONTEND_URL}/payment/result`,
            ipAddr,
        });
        return { paymentUrl, orderId: order.id };
    }
    /**
     * VNPay return URL handler
     */
    async handleReturn(query, res) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        // Verify signature
        if (!this.vnpayService.verifyReturnUrl(query)) {
            return res.redirect(`${frontendUrl}/payment/result?status=invalid`);
        }
        const orderId = query.vnp_TxnRef;
        const isSuccess = this.vnpayService.isPaymentSuccessful(query);
        // Update order status
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: isSuccess ? "COMPLETED" : "FAILED",
                transactionId: query.vnp_TransactionNo,
                paidAt: isSuccess ? new Date() : null,
                metadata: query,
            },
        });
        if (isSuccess) {
            // Activate subscription
            await this.activateSubscription(orderId);
            return res.redirect(`${frontendUrl}/payment/result?status=success&orderId=${orderId}`);
        }
        const message = this.vnpayService.getResponseMessage(query.vnp_ResponseCode);
        return res.redirect(`${frontendUrl}/payment/result?status=failed&message=${encodeURIComponent(message)}`);
    }
    /**
     * VNPay IPN (Instant Payment Notification) handler
     */
    async handleIpn(query) {
        // Verify signature
        if (!this.vnpayService.verifyReturnUrl(query)) {
            return { RspCode: "97", Message: "Invalid signature" };
        }
        const orderId = query.vnp_TxnRef;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            return { RspCode: "01", Message: "Order not found" };
        }
        if (order.status === "COMPLETED") {
            return { RspCode: "02", Message: "Order already processed" };
        }
        const isSuccess = this.vnpayService.isPaymentSuccessful(query);
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: isSuccess ? "COMPLETED" : "FAILED",
                transactionId: query.vnp_TransactionNo,
                paidAt: isSuccess ? new Date() : null,
                metadata: query,
            },
        });
        if (isSuccess) {
            await this.activateSubscription(orderId);
        }
        return { RspCode: "00", Message: "Success" };
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
     * Activate user subscription
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
        // Upsert subscription
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
        // Update user tier
        await this.prisma.user.update({
            where: { id: order.userId },
            data: { tier: order.planId.toUpperCase() },
        });
    }
};
exports.VnpayController = VnpayController;
__decorate([
    (0, common_1.Post)("create-payment"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], VnpayController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)("return"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], VnpayController.prototype, "handleReturn", null);
__decorate([
    (0, common_1.Get)("ipn"),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VnpayController.prototype, "handleIpn", null);
exports.VnpayController = VnpayController = __decorate([
    (0, common_1.Controller)("vnpay"),
    __metadata("design:paramtypes", [vnpay_service_1.VnpayService,
        prisma_service_1.PrismaService])
], VnpayController);

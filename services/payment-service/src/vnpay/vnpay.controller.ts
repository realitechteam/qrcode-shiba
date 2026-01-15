import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Req,
    Headers,
    Res,
    BadRequestException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { VnpayService, VnpayReturnParams } from "./vnpay.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("vnpay")
export class VnpayController {
    constructor(
        private readonly vnpayService: VnpayService,
        private readonly prisma: PrismaService
    ) { }

    /**
     * Create VNPay payment URL
     */
    @Post("create-payment")
    async createPayment(
        @Body() body: { planId: string; billingCycle: "monthly" | "yearly" },
        @Headers("x-user-id") userId: string,
        @Req() req: Request
    ) {
        if (!userId) {
            throw new BadRequestException("User ID required");
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

        const ipAddr =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
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
    @Get("return")
    async handleReturn(
        @Query() query: VnpayReturnParams,
        @Res() res: Response
    ) {
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
                metadata: query as any,
            },
        });

        if (isSuccess) {
            // Activate subscription
            await this.activateSubscription(orderId);
            return res.redirect(`${frontendUrl}/payment/result?status=success&orderId=${orderId}`);
        }

        const message = this.vnpayService.getResponseMessage(query.vnp_ResponseCode);
        return res.redirect(
            `${frontendUrl}/payment/result?status=failed&message=${encodeURIComponent(message)}`
        );
    }

    /**
     * VNPay IPN (Instant Payment Notification) handler
     */
    @Get("ipn")
    async handleIpn(@Query() query: VnpayReturnParams) {
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
                metadata: query as any,
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
    private getPlanPricing(
        planId: string,
        billingCycle: "monthly" | "yearly"
    ): { amount: number } {
        const pricing: Record<string, { monthly: number; yearly: number }> = {
            pro: { monthly: 99000, yearly: 990000 },
            business: { monthly: 299000, yearly: 2990000 },
            enterprise: { monthly: 999000, yearly: 9990000 },
        };

        const plan = pricing[planId.toLowerCase()];
        if (!plan) {
            throw new BadRequestException("Invalid plan");
        }

        return { amount: plan[billingCycle] };
    }

    /**
     * Activate user subscription
     */
    private async activateSubscription(orderId: string): Promise<void> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true, planId: true, billingCycle: true },
        });

        if (!order) return;

        const endDate = new Date();
        if (order.billingCycle === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
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
            data: { tier: order.planId.toUpperCase() as any },
        });
    }
}

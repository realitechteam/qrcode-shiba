import {
    Controller,
    Post,
    Body,
    Headers,
    BadRequestException,
} from "@nestjs/common";
import { MomoService, MomoCallbackData } from "./momo.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("momo")
export class MomoController {
    constructor(
        private readonly momoService: MomoService,
        private readonly prisma: PrismaService
    ) { }

    /**
     * Create MoMo payment
     */
    @Post("create-payment")
    async createPayment(
        @Body() body: { planId: string; billingCycle: "monthly" | "yearly" },
        @Headers("x-user-id") userId: string
    ) {
        if (!userId) {
            throw new BadRequestException("User ID required");
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
            throw new BadRequestException(
                this.momoService.getResultMessage(result.resultCode)
            );
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
    @Post("ipn")
    async handleIpn(@Body() data: MomoCallbackData) {
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
                metadata: data as any,
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
     * Activate subscription
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
            data: { tier: order.planId.toUpperCase() as any },
        });
    }
}

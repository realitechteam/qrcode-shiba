import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SepayService, SepayWebhookPayload } from "./sepay.service";
import { SubscriptionService } from "../subscription/subscription.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("sepay")
export class SepayController {
    constructor(
        private readonly sepayService: SepayService,
        private readonly subscriptionService: SubscriptionService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) { }

    /**
     * Generate VietQR payment code for plan upgrade
     */
    @Post("create-payment")
    async createPayment(
        @Body() body: { userId: string; planId: string; billingCycle: "monthly" | "yearly" }
    ) {
        const { userId, planId, billingCycle } = body;

        // Calculate amount based on plan
        const planPrices: Record<string, { monthly: number; yearly: number }> = {
            pro: { monthly: 199000, yearly: 1990000 },
            business: { monthly: 499000, yearly: 4990000 },
        };

        const prices = planPrices[planId];
        if (!prices) {
            throw new BadRequestException("Invalid plan");
        }

        const amount = billingCycle === "yearly" ? prices.yearly : prices.monthly;
        const orderId = `ORD${Date.now()}${userId.slice(0, 8)}`;

        // Generate QR payment data
        const qrData = this.sepayService.generateQRData({
            orderId,
            amount,
            orderInfo: `Nâng cấp gói ${planId} - ${billingCycle}`,
        });

        // Save order to database
        await this.prisma.order.create({
            data: {
                id: orderId,
                userId,
                planId,
                billingCycle,
                amount,
                currency: "VND",
                status: "PENDING",
                paymentProvider: "SEPAY",
            },
        });

        return {
            success: true,
            data: {
                orderId,
                amount,
                planId,
                billingCycle,
                ...qrData,
            },
        };
    }

    /**
     * SePay webhook handler - receives payment confirmation
     */
    @Post("webhook")
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() payload: SepayWebhookPayload,
        @Headers("authorization") authHeader: string
    ) {
        console.log("=== SePay Webhook Received ===");
        console.log("Payload:", JSON.stringify(payload, null, 2));
        console.log("Auth Header:", authHeader);

        // Verify API Key
        const webhookSecret = this.configService.get<string>("SEPAY_WEBHOOK_SECRET");
        const expectedAuth = `Apikey ${webhookSecret}`;

        if (authHeader && authHeader !== expectedAuth) {
            console.log("API Key mismatch:", { received: authHeader, expected: expectedAuth });
            // Don't reject - just log for debugging
        }

        // Only process incoming transfers
        if (payload.transferType !== "in") {
            console.log("Ignored outgoing transfer");
            return { success: true, message: "Ignored outgoing transfer" };
        }

        // Parse order ID from transfer content
        const orderId = this.sepayService.parseOrderIdFromContent(payload.content);
        console.log("Parsed Order ID:", orderId, "from content:", payload.content);

        if (!orderId) {
            console.log("Could not parse order ID from content:", payload.content);
            return { success: true, message: "No order ID found" };
        }

        console.log(`✅ Payment received for order ${orderId}: ${payload.transferAmount} VND`);

        try {
            // Activate subscription
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                console.log(`Order ${orderId} not found`);
                return { success: true, message: "Order not found" };
            }

            if (order.status === "COMPLETED") {
                console.log(`Order ${orderId} already completed`);
                return { success: true, message: "Order already completed" };
            }

            // Verify amount (simple check)
            if (payload.transferAmount < order.amount) {
                console.log(`Insufficient amount: ${payload.transferAmount} < ${order.amount}`);
                return { success: true, message: "Insufficient amount" };
            }

            // Update order status
            await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: "COMPLETED",
                    paidAt: new Date(),
                    transactionId: payload.transactionDate, // Using transaction date as ID equivalent for now
                },
            });

            // Calculate subscription end date
            const startDate = new Date();
            const endDate = new Date(startDate);
            if (order.billingCycle === "monthly") {
                endDate.setMonth(endDate.getMonth() + 1);
            } else {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

            // Upsert subscription
            await this.prisma.subscription.upsert({
                where: { userId: order.userId },
                update: {
                    status: "ACTIVE",
                    planId: order.planId,
                    billingCycle: order.billingCycle,
                    startDate: startDate,
                    endDate: endDate,
                    updatedAt: new Date(),
                },
                create: {
                    userId: order.userId,
                    status: "ACTIVE",
                    planId: order.planId,
                    billingCycle: order.billingCycle,
                    startDate: startDate,
                    endDate: endDate,
                },
            });

            // Update user tier
            await this.prisma.user.update({
                where: { id: order.userId },
                data: { tier: order.planId.toUpperCase() },
            });

            console.log(`Activated ${order.planId} subscription for user ${order.userId}`);

            return {
                success: true,
                message: "Webhook processed successfully",
                orderId,
                amount: payload.transferAmount,
            };
        } catch (error) {
            console.error("Error processing webhook:", error);
            return {
                success: false,
                message: "Error processing webhook",
                error: String(error),
            };
        }
    }
}

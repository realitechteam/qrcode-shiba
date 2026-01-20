import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SepayService, SepayWebhookPayload } from "./sepay.service";
import { SubscriptionService } from "../subscription/subscription.service";

@Controller("sepay")
export class SepayController {
    constructor(
        private readonly sepayService: SepayService,
        private readonly subscriptionService: SubscriptionService,
        private readonly configService: ConfigService
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
            pro: { monthly: 99000, yearly: 990000 },
            business: { monthly: 299000, yearly: 2990000 },
        };

        const prices = planPrices[planId];
        if (!prices) {
            throw new BadRequestException("Invalid plan");
        }

        const amount = billingCycle === "yearly" ? prices.yearly : prices.monthly;
        const orderId = `ORD-${Date.now()}-${userId.slice(0, 8)}`;

        // Generate QR payment data
        const qrData = this.sepayService.generateQRData({
            orderId,
            amount,
            orderInfo: `Nâng cấp gói ${planId} - ${billingCycle}`,
        });

        // TODO: Save order to database for tracking
        // await this.orderService.create({ orderId, userId, planId, billingCycle, amount });

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

        // TODO: Activate subscription
        // 1. Find order by orderId
        // 2. Verify amount matches
        // 3. Update order status to COMPLETED
        // 4. Create/update subscription for user

        return {
            success: true,
            message: "Webhook processed successfully",
            orderId,
            amount: payload.transferAmount,
        };
    }
}

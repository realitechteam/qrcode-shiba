import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UseGuards, UnauthorizedException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "crypto";
import { SepayService, SepayWebhookPayload } from "./sepay.service";
import { PaymentOrchestrationService } from "../shared/payment-orchestration.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("sepay")
export class SepayController {
    private readonly logger = new Logger(SepayController.name);

    constructor(
        private readonly sepayService: SepayService,
        private readonly paymentOrchestration: PaymentOrchestrationService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Generate VietQR payment code for plan upgrade
     */
    @Post("create-payment")
    @UseGuards(JwtAuthGuard)
    async createPayment(
        @CurrentUser("id") userId: string,
        @Body() body: { planId: string; billingCycle: "monthly" | "yearly" }
    ) {
        const { planId, billingCycle } = body;

        const { amount } = this.paymentOrchestration.getPlanPricing(planId, billingCycle);
        const orderId = `ORD${Date.now()}${userId.slice(0, 8)}`;

        // Generate QR payment data
        const qrData = this.sepayService.generateQRData({
            orderId,
            amount,
            orderInfo: `Nâng cấp gói ${planId} - ${billingCycle}`,
        });

        // Save order to database
        await this.paymentOrchestration.createOrder({
            orderId,
            userId,
            planId,
            billingCycle,
            amount,
            paymentProvider: "SEPAY",
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
     * NOTE: No JWT guard - called by SePay payment provider
     */
    @Post("webhook")
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() payload: SepayWebhookPayload,
        @Headers("authorization") authHeader: string
    ) {
        this.logger.debug(`Webhook received: transferType=${payload.transferType}, amount=${payload.transferAmount}`);

        // Verify API Key with timing-safe comparison
        const webhookSecret = this.configService.get<string>("SEPAY_WEBHOOK_SECRET");
        const expectedAuth = `Apikey ${webhookSecret}`;

        if (!authHeader || !this.timingSafeCompare(authHeader, expectedAuth)) {
            this.logger.warn("Webhook API key mismatch — rejecting request");
            throw new UnauthorizedException("Invalid API key");
        }

        // Only process incoming transfers
        if (payload.transferType !== "in") {
            this.logger.debug("Ignored outgoing transfer");
            return { success: true, message: "Ignored outgoing transfer" };
        }

        // Parse order ID from transfer content
        const orderId = this.sepayService.parseOrderIdFromContent(payload.content);

        if (!orderId) {
            this.logger.warn(`Could not parse order ID from content: ${payload.content}`);
            return { success: true, message: "No order ID found" };
        }

        this.logger.log(`Payment received for order ${orderId}: ${payload.transferAmount} VND`);

        try {
            // Verify payment amount matches the order before activating
            const amountValid = await this.paymentOrchestration.verifyOrderAmount(
                orderId,
                payload.transferAmount
            );
            if (!amountValid) {
                this.logger.warn(
                    `Amount mismatch for order ${orderId}: received ${payload.transferAmount} VND`
                );
                return {
                    success: false,
                    message: "Payment amount does not match order",
                };
            }

            await this.paymentOrchestration.activateSubscription(orderId, payload.transactionDate);

            return {
                success: true,
                message: "Webhook processed successfully",
                orderId,
                amount: payload.transferAmount,
            };
        } catch (error) {
            this.logger.error(`Error processing webhook for order ${orderId}`, error instanceof Error ? error.stack : String(error));
            return {
                success: false,
                message: "Error processing webhook",
            };
        }
    }

    /**
     * Timing-safe string comparison to prevent timing attacks on webhook secrets
     */
    private timingSafeCompare(a: string, b: string): boolean {
        try {
            const bufA = Buffer.from(a, "utf-8");
            const bufB = Buffer.from(b, "utf-8");
            if (bufA.length !== bufB.length) {
                // Still do a comparison to avoid leaking length info through timing
                timingSafeEqual(bufA, bufA);
                return false;
            }
            return timingSafeEqual(bufA, bufB);
        } catch {
            return false;
        }
    }
}

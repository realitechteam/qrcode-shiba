import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException, UnauthorizedException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SepayService, SepayWebhookPayload } from "./sepay.service";
import { PaymentOrchestrationService } from "../shared/payment-orchestration.service";

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
    async createPayment(
        @Body() body: { userId: string; planId: string; billingCycle: "monthly" | "yearly" }
    ) {
        const { userId, planId, billingCycle } = body;

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
     */
    @Post("webhook")
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() payload: SepayWebhookPayload,
        @Headers("authorization") authHeader: string
    ) {
        this.logger.debug(`Webhook received: transferType=${payload.transferType}, amount=${payload.transferAmount}`);

        // Verify API Key
        const webhookSecret = this.configService.get<string>("SEPAY_WEBHOOK_SECRET");
        const expectedAuth = `Apikey ${webhookSecret}`;

        if (authHeader && authHeader !== expectedAuth) {
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
}

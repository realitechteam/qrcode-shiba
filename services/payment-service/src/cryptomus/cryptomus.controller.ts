import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Logger,
} from "@nestjs/common";
import { CryptomusService, CryptomusWebhookPayload } from "./cryptomus.service";
import { PaymentOrchestrationService } from "../shared/payment-orchestration.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("cryptomus")
export class CryptomusController {
    private readonly logger = new Logger(CryptomusController.name);

    constructor(
        private readonly cryptomusService: CryptomusService,
        private readonly paymentOrchestration: PaymentOrchestrationService,
    ) {}

    /**
     * Create a Cryptomus payment for plan upgrade
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

        // Convert VND to USD for crypto payment
        const amountUsd = this.cryptomusService.convertVndToUsd(amount);

        // Create payment on Cryptomus
        const { paymentUrl, paymentId } = await this.cryptomusService.createPayment({
            orderId,
            amount: parseFloat(amountUsd),
        });

        // Save order to database
        await this.paymentOrchestration.createOrder({
            orderId,
            userId,
            planId,
            billingCycle,
            amount,
            paymentProvider: "CRYPTOMUS",
        });

        return {
            success: true,
            data: {
                orderId,
                amount,
                amountUsd: parseFloat(amountUsd),
                paymentUrl,
                paymentId,
            },
        };
    }

    /**
     * Cryptomus webhook handler - receives payment confirmation
     * NOTE: No JWT guard - called by Cryptomus payment provider
     */
    @Post("webhook")
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() payload: CryptomusWebhookPayload) {
        this.logger.debug(`Cryptomus webhook received: status=${payload.status}, order_id=${payload.order_id}`);

        // Verify webhook signature
        if (!this.cryptomusService.verifyWebhookSignature(payload as any)) {
            this.logger.warn("Cryptomus webhook signature verification failed");
            // Always return 200 to Cryptomus to avoid retries
            return { success: false, message: "Invalid signature" };
        }

        const { orderId, status, isFinal } = this.cryptomusService.parseWebhookPayload(payload);

        if (!orderId) {
            this.logger.warn("No order_id in Cryptomus webhook");
            return { success: true, message: "No order ID" };
        }

        this.logger.log(`Cryptomus payment for order ${orderId}: status=${status}, isFinal=${isFinal}`);

        try {
            // Process based on status
            if (status === "paid" || status === "paid_over") {
                await this.paymentOrchestration.activateSubscription(
                    orderId,
                    new Date().toISOString()
                );

                this.logger.log(`Subscription activated for order ${orderId}`);
            } else if (status === "cancel" || status === "fail" || status === "wrong_amount") {
                await this.paymentOrchestration.failOrder(orderId);
                this.logger.log(`Order ${orderId} marked as failed: ${status}`);
            }
            // Other statuses (process, confirming, etc.) - just acknowledge

            return {
                success: true,
                message: "Webhook processed",
                orderId,
            };
        } catch (error) {
            this.logger.error(
                `Error processing Cryptomus webhook for order ${orderId}`,
                error instanceof Error ? error.stack : String(error)
            );
            return { success: false, message: "Error processing webhook" };
        }
    }
}

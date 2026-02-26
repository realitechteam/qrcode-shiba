import {
    Controller,
    Post,
    Body,
    Headers,
    BadRequestException,
    Logger,
} from "@nestjs/common";
import { MomoService, MomoCallbackData } from "./momo.service";
import { PaymentOrchestrationService } from "../shared/payment-orchestration.service";

@Controller("momo")
export class MomoController {
    private readonly logger = new Logger(MomoController.name);

    constructor(
        private readonly momoService: MomoService,
        private readonly paymentOrchestration: PaymentOrchestrationService,
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

        const { amount } = this.paymentOrchestration.getPlanPricing(body.planId, body.billingCycle);

        // Create order
        const order = await this.paymentOrchestration.createOrder({
            userId,
            planId: body.planId,
            billingCycle: body.billingCycle,
            amount,
            paymentProvider: "MOMO",
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const paymentUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";

        const result = await this.momoService.createPayment({
            orderId: order.id,
            amount,
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
            this.logger.warn(`Invalid MoMo signature for order ${data.orderId}`);
            return { resultCode: 97, message: "Invalid signature" };
        }

        const isSuccess = this.momoService.isPaymentSuccessful(data.resultCode);

        try {
            if (isSuccess) {
                await this.paymentOrchestration.activateSubscription(data.orderId, data.transId.toString());
            } else {
                await this.paymentOrchestration.failOrder(data.orderId, data.transId.toString(), data);
            }
        } catch (error) {
            this.logger.error(`Error processing MoMo IPN for order ${data.orderId}`, error instanceof Error ? error.stack : String(error));
            return { resultCode: 1, message: "Processing error" };
        }

        return { resultCode: 0, message: "Success" };
    }
}

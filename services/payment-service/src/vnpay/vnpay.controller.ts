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
    Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { VnpayService, VnpayReturnParams } from "./vnpay.service";
import { PaymentOrchestrationService } from "../shared/payment-orchestration.service";

@Controller("vnpay")
export class VnpayController {
    private readonly logger = new Logger(VnpayController.name);

    constructor(
        private readonly vnpayService: VnpayService,
        private readonly paymentOrchestration: PaymentOrchestrationService,
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

        const { amount } = this.paymentOrchestration.getPlanPricing(body.planId, body.billingCycle);

        // Create order
        const order = await this.paymentOrchestration.createOrder({
            userId,
            planId: body.planId,
            billingCycle: body.billingCycle,
            amount,
            paymentProvider: "VNPAY",
        });

        const ipAddr =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
            req.ip ||
            "127.0.0.1";

        const paymentUrl = this.vnpayService.createPaymentUrl({
            orderId: order.id,
            amount,
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
            this.logger.warn(`Invalid VNPay return signature for order ${query.vnp_TxnRef}`);
            return res.redirect(`${frontendUrl}/payment/result?status=invalid`);
        }

        const orderId = query.vnp_TxnRef;
        const isSuccess = this.vnpayService.isPaymentSuccessful(query);

        try {
            if (isSuccess) {
                await this.paymentOrchestration.activateSubscription(orderId, query.vnp_TransactionNo);
                return res.redirect(`${frontendUrl}/payment/result?status=success&orderId=${orderId}`);
            } else {
                await this.paymentOrchestration.failOrder(orderId, query.vnp_TransactionNo, query);
            }
        } catch (error) {
            this.logger.error(`Error processing VNPay return for order ${orderId}`, error instanceof Error ? error.stack : String(error));
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
            this.logger.warn(`Invalid VNPay IPN signature for order ${query.vnp_TxnRef}`);
            return { RspCode: "97", Message: "Invalid signature" };
        }

        const orderId = query.vnp_TxnRef;
        const isSuccess = this.vnpayService.isPaymentSuccessful(query);

        try {
            if (isSuccess) {
                await this.paymentOrchestration.activateSubscription(orderId, query.vnp_TransactionNo);
            } else {
                await this.paymentOrchestration.failOrder(orderId, query.vnp_TransactionNo, query);
            }
        } catch (error) {
            this.logger.error(`Error processing VNPay IPN for order ${orderId}`, error instanceof Error ? error.stack : String(error));
            return { RspCode: "99", Message: "Processing error" };
        }

        return { RspCode: "00", Message: "Success" };
    }
}

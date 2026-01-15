import { Request, Response } from "express";
import { VnpayService, VnpayReturnParams } from "./vnpay.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class VnpayController {
    private readonly vnpayService;
    private readonly prisma;
    constructor(vnpayService: VnpayService, prisma: PrismaService);
    /**
     * Create VNPay payment URL
     */
    createPayment(body: {
        planId: string;
        billingCycle: "monthly" | "yearly";
    }, userId: string, req: Request): Promise<{
        paymentUrl: string;
        orderId: string;
    }>;
    /**
     * VNPay return URL handler
     */
    handleReturn(query: VnpayReturnParams, res: Response): Promise<any>;
    /**
     * VNPay IPN (Instant Payment Notification) handler
     */
    handleIpn(query: VnpayReturnParams): Promise<{
        RspCode: string;
        Message: string;
    }>;
    /**
     * Get plan pricing
     */
    private getPlanPricing;
    /**
     * Activate user subscription
     */
    private activateSubscription;
}
//# sourceMappingURL=vnpay.controller.d.ts.map
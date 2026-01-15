import { MomoService, MomoCallbackData } from "./momo.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class MomoController {
    private readonly momoService;
    private readonly prisma;
    constructor(momoService: MomoService, prisma: PrismaService);
    /**
     * Create MoMo payment
     */
    createPayment(body: {
        planId: string;
        billingCycle: "monthly" | "yearly";
    }, userId: string): Promise<{
        paymentUrl: string;
        qrCodeUrl: string | undefined;
        deeplink: string | undefined;
        orderId: string;
    }>;
    /**
     * MoMo IPN callback
     */
    handleIpn(data: MomoCallbackData): Promise<{
        resultCode: number;
        message: string;
    }>;
    /**
     * Get plan pricing
     */
    private getPlanPricing;
    /**
     * Activate subscription
     */
    private activateSubscription;
}
//# sourceMappingURL=momo.controller.d.ts.map
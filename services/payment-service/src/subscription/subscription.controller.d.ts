import { SubscriptionService } from "./subscription.service";
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    /**
     * Get all available plans
     */
    getPlans(): import("./subscription.service").PlanDetails[];
    /**
     * Get user's current subscription
     */
    getCurrentSubscription(userId: string): Promise<{
        subscription: {
            id: string;
            userId: string;
            planId: string;
            billingCycle: string | null;
            status: import("@prisma/client").$Enums.SubscriptionStatus;
            paymentProvider: string | null;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            providerSubscriptionId: string | null;
            cancelAtPeriodEnd: boolean;
            cancelledAt: Date | null;
        } | null;
        plan: import("./subscription.service").PlanDetails | undefined;
        isActive: boolean;
        willExpire: boolean;
    }>;
    /**
     * Get user's order history
     */
    getOrders(userId: string, page?: number, limit?: number): Promise<{
        orders: {
            id: string;
            userId: string;
            planId: string;
            billingCycle: string;
            amount: number;
            currency: string;
            status: string;
            paymentProvider: string;
            transactionId: string | null;
            paidAt: Date | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Check usage limits
     */
    checkLimits(userId: string): Promise<{
        allowed: boolean;
        reason: string;
        plan?: undefined;
        usage?: undefined;
        limits?: undefined;
        remaining?: undefined;
    } | {
        plan: string;
        usage: {
            dynamicQRCodes: number;
            scansThisMonth: number;
        };
        limits: {
            dynamicQRCodes: number;
            staticQRCodes: number;
            scansPerMonth: number;
            folders: number;
            teamMembers: number;
            apiAccess: boolean;
            customDomain: boolean;
            analytics: string;
        };
        remaining: {
            dynamicQRCodes: number;
            scansThisMonth: number;
        };
        allowed?: undefined;
        reason?: undefined;
    }>;
    /**
     * Cancel subscription
     */
    cancel(userId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=subscription.controller.d.ts.map
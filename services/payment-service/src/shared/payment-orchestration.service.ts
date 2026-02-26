import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Single source of truth for plan pricing.
 * All payment controllers MUST use this instead of hardcoding prices.
 */
export const PLAN_PRICING: Record<string, { monthly: number; yearly: number }> = {
    pro: { monthly: 199000, yearly: 1990000 },
    business: { monthly: 499000, yearly: 4990000 },
    enterprise: { monthly: 999000, yearly: 9990000 },
};

@Injectable()
export class PaymentOrchestrationService {
    private readonly logger = new Logger(PaymentOrchestrationService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get pricing for a plan. Throws if plan is invalid.
     */
    getPlanPricing(planId: string, billingCycle: "monthly" | "yearly"): { amount: number } {
        const plan = PLAN_PRICING[planId.toLowerCase()];
        if (!plan) {
            throw new BadRequestException(`Invalid plan: ${planId}`);
        }
        return { amount: plan[billingCycle] };
    }

    /**
     * Create a pending order in the database.
     */
    async createOrder(params: {
        userId: string;
        planId: string;
        billingCycle: "monthly" | "yearly";
        amount: number;
        paymentProvider: string;
        orderId?: string;
    }): Promise<any> {
        return this.prisma.order.create({
            data: {
                ...(params.orderId ? { id: params.orderId } : {}),
                userId: params.userId,
                planId: params.planId,
                billingCycle: params.billingCycle,
                amount: params.amount,
                currency: "VND",
                status: "PENDING",
                paymentProvider: params.paymentProvider,
            },
        });
    }

    /**
     * Activate a subscription after successful payment.
     * Handles order status update, subscription upsert, and user tier update.
     */
    async activateSubscription(orderId: string, transactionId?: string): Promise<void> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true, planId: true, billingCycle: true, status: true },
        });

        if (!order) {
            this.logger.warn(`Cannot activate subscription: order ${orderId} not found`);
            return;
        }

        if (order.status === "COMPLETED") {
            this.logger.debug(`Order ${orderId} already completed, skipping activation`);
            return;
        }

        // Update order status
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: "COMPLETED",
                paidAt: new Date(),
                ...(transactionId ? { transactionId } : {}),
            },
        });

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (order.billingCycle === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Upsert subscription
        await this.prisma.subscription.upsert({
            where: { userId: order.userId },
            create: {
                userId: order.userId,
                planId: order.planId,
                status: "ACTIVE",
                startDate,
                endDate,
                billingCycle: order.billingCycle,
            },
            update: {
                planId: order.planId,
                status: "ACTIVE",
                startDate,
                endDate,
                billingCycle: order.billingCycle,
                updatedAt: new Date(),
            },
        });

        // Update user tier
        await this.prisma.user.update({
            where: { id: order.userId },
            data: { tier: order.planId.toUpperCase() as any },
        });

        this.logger.log(`Activated ${order.planId} subscription for user ${order.userId} (order: ${orderId})`);
    }

    /**
     * Mark an order as failed.
     */
    async failOrder(orderId: string, transactionId?: string, metadata?: any): Promise<void> {
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: "FAILED",
                ...(transactionId ? { transactionId } : {}),
                ...(metadata ? { metadata } : {}),
            },
        });
    }
}

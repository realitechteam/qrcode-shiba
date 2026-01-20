import {
    Controller,
    Get,
    Post,
    Headers,
    Query,
    BadRequestException,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";

@Controller("subscription")
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    /**
     * Get all available plans
     */
    @Get("plans")
    getPlans() {
        return this.subscriptionService.getPlans();
    }

    /**
     * Get user's current subscription
     */
    @Get("current")
    async getCurrentSubscription(@Headers("x-user-id") userId: string) {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.subscriptionService.getUserSubscription(userId);
    }

    /**
     * Get user's order history
     */
    @Get("orders")
    async getOrders(
        @Headers("x-user-id") userId: string,
        @Query("page") page?: number,
        @Query("limit") limit?: number
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.subscriptionService.getOrderHistory(
            userId,
            page || 1,
            limit || 10
        );
    }

    /**
     * Check usage limits
     */
    @Get("limits")
    async checkLimits(@Headers("x-user-id") userId: string) {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.subscriptionService.checkLimits(userId);
    }

    /**
     * Cancel subscription
     */
    @Post("cancel")
    async cancel(@Headers("x-user-id") userId: string) {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.subscriptionService.cancelSubscription(userId);
    }
}

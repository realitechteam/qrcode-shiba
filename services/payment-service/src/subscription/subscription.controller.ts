import {
    Controller,
    Get,
    Post,
    UseGuards,
    Query,
    Param,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

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
    @UseGuards(JwtAuthGuard)
    async getCurrentSubscription(@CurrentUser("id") userId: string) {
        return this.subscriptionService.getUserSubscription(userId);
    }

    /**
     * Get user's order history
     */
    @Get("orders")
    @UseGuards(JwtAuthGuard)
    async getOrders(
        @CurrentUser("id") userId: string,
        @Query("page") page?: number,
        @Query("limit") limit?: number
    ): Promise<any> {
        return this.subscriptionService.getOrderHistory(
            userId,
            page || 1,
            limit || 10
        );
    }

    /**
     * Get single order (scoped to authenticated user)
     */
    @Get("orders/:id")
    @UseGuards(JwtAuthGuard)
    async getOrder(
        @Param("id") id: string,
        @CurrentUser("id") userId: string
    ) {
        const order = await this.subscriptionService.getOrderById(id, userId);
        return {
            success: true,
            data: order,
        };
    }

    /**
     * Check usage limits
     */
    @Get("limits")
    @UseGuards(JwtAuthGuard)
    async checkLimits(@CurrentUser("id") userId: string) {
        return this.subscriptionService.checkLimits(userId);
    }

    /**
     * Cancel subscription
     */
    @Post("cancel")
    @UseGuards(JwtAuthGuard)
    async cancel(@CurrentUser("id") userId: string) {
        return this.subscriptionService.cancelSubscription(userId);
    }
}

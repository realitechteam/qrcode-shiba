"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
let SubscriptionController = class SubscriptionController {
    subscriptionService;
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    /**
     * Get all available plans
     */
    getPlans() {
        return this.subscriptionService.getPlans();
    }
    /**
     * Get user's current subscription
     */
    async getCurrentSubscription(userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.subscriptionService.getUserSubscription(userId);
    }
    /**
     * Get user's order history
     */
    async getOrders(userId, page, limit) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.subscriptionService.getOrderHistory(userId, page || 1, limit || 10);
    }
    /**
     * Check usage limits
     */
    async checkLimits(userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.subscriptionService.checkLimits(userId);
    }
    /**
     * Cancel subscription
     */
    async cancel(userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.subscriptionService.cancelSubscription(userId);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)("plans"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)("current"),
    __param(0, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getCurrentSubscription", null);
__decorate([
    (0, common_1.Get)("orders"),
    __param(0, (0, common_1.Headers)("x-user-id")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)("limits"),
    __param(0, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "checkLimits", null);
__decorate([
    (0, common_1.Post)("cancel"),
    __param(0, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancel", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)("subscription"),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);

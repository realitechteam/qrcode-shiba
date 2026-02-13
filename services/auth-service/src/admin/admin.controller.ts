import {
    Controller,
    Get,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ==========================================
    // DASHBOARD STATS
    // ==========================================

    @Get("stats")
    async getStats() {
        return this.adminService.getStats();
    }

    // ==========================================
    // USERS
    // ==========================================

    @Get("users")
    async getUsers(
        @Query("page") page?: number,
        @Query("limit") limit?: number,
        @Query("search") search?: string,
        @Query("tier") tier?: string
    ) {
        return this.adminService.getUsers(
            page || 1,
            limit || 20,
            search,
            tier
        );
    }

    @Patch("users/:id")
    @HttpCode(HttpStatus.OK)
    async updateUser(
        @Param("id") id: string,
        @Body() data: { tier?: string; role?: "USER" | "ADMIN" }
    ) {
        return this.adminService.updateUser(id, data);
    }

    @Patch("users/:id/ban")
    @HttpCode(HttpStatus.OK)
    async banUser(@Param("id") id: string) {
        return this.adminService.banUser(id);
    }

    @Patch("users/:id/unban")
    @HttpCode(HttpStatus.OK)
    async unbanUser(@Param("id") id: string) {
        return this.adminService.unbanUser(id);
    }

    // ==========================================
    // ORDERS
    // ==========================================

    @Get("orders")
    async getOrders(
        @Query("page") page?: number,
        @Query("limit") limit?: number,
        @Query("status") status?: string
    ): Promise<{ orders: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
        return this.adminService.getOrders(page || 1, limit || 20, status);
    }

    // ==========================================
    // QR CODES
    // ==========================================

    @Get("qrcodes")
    async getQRCodes(
        @Query("page") page?: number,
        @Query("limit") limit?: number,
        @Query("userId") userId?: string,
        @Query("type") type?: string
    ): Promise<{ qrCodes: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
        return this.adminService.getQRCodes(
            page || 1,
            limit || 20,
            userId,
            type
        );
    }

    // ==========================================
    // AFFILIATES
    // ==========================================

    @Get("affiliates")
    async getAffiliates(
        @Query("page") page?: number,
        @Query("limit") limit?: number
    ) {
        return this.adminService.getAffiliates(page || 1, limit || 20);
    }

    @Get("affiliates/payouts")
    async getPendingPayouts(
        @Query("page") page?: number,
        @Query("limit") limit?: number
    ) {
        return this.adminService.getPendingPayouts(page || 1, limit || 20);
    }

    @Patch("affiliates/payouts/:id")
    @HttpCode(HttpStatus.OK)
    async updatePayoutStatus(
        @Param("id") id: string,
        @Body() data: { status: "PROCESSING" | "COMPLETED" | "FAILED"; note?: string }
    ) {
        return this.adminService.updatePayoutStatus(id, data.status, data.note);
    }

    // ==========================================
    // SYSTEM CONFIG
    // ==========================================

    @Get("config")
    async getConfig() {
        return this.adminService.getConfig();
    }

    @Patch("config")
    @HttpCode(HttpStatus.OK)
    async updateConfig(@Body() data: { key: string; value: string }) {
        return this.adminService.updateConfig(data.key, data.value);
    }
}

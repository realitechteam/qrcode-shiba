import {
    Controller,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";
import { AuthService } from "../auth/auth.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService
    ) { }

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
        @Body() data: { tier?: string; role?: "USER" | "ADMIN" },
        @Req() req: any
    ) {
        const result = await this.adminService.updateUser(id, data);
        await this.adminService.logAction(req.user.sub, "UPDATE_USER", "USER", id, { changes: data });
        return result;
    }

    @Patch("users/:id/ban")
    @HttpCode(HttpStatus.OK)
    async banUser(
        @Param("id") id: string,
        @Body() body: { reason?: string },
        @Req() req: any
    ) {
        return this.adminService.banUser(id, body.reason, req.user.sub);
    }

    @Patch("users/:id/unban")
    @HttpCode(HttpStatus.OK)
    async unbanUser(@Param("id") id: string, @Req() req: any) {
        return this.adminService.unbanUser(id, req.user.sub);
    }

    @Post("users/:id/impersonate")
    @HttpCode(HttpStatus.OK)
    async impersonateUser(@Param("id") id: string, @Req() req: any) {
        const user = await this.adminService.impersonateUser(id);
        await this.adminService.logAction(req.user.sub, "IMPERSONATE_USER", "USER", id);
        return this.authService.login(user);
    }

    @Get("users/:id")
    async getUserDetail(@Param("id") id: string) {
        return this.adminService.getUserDetail(id);
    }

    @Delete("users/:id")
    @HttpCode(HttpStatus.OK)
    async deleteUser(
        @Param("id") id: string,
        @Body() body: { transferToUserId?: string },
        @Req() req: any
    ) {
        return this.adminService.deleteUser(id, body?.transferToUserId, req.user.sub);
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

    @Patch("orders/:id")
    @HttpCode(HttpStatus.OK)
    async updateOrder(
        @Param("id") id: string,
        @Body() data: { status?: string; amount?: number; paidAt?: string | null },
        @Req() req: any
    ) {
        const parsedData: any = { ...data };
        if (data.paidAt) parsedData.paidAt = new Date(data.paidAt);
        return this.adminService.updateOrder(id, parsedData, req.user.sub);
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

    @Post("affiliates")
    @HttpCode(HttpStatus.CREATED)
    async createAffiliate(
        @Body() body: { userId: string },
        @Req() req: any
    ) {
        return this.adminService.createAffiliate(body.userId, req.user.sub);
    }

    @Patch("affiliates/:id")
    @HttpCode(HttpStatus.OK)
    async updateAffiliate(
        @Param("id") id: string,
        @Body() data: { status?: string; bankName?: string; bankAccount?: string; bankHolder?: string },
        @Req() req: any
    ) {
        return this.adminService.updateAffiliate(id, data, req.user.sub);
    }

    @Patch("affiliates/links/:id")
    @HttpCode(HttpStatus.OK)
    async updateAffiliateLink(
        @Param("id") id: string,
        @Body() data: { commissionRate?: number; discountRate?: number; label?: string; isActive?: boolean },
        @Req() req: any
    ) {
        return this.adminService.updateAffiliateLink(id, data, req.user.sub);
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

    // ==========================================
    // AUDIT LOGS
    // ==========================================

    @Get("audit-logs")
    async getAuditLogs(
        @Query("page") page?: number,
        @Query("limit") limit?: number,
        @Query("action") action?: string
    ) {
        return this.adminService.getAuditLogs(page || 1, limit || 50, action);
    }
}

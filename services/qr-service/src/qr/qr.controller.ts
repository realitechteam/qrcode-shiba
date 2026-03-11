import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { QrService } from "./qr.service";
import { CreateQRDto, UpdateQRDto, GeneratePreviewDto } from "./dto/qr.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("qr")
export class QrController {
    constructor(private readonly qrService: QrService) { }

    /**
     * Generate preview (no save)
     */
    @Post("preview")
    async generatePreview(@Body() dto: GeneratePreviewDto) {
        return this.qrService.generatePreview(dto);
    }

    /**
     * Create and save QR code
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() dto: CreateQRDto,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.qrService.create(userId, dto);
    }

    /**
     * Get all QR codes for user
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(
        @CurrentUser("id") userId: string,
        @Query("page") page?: number,
        @Query("limit") limit?: number,
        @Query("type") type?: string,
        @Query("folder") folderId?: string,
        @Query("search") search?: string
    ): Promise<any> {
        return this.qrService.findAll(userId, {
            page: page || 1,
            limit: limit || 20,
            type,
            folderId,
            search,
        });
    }

    /**
     * Get single QR code
     */
    @Get(":id")
    @UseGuards(JwtAuthGuard)
    async findOne(
        @Param("id") id: string,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.qrService.findOne(id, userId);
    }

    /**
     * Update QR code
     */
    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    async update(
        @Param("id") id: string,
        @Body() dto: UpdateQRDto,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.qrService.update(id, userId, dto);
    }

    /**
     * Delete QR code
     */
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(
        @Param("id") id: string,
        @CurrentUser("id") userId: string
    ) {
        await this.qrService.remove(id, userId);
    }

    /**
     * Download QR code
     */
    @Get(":id/download")
    @UseGuards(JwtAuthGuard)
    async download(
        @Param("id") id: string,
        @Query("format") format: "png" | "svg" | "pdf" = "png",
        @Query("size") size: number = 1024,
        @CurrentUser("id") userId: string,
        @Res() res: Response
    ) {
        const { buffer, mimeType, filename } = await this.qrService.download(
            id,
            userId,
            format,
            size
        );

        res.set({
            "Content-Type": mimeType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": buffer.length,
        });

        res.send(buffer);
    }

    /**
     * Regenerate images for all QR codes (admin only)
     */
    @Post("regenerate-images")
    @UseGuards(JwtAuthGuard)
    async regenerateAllImages(@CurrentUser() user: any) {
        if (user.role !== "ADMIN") {
            throw new BadRequestException("Admin access required");
        }
        return this.qrService.regenerateAllImages();
    }

    /**
     * Get QR code stats
     */
    @Get(":id/stats")
    @UseGuards(JwtAuthGuard)
    async getStats(
        @Param("id") id: string,
        @CurrentUser("id") userId: string,
        @Query("period") period: "7d" | "30d" | "90d" | "1y" = "30d"
    ) {
        return this.qrService.getStats(id, userId, period);
    }
}

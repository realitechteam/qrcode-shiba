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
    Headers,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { QrService } from "./qr.service";
import { CreateQRDto, UpdateQRDto, GeneratePreviewDto } from "./dto/qr.dto";

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
    async create(
        @Body() dto: CreateQRDto,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.qrService.create(userId, dto);
    }

    /**
     * Get all QR codes for user
     */
    @Get()
    async findAll(
        @Headers("x-user-id") userId: string,
        @Query("page") page?: number,
        @Query("limit") limit?: number,
        @Query("type") type?: string,
        @Query("folder") folderId?: string,
        @Query("search") search?: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
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
    async findOne(
        @Param("id") id: string,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.qrService.findOne(id, userId);
    }

    /**
     * Update QR code
     */
    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() dto: UpdateQRDto,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.qrService.update(id, userId, dto);
    }

    /**
     * Delete QR code
     */
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param("id") id: string,
        @Headers("x-user-id") userId: string
    ) {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        await this.qrService.remove(id, userId);
    }

    /**
     * Download QR code
     */
    @Get(":id/download")
    async download(
        @Param("id") id: string,
        @Query("format") format: "png" | "svg" | "pdf" = "png",
        @Query("size") size: number = 1024,
        @Headers("x-user-id") userId: string,
        @Res() res: Response
    ) {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }

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
     * Regenerate images for all QR codes (admin/migration)
     */
    @Post("regenerate-images")
    async regenerateAllImages() {
        return this.qrService.regenerateAllImages();
    }

    /**
     * Get QR code stats
     */
    @Get(":id/stats")
    async getStats(
        @Param("id") id: string,
        @Headers("x-user-id") userId: string,
        @Query("period") period: "7d" | "30d" | "90d" | "1y" = "30d"
    ) {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.qrService.getStats(id, userId, period);
    }
}

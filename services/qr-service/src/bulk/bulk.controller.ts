import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Headers,
    Res,
    BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { BulkService } from "./bulk.service";
import { BulkCreateDto } from "./dto/bulk.dto";

@Controller("bulk")
export class BulkController {
    constructor(private readonly bulkService: BulkService) { }

    /**
     * Bulk create QR codes from array
     */
    @Post("create")
    async bulkCreate(
        @Body() dto: BulkCreateDto,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.bulkService.bulkCreate(userId, dto);
    }

    /**
     * Bulk create from CSV content
     */
    @Post("csv")
    async bulkFromCSV(
        @Body() body: { csv: string; styling?: any; folderId?: string },
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }

        const items = this.bulkService.parseCSV(body.csv);
        return this.bulkService.bulkCreate(userId, {
            items,
            styling: body.styling,
            folderId: body.folderId,
        });
    }

    /**
     * Download QR codes as ZIP
     */
    @Post("download")
    async downloadZip(
        @Body() body: { qrIds: string[]; size?: number },
        @Headers("x-user-id") userId: string,
        @Res() res: Response
    ): Promise<void> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }

        if (!body.qrIds || body.qrIds.length === 0) {
            throw new BadRequestException("QR IDs required");
        }

        const buffer = await this.bulkService.generateZip(
            userId,
            body.qrIds,
            body.size || 512
        );

        res.set({
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="qrcodes.zip"`,
            "Content-Length": buffer.length,
        });

        res.send(buffer);
    }

    /**
     * Get CSV template
     */
    @Get("template")
    getTemplate(): { csv: string } {
        const template = `name,url,type
My Website,https://example.com,URL
Contact Card,https://mywebsite.com,URL
Promotion,https://promo.example.com,URL`;
        return { csv: template };
    }
}

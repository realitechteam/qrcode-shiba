import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    UseGuards,
    BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { BulkService } from "./bulk.service";
import { BulkCreateDto } from "./dto/bulk.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("bulk")
@UseGuards(JwtAuthGuard)
export class BulkController {
    constructor(private readonly bulkService: BulkService) { }

    /**
     * Bulk create QR codes from array
     */
    @Post("create")
    async bulkCreate(
        @Body() dto: BulkCreateDto,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.bulkService.bulkCreate(userId, dto);
    }

    /**
     * Bulk create from CSV content
     */
    @Post("csv")
    async bulkFromCSV(
        @Body() body: { csv: string; styling?: any; folderId?: string },
        @CurrentUser("id") userId: string
    ): Promise<any> {
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
        @CurrentUser("id") userId: string,
        @Res() res: Response
    ): Promise<void> {
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

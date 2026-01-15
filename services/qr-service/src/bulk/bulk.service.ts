import { Injectable, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../prisma/prisma.service";
import { GeneratorService } from "../generator/generator.service";
import { StylerService } from "../generator/styler.service";
import { RendererService } from "../generator/renderer.service";
import { BulkCreateDto, BulkJobResult, BulkQRItemDto } from "./dto/bulk.dto";
import { QRType } from "@qrcode-shiba/database";
import { DEFAULT_STYLING } from "../generator/types";
import archiver from "archiver";
import { Writable } from "stream";

@Injectable()
export class BulkService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generator: GeneratorService,
        private readonly styler: StylerService,
        private readonly renderer: RendererService
    ) { }

    /**
     * Bulk create QR codes
     */
    async bulkCreate(
        userId: string,
        dto: BulkCreateDto
    ): Promise<BulkJobResult> {
        const jobId = nanoid(12);
        const results: BulkJobResult = {
            jobId,
            total: dto.items.length,
            created: 0,
            failed: 0,
            errors: [],
            qrCodes: [],
        };

        if (dto.items.length > 100) {
            throw new BadRequestException("Maximum 100 items per batch");
        }

        const styling = { ...DEFAULT_STYLING, ...dto.styling };

        for (let i = 0; i < dto.items.length; i++) {
            const item = dto.items[i];
            try {
                const qr = await this.createSingleQR(
                    userId,
                    item,
                    styling,
                    dto.folderId
                );
                results.qrCodes.push({
                    id: qr.id,
                    name: qr.name,
                    shortCode: qr.shortCode,
                });
                results.created++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    index: i,
                    error: error?.message || "Unknown error",
                });
            }
        }

        return results;
    }

    /**
     * Create single QR code
     */
    private async createSingleQR(
        userId: string,
        item: BulkQRItemDto,
        styling: any,
        defaultFolderId?: string
    ): Promise<any> {
        const shortCode = nanoid(8);

        // Build data object
        let data: Record<string, any> = item.data || {};
        if (item.type === "URL" && item.url) {
            data = { url: item.url };
        }

        const qr = await this.prisma.qRCode.create({
            data: {
                userId,
                shortCode,
                name: item.name || `QR ${shortCode}`,
                type: item.type as QRType,
                isDynamic: item.isDynamic || false,
                destinationUrl: item.type === "URL" ? data.url : null,
                styling: styling as any,
                folderId: item.folderId || defaultFolderId,
                content: {
                    create: {
                        contentType: this.mapContentType(item.type),
                        data: data,
                    },
                },
            },
        });

        return qr;
    }

    /**
     * Generate ZIP with all QR codes as PNGs
     */
    async generateZip(
        userId: string,
        qrIds: string[],
        size: number = 512
    ): Promise<Buffer> {
        const chunks: Buffer[] = [];

        const archive = archiver("zip", { zlib: { level: 9 } });

        const writable = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            },
        });

        archive.pipe(writable);

        for (const qrId of qrIds) {
            try {
                const qr = await this.prisma.qRCode.findUnique({
                    where: { id: qrId },
                    include: { content: true },
                });

                if (!qr || qr.userId !== userId) continue;

                // Generate QR
                const dataString = this.generator.generateDataString(
                    qr.type as any,
                    qr.content?.data as Record<string, any> || {}
                );
                const matrix = await this.generator.generateMatrix(dataString, {
                    errorCorrectionLevel: "M",
                });
                const styling = { ...DEFAULT_STYLING, ...(qr.styling as any) };
                const svg = this.styler.generateStyledSvg(matrix, styling, size);
                const png = await this.renderer.svgToPng(svg, size);

                archive.append(png, { name: `${qr.shortCode}.png` });
            } catch (error) {
                console.error(`Failed to generate QR ${qrId}:`, error);
            }
        }

        await archive.finalize();

        // Wait for stream to finish
        await new Promise<void>((resolve) => writable.on("finish", resolve));

        return Buffer.concat(chunks);
    }

    /**
     * Parse CSV content to items
     */
    parseCSV(content: string): BulkQRItemDto[] {
        const lines = content.trim().split("\n");
        if (lines.length < 2) {
            throw new BadRequestException("CSV must have header and at least one row");
        }

        const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const items: BulkQRItemDto[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim());
            const item: any = { type: "URL" };

            header.forEach((h, idx) => {
                if (h === "name") item.name = values[idx];
                if (h === "url") item.url = values[idx];
                if (h === "type") item.type = values[idx]?.toUpperCase() || "URL";
            });

            if (item.name || item.url) {
                if (!item.name) item.name = item.url?.slice(0, 30) || `QR ${i}`;
                items.push(item);
            }
        }

        return items;
    }

    private mapContentType(type: string): any {
        const mapping: Record<string, string> = {
            URL: "URL",
            TEXT: "TEXT",
            VCARD: "VCARD",
            WIFI: "WIFI",
            EMAIL: "URL",
            SMS: "TEXT",
            PHONE: "TEXT",
            LOCATION: "TEXT",
        };
        return mapping[type] || "TEXT";
    }
}

import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../prisma/prisma.service";
import { GeneratorService } from "../generator/generator.service";
import { StylerService } from "../generator/styler.service";
import { RendererService } from "../generator/renderer.service";
import { CreateQRDto, UpdateQRDto, GeneratePreviewDto } from "./dto/qr.dto";
import { QRType, QRStatus } from "@qrcode-shiba/database";
import { DEFAULT_STYLING } from "../generator/types";

@Injectable()
export class QrService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generator: GeneratorService,
        private readonly styler: StylerService,
        private readonly renderer: RendererService
    ) { }

    /**
     * Generate preview without saving
     */
    async generatePreview(dto: GeneratePreviewDto) {
        const size = dto.size || 300;
        const dataString = this.generator.generateDataString(dto.type.toLowerCase(), dto.data);

        // Generate QR matrix
        const matrix = await this.generator.generateMatrix(dataString, {
            errorCorrectionLevel: "M",
        });

        // Apply styling
        const styling = { ...DEFAULT_STYLING, ...dto.styling };
        const svg = this.styler.generateStyledSvg(matrix, styling, size);

        // Convert to data URL
        const pngBuffer = await this.renderer.svgToPng(svg, size);
        const dataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;

        return {
            dataUrl,
            svg,
            size,
        };
    }

    /**
     * Create and save QR code
     */
    async create(userId: string, dto: CreateQRDto): Promise<any> {
        const shortCode = nanoid(8);
        const dataString = this.generator.generateDataString(dto.type.toLowerCase(), dto.data);

        // Generate QR preview
        const preview = await this.generatePreview({
            type: dto.type,
            data: dto.data,
            styling: dto.styling,
            size: 400, // Higher quality for storage
        });

        // Create in database with image saved
        const qr = await this.prisma.qRCode.create({
            data: {
                userId,
                shortCode,
                name: dto.name || `${dto.type} QR Code`,
                type: dto.type as QRType,
                isDynamic: dto.isDynamic || false,
                destinationUrl: dto.type === "URL" ? dto.data.url : null,
                imageUrl: preview.dataUrl, // Save QR image for later display
                styling: dto.styling as any || {},
                folderId: dto.folderId,
                content: {
                    create: {
                        contentType: this.mapContentType(dto.type),
                        data: dto.data,
                    },
                },
            },
            include: {
                content: true,
            },
        });

        return {
            ...qr,
            preview: preview.dataUrl,
        };
    }

    /**
     * Get all QR codes for user
     */
    async findAll(
        userId: string,
        params: {
            page: number;
            limit: number;
            type?: string;
            folderId?: string;
            search?: string;
        }
    ): Promise<any> {
        const { page, limit, type, folderId, search } = params;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (type) where.type = type;
        if (folderId) where.folderId = folderId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { destinationUrl: { contains: search, mode: "insensitive" } },
            ];
        }

        const [total, items] = await Promise.all([
            this.prisma.qRCode.count({ where }),
            this.prisma.qRCode.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    content: true,
                    _count: { select: { scans: true } },
                },
            }),
        ]);

        // Generate previews for each QR
        const itemsWithPreview = await Promise.all(
            items.map(async (item) => {
                const preview = await this.generatePreview({
                    type: item.type as any,
                    data: item.content?.data as Record<string, any> || {},
                    styling: item.styling as any,
                    size: 150,
                });
                return {
                    ...item,
                    scanCount: item._count.scans,
                    preview: preview.dataUrl,
                };
            })
        );

        return {
            items: itemsWithPreview,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get single QR code
     */
    async findOne(id: string, userId: string): Promise<any> {
        const qr = await this.prisma.qRCode.findUnique({
            where: { id },
            include: {
                content: true,
                _count: { select: { scans: true } },
            },
        });

        if (!qr) {
            throw new NotFoundException("QR code not found");
        }

        if (qr.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const preview = await this.generatePreview({
            type: qr.type as any,
            data: qr.content?.data as Record<string, any> || {},
            styling: qr.styling as any,
            size: 300,
        });

        return {
            ...qr,
            scanCount: qr._count.scans,
            preview: preview.dataUrl,
            svg: preview.svg,
        };
    }

    /**
     * Update QR code
     */
    async update(id: string, userId: string, dto: UpdateQRDto): Promise<any> {
        const qr = await this.prisma.qRCode.findUnique({ where: { id } });

        if (!qr) {
            throw new NotFoundException("QR code not found");
        }

        if (qr.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const updateData: any = {};
        if (dto.name) updateData.name = dto.name;
        if (dto.styling) updateData.styling = dto.styling;
        if (dto.destinationUrl) updateData.destinationUrl = dto.destinationUrl;
        if (dto.folderId) updateData.folderId = dto.folderId;

        const updated = await this.prisma.qRCode.update({
            where: { id },
            data: updateData,
            include: { content: true },
        });

        // Update content if provided
        if (dto.data && updated.content) {
            await this.prisma.qRContent.update({
                where: { id: updated.content.id },
                data: { data: dto.data },
            });
        }

        return this.findOne(id, userId);
    }

    /**
     * Delete QR code
     */
    async remove(id: string, userId: string) {
        const qr = await this.prisma.qRCode.findUnique({ where: { id } });

        if (!qr) {
            throw new NotFoundException("QR code not found");
        }

        if (qr.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        await this.prisma.qRCode.delete({ where: { id } });
    }

    /**
     * Regenerate images for all QR codes missing imageUrl
     */
    async regenerateAllImages(): Promise<{ updated: number; failed: number }> {
        // Find all QR codes without imageUrl
        const qrCodes = await this.prisma.qRCode.findMany({
            where: {
                OR: [
                    { imageUrl: null },
                    { imageUrl: "" },
                ],
            },
            include: { content: true },
        });

        let updated = 0;
        let failed = 0;

        for (const qr of qrCodes) {
            try {
                const preview = await this.generatePreview({
                    type: qr.type as any,
                    data: qr.content?.data as Record<string, any> || {},
                    styling: qr.styling as any,
                    size: 400,
                });

                await this.prisma.qRCode.update({
                    where: { id: qr.id },
                    data: { imageUrl: preview.dataUrl },
                });

                updated++;
            } catch (error) {
                console.error(`Failed to regenerate image for QR ${qr.id}:`, error);
                failed++;
            }
        }

        return { updated, failed };
    }

    /**
     * Download QR code in specified format
     */
    async download(
        id: string,
        userId: string,
        format: "png" | "svg" | "pdf",
        size: number
    ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
        const qr = await this.findOne(id, userId);

        let buffer: Buffer;
        let mimeType: string;
        let filename: string;

        // For PNG format, try to use saved imageUrl first for faster response
        if (format === "png" && qr.imageUrl && qr.imageUrl.startsWith("data:image/png;base64,")) {
            const base64Data = qr.imageUrl.replace("data:image/png;base64,", "");
            buffer = Buffer.from(base64Data, "base64");
            mimeType = "image/png";
            filename = `${qr.shortCode}.png`;
            return { buffer, mimeType, filename };
        }

        // Regenerate for specific format or size
        const preview = await this.generatePreview({
            type: qr.type as any,
            data: qr.content?.data as Record<string, any> || {},
            styling: qr.styling as any,
            size,
        });

        switch (format) {
            case "svg":
                buffer = Buffer.from(preview.svg);
                mimeType = "image/svg+xml";
                filename = `${qr.shortCode}.svg`;
                break;

            case "pdf":
                // For PDF, we'd use pdfkit - simplified for now
                buffer = await this.renderer.svgToPng(preview.svg, size);
                mimeType = "application/pdf";
                filename = `${qr.shortCode}.pdf`;
                break;

            case "png":
            default:
                buffer = await this.renderer.svgToPng(preview.svg, size);
                mimeType = "image/png";
                filename = `${qr.shortCode}.png`;
                break;
        }

        return { buffer, mimeType, filename };
    }

    /**
     * Get QR code statistics
     */
    async getStats(id: string, userId: string, period: string) {
        const qr = await this.prisma.qRCode.findUnique({ where: { id } });

        if (!qr) {
            throw new NotFoundException("QR code not found");
        }

        if (qr.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        const periodDays = this.getPeriodDays(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const scans = await this.prisma.scan.findMany({
            where: {
                qrId: id,
                scannedAt: { gte: startDate },
            },
            select: {
                scannedAt: true,
                country: true,
                city: true,
                deviceType: true,
                os: true,
                browser: true,
            },
        });

        // Aggregate by date
        const byDate = this.aggregateByDate(scans);
        const byCountry = this.aggregateBy(scans, "country");
        const byDevice = this.aggregateBy(scans, "deviceType");
        const byOs = this.aggregateBy(scans, "os");

        return {
            total: scans.length,
            period,
            byDate,
            byCountry,
            byDevice,
            byOs,
        };
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

    private getPeriodDays(period: string): number {
        switch (period) {
            case "7d":
                return 7;
            case "30d":
                return 30;
            case "90d":
                return 90;
            case "1y":
                return 365;
            default:
                return 30;
        }
    }

    private aggregateByDate(scans: any[]) {
        const result: Record<string, number> = {};
        for (const scan of scans) {
            const date = scan.scannedAt.toISOString().split("T")[0];
            result[date] = (result[date] || 0) + 1;
        }
        return Object.entries(result).map(([date, count]) => ({ date, count }));
    }

    private aggregateBy(scans: any[], field: string) {
        const result: Record<string, number> = {};
        for (const scan of scans) {
            const value = scan[field] || "Unknown";
            result[value] = (result[value] || 0) + 1;
        }
        return Object.entries(result)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
}

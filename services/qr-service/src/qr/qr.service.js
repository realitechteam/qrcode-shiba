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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const nanoid_1 = require("nanoid");
const prisma_service_1 = require("../prisma/prisma.service");
const generator_service_1 = require("../generator/generator.service");
const styler_service_1 = require("../generator/styler.service");
const renderer_service_1 = require("../generator/renderer.service");
const types_1 = require("../generator/types");
let QrService = class QrService {
    prisma;
    generator;
    styler;
    renderer;
    constructor(prisma, generator, styler, renderer) {
        this.prisma = prisma;
        this.generator = generator;
        this.styler = styler;
        this.renderer = renderer;
    }
    /**
     * Generate preview without saving
     */
    async generatePreview(dto) {
        const size = dto.size || 300;
        const dataString = this.generator.generateDataString(dto.type, dto.data);
        // Generate QR matrix
        const matrix = await this.generator.generateMatrix(dataString, {
            errorCorrectionLevel: "M",
        });
        // Apply styling
        const styling = { ...types_1.DEFAULT_STYLING, ...dto.styling };
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
    async create(userId, dto) {
        const shortCode = (0, nanoid_1.nanoid)(8);
        const dataString = this.generator.generateDataString(dto.type, dto.data);
        // Generate QR preview
        const preview = await this.generatePreview({
            type: dto.type,
            data: dto.data,
            styling: dto.styling,
            size: 300,
        });
        // Create in database
        const qr = await this.prisma.qRCode.create({
            data: {
                userId,
                shortCode,
                name: dto.name || `${dto.type} QR Code`,
                type: dto.type,
                isDynamic: dto.isDynamic || false,
                destinationUrl: dto.type === "URL" ? dto.data.url : null,
                styling: dto.styling || {},
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
    async findAll(userId, params) {
        const { page, limit, type, folderId, search } = params;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (type)
            where.type = type;
        if (folderId)
            where.folderId = folderId;
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
        const itemsWithPreview = await Promise.all(items.map(async (item) => {
            const preview = await this.generatePreview({
                type: item.type,
                data: item.content?.data || {},
                styling: item.styling,
                size: 150,
            });
            return {
                ...item,
                scanCount: item._count.scans,
                preview: preview.dataUrl,
            };
        }));
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
    async findOne(id, userId) {
        const qr = await this.prisma.qRCode.findUnique({
            where: { id },
            include: {
                content: true,
                _count: { select: { scans: true } },
            },
        });
        if (!qr) {
            throw new common_1.NotFoundException("QR code not found");
        }
        if (qr.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied");
        }
        const preview = await this.generatePreview({
            type: qr.type,
            data: qr.content?.data || {},
            styling: qr.styling,
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
    async update(id, userId, dto) {
        const qr = await this.prisma.qRCode.findUnique({ where: { id } });
        if (!qr) {
            throw new common_1.NotFoundException("QR code not found");
        }
        if (qr.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied");
        }
        const updateData = {};
        if (dto.name)
            updateData.name = dto.name;
        if (dto.styling)
            updateData.styling = dto.styling;
        if (dto.destinationUrl)
            updateData.destinationUrl = dto.destinationUrl;
        if (dto.folderId)
            updateData.folderId = dto.folderId;
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
    async remove(id, userId) {
        const qr = await this.prisma.qRCode.findUnique({ where: { id } });
        if (!qr) {
            throw new common_1.NotFoundException("QR code not found");
        }
        if (qr.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied");
        }
        await this.prisma.qRCode.delete({ where: { id } });
    }
    /**
     * Download QR code in specified format
     */
    async download(id, userId, format, size) {
        const qr = await this.findOne(id, userId);
        const preview = await this.generatePreview({
            type: qr.type,
            data: qr.content?.data || {},
            styling: qr.styling,
            size,
        });
        let buffer;
        let mimeType;
        let filename;
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
    async getStats(id, userId, period) {
        const qr = await this.prisma.qRCode.findUnique({ where: { id } });
        if (!qr) {
            throw new common_1.NotFoundException("QR code not found");
        }
        if (qr.userId !== userId) {
            throw new common_1.ForbiddenException("Access denied");
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
    mapContentType(type) {
        const mapping = {
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
    getPeriodDays(period) {
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
    aggregateByDate(scans) {
        const result = {};
        for (const scan of scans) {
            const date = scan.scannedAt.toISOString().split("T")[0];
            result[date] = (result[date] || 0) + 1;
        }
        return Object.entries(result).map(([date, count]) => ({ date, count }));
    }
    aggregateBy(scans, field) {
        const result = {};
        for (const scan of scans) {
            const value = scan[field] || "Unknown";
            result[value] = (result[value] || 0) + 1;
        }
        return Object.entries(result)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        generator_service_1.GeneratorService,
        styler_service_1.StylerService,
        renderer_service_1.RendererService])
], QrService);

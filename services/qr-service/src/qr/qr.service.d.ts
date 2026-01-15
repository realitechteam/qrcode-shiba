import { PrismaService } from "../prisma/prisma.service";
import { GeneratorService } from "../generator/generator.service";
import { StylerService } from "../generator/styler.service";
import { RendererService } from "../generator/renderer.service";
import { CreateQRDto, UpdateQRDto, GeneratePreviewDto } from "./dto/qr.dto";
export declare class QrService {
    private readonly prisma;
    private readonly generator;
    private readonly styler;
    private readonly renderer;
    constructor(prisma: PrismaService, generator: GeneratorService, styler: StylerService, renderer: RendererService);
    /**
     * Generate preview without saving
     */
    generatePreview(dto: GeneratePreviewDto): Promise<{
        dataUrl: string;
        svg: string;
        size: number;
    }>;
    /**
     * Create and save QR code
     */
    create(userId: string, dto: CreateQRDto): Promise<{
        preview: string;
        name: string | null;
        type: import("@prisma/client").$Enums.QRType;
        isDynamic: boolean;
        styling: import("@prisma/client/runtime/library").JsonValue;
        folderId: string | null;
        destinationUrl: string | null;
        id: string;
        shortCode: string;
        status: import("@prisma/client").$Enums.QRStatus;
        expiresAt: Date | null;
        passwordHash: string | null;
        scanCount: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    /**
     * Get all QR codes for user
     */
    findAll(userId: string, params: {
        page: number;
        limit: number;
        type?: string;
        folderId?: string;
        search?: string;
    }): Promise<{
        items: {
            scanCount: number;
            preview: string;
            content: {
                data: import("@prisma/client/runtime/library").JsonValue;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                contentType: import("@prisma/client").$Enums.ContentType;
                fileUrl: string | null;
                qrId: string;
            } | null;
            _count: {
                scans: number;
            };
            name: string | null;
            type: import("@prisma/client").$Enums.QRType;
            isDynamic: boolean;
            styling: import("@prisma/client/runtime/library").JsonValue;
            folderId: string | null;
            destinationUrl: string | null;
            id: string;
            shortCode: string;
            status: import("@prisma/client").$Enums.QRStatus;
            expiresAt: Date | null;
            passwordHash: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get single QR code
     */
    findOne(id: string, userId: string): Promise<{
        scanCount: number;
        preview: string;
        svg: string;
        content: {
            data: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contentType: import("@prisma/client").$Enums.ContentType;
            fileUrl: string | null;
            qrId: string;
        } | null;
        _count: {
            scans: number;
        };
        name: string | null;
        type: import("@prisma/client").$Enums.QRType;
        isDynamic: boolean;
        styling: import("@prisma/client/runtime/library").JsonValue;
        folderId: string | null;
        destinationUrl: string | null;
        id: string;
        shortCode: string;
        status: import("@prisma/client").$Enums.QRStatus;
        expiresAt: Date | null;
        passwordHash: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    /**
     * Update QR code
     */
    update(id: string, userId: string, dto: UpdateQRDto): Promise<{
        scanCount: number;
        preview: string;
        svg: string;
        content: {
            data: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contentType: import("@prisma/client").$Enums.ContentType;
            fileUrl: string | null;
            qrId: string;
        } | null;
        _count: {
            scans: number;
        };
        name: string | null;
        type: import("@prisma/client").$Enums.QRType;
        isDynamic: boolean;
        styling: import("@prisma/client/runtime/library").JsonValue;
        folderId: string | null;
        destinationUrl: string | null;
        id: string;
        shortCode: string;
        status: import("@prisma/client").$Enums.QRStatus;
        expiresAt: Date | null;
        passwordHash: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    /**
     * Delete QR code
     */
    remove(id: string, userId: string): Promise<void>;
    /**
     * Download QR code in specified format
     */
    download(id: string, userId: string, format: "png" | "svg" | "pdf", size: number): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        mimeType: string;
        filename: string;
    }>;
    /**
     * Get QR code statistics
     */
    getStats(id: string, userId: string, period: string): Promise<{
        total: number;
        period: string;
        byDate: {
            date: string;
            count: number;
        }[];
        byCountry: {
            name: string;
            count: number;
        }[];
        byDevice: {
            name: string;
            count: number;
        }[];
        byOs: {
            name: string;
            count: number;
        }[];
    }>;
    private mapContentType;
    private getPeriodDays;
    private aggregateByDate;
    private aggregateBy;
}
//# sourceMappingURL=qr.service.d.ts.map
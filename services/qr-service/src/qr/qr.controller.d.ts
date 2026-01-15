import { Response } from "express";
import { QrService } from "./qr.service";
import { CreateQRDto, UpdateQRDto, GeneratePreviewDto } from "./dto/qr.dto";
export declare class QrController {
    private readonly qrService;
    constructor(qrService: QrService);
    /**
     * Generate preview (no save)
     */
    generatePreview(dto: GeneratePreviewDto): Promise<{
        dataUrl: string;
        svg: string;
        size: number;
    }>;
    /**
     * Create and save QR code
     */
    create(dto: CreateQRDto, userId: string): Promise<{
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
    findAll(userId: string, page?: number, limit?: number, type?: string, folderId?: string, search?: string): Promise<{
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
    update(id: string, dto: UpdateQRDto, userId: string): Promise<{
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
     * Download QR code
     */
    download(id: string, format: "png" | "svg" | "pdf" | undefined, size: number | undefined, userId: string, res: Response): Promise<void>;
    /**
     * Get QR code stats
     */
    getStats(id: string, userId: string, period?: "7d" | "30d" | "90d" | "1y"): Promise<{
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
}
//# sourceMappingURL=qr.controller.d.ts.map
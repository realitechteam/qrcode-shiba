import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFolderDto, UpdateFolderDto } from "./dto/folder.dto";

interface FolderWithChildren {
    id: string;
    name: string;
    color: string | null;
    parentId: string | null;
    qrCount: number;
    children: FolderWithChildren[];
}

@Injectable()
export class FolderService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new folder
     */
    async create(userId: string, dto: CreateFolderDto): Promise<any> {
        // Verify parent folder belongs to user if specified
        if (dto.parentId) {
            const parent = await this.prisma.folder.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent || parent.userId !== userId) {
                throw new BadRequestException("Invalid parent folder");
            }
        }

        return this.prisma.folder.create({
            data: {
                userId,
                name: dto.name,
                parentId: dto.parentId,
                color: dto.color || "#6B7280", // default gray
            },
            include: {
                _count: { select: { qrCodes: true } },
            },
        });
    }

    /**
     * Get all folders for user as a flat list
     */
    async findAll(userId: string): Promise<any[]> {
        const folders = await this.prisma.folder.findMany({
            where: { userId },
            orderBy: { name: "asc" },
            include: {
                _count: { select: { qrCodes: true } },
            },
        });

        return folders.map((f) => ({
            ...f,
            qrCount: f._count.qrCodes,
        }));
    }

    /**
     * Get folders as tree structure
     */
    async findTree(userId: string): Promise<FolderWithChildren[]> {
        const folders = await this.prisma.folder.findMany({
            where: { userId },
            orderBy: { name: "asc" },
            include: {
                _count: { select: { qrCodes: true } },
            },
        });

        // Build tree structure
        const folderMap = new Map<string, FolderWithChildren>();
        const roots: FolderWithChildren[] = [];

        // First pass: create all folder nodes
        for (const folder of folders) {
            folderMap.set(folder.id, {
                id: folder.id,
                name: folder.name,
                color: folder.color,
                parentId: folder.parentId,
                qrCount: folder._count.qrCodes,
                children: [],
            });
        }

        // Second pass: build tree
        for (const folder of folders) {
            const node = folderMap.get(folder.id)!;
            if (folder.parentId) {
                const parent = folderMap.get(folder.parentId);
                if (parent) {
                    parent.children.push(node);
                } else {
                    roots.push(node);
                }
            } else {
                roots.push(node);
            }
        }

        return roots;
    }

    /**
     * Get single folder
     */
    async findOne(id: string, userId: string): Promise<any> {
        const folder = await this.prisma.folder.findUnique({
            where: { id },
            include: {
                _count: { select: { qrCodes: true } },
                children: true,
            },
        });

        if (!folder) {
            throw new NotFoundException("Folder not found");
        }

        if (folder.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        return {
            ...folder,
            qrCount: folder._count.qrCodes,
        };
    }

    /**
     * Update folder
     */
    async update(id: string, userId: string, dto: UpdateFolderDto): Promise<any> {
        const folder = await this.prisma.folder.findUnique({ where: { id } });

        if (!folder) {
            throw new NotFoundException("Folder not found");
        }

        if (folder.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        // Prevent circular reference
        if (dto.parentId === id) {
            throw new BadRequestException("Folder cannot be its own parent");
        }

        if (dto.parentId) {
            const parent = await this.prisma.folder.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent || parent.userId !== userId) {
                throw new BadRequestException("Invalid parent folder");
            }
        }

        return this.prisma.folder.update({
            where: { id },
            data: {
                name: dto.name,
                parentId: dto.parentId,
                color: dto.color,
            },
            include: {
                _count: { select: { qrCodes: true } },
            },
        });
    }

    /**
     * Delete folder (QR codes moved to root)
     */
    async delete(id: string, userId: string): Promise<void> {
        const folder = await this.prisma.folder.findUnique({
            where: { id },
            include: { children: true },
        });

        if (!folder) {
            throw new NotFoundException("Folder not found");
        }

        if (folder.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        // Move child folders to parent
        await this.prisma.folder.updateMany({
            where: { parentId: id },
            data: { parentId: folder.parentId },
        });

        // Move QR codes to root (null folderId)
        await this.prisma.qRCode.updateMany({
            where: { folderId: id },
            data: { folderId: null },
        });

        // Delete folder
        await this.prisma.folder.delete({ where: { id } });
    }

    /**
     * Move QR code to folder
     */
    async moveQR(qrId: string, folderId: string | null, userId: string): Promise<any> {
        const qr = await this.prisma.qRCode.findUnique({ where: { id: qrId } });

        if (!qr) {
            throw new NotFoundException("QR code not found");
        }

        if (qr.userId !== userId) {
            throw new ForbiddenException("Access denied");
        }

        // Verify folder belongs to user if specified
        if (folderId) {
            const folder = await this.prisma.folder.findUnique({
                where: { id: folderId },
            });
            if (!folder || folder.userId !== userId) {
                throw new BadRequestException("Invalid folder");
            }
        }

        return this.prisma.qRCode.update({
            where: { id: qrId },
            data: { folderId },
        });
    }
}

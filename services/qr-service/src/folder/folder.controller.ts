import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Headers,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from "@nestjs/common";
import { FolderService } from "./folder.service";
import { CreateFolderDto, UpdateFolderDto, MoveQRToFolderDto } from "./dto/folder.dto";

@Controller("folders")
export class FolderController {
    constructor(private readonly folderService: FolderService) { }

    /**
     * Create new folder
     */
    @Post()
    async create(
        @Body() dto: CreateFolderDto,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.folderService.create(userId, dto);
    }

    /**
     * Get all folders as tree
     */
    @Get()
    async findAll(@Headers("x-user-id") userId: string): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.folderService.findTree(userId);
    }

    /**
     * Get all folders as flat list
     */
    @Get("list")
    async findList(@Headers("x-user-id") userId: string): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.folderService.findAll(userId);
    }

    /**
     * Get single folder
     */
    @Get(":id")
    async findOne(
        @Param("id") id: string,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.folderService.findOne(id, userId);
    }

    /**
     * Update folder
     */
    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() dto: UpdateFolderDto,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.folderService.update(id, userId, dto);
    }

    /**
     * Delete folder
     */
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param("id") id: string,
        @Headers("x-user-id") userId: string
    ): Promise<void> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        await this.folderService.delete(id, userId);
    }

    /**
     * Move QR code to folder
     */
    @Patch(":folderId/qr/:qrId")
    async moveQRToFolder(
        @Param("folderId") folderId: string,
        @Param("qrId") qrId: string,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.folderService.moveQR(qrId, folderId, userId);
    }

    /**
     * Move QR code to root (no folder)
     */
    @Patch("root/qr/:qrId")
    async moveQRToRoot(
        @Param("qrId") qrId: string,
        @Headers("x-user-id") userId: string
    ): Promise<any> {
        if (!userId) {
            throw new BadRequestException("User ID required");
        }
        return this.folderService.moveQR(qrId, null, userId);
    }
}

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { FolderService } from "./folder.service";
import { CreateFolderDto, UpdateFolderDto, MoveQRToFolderDto } from "./dto/folder.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("folders")
@UseGuards(JwtAuthGuard)
export class FolderController {
    constructor(private readonly folderService: FolderService) { }

    /**
     * Create new folder
     */
    @Post()
    async create(
        @Body() dto: CreateFolderDto,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.folderService.create(userId, dto);
    }

    /**
     * Get all folders as tree
     */
    @Get()
    async findAll(@CurrentUser("id") userId: string): Promise<any> {
        return this.folderService.findTree(userId);
    }

    /**
     * Get all folders as flat list
     */
    @Get("list")
    async findList(@CurrentUser("id") userId: string): Promise<any> {
        return this.folderService.findAll(userId);
    }

    /**
     * Get single folder
     */
    @Get(":id")
    async findOne(
        @Param("id") id: string,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.folderService.findOne(id, userId);
    }

    /**
     * Update folder
     */
    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() dto: UpdateFolderDto,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.folderService.update(id, userId, dto);
    }

    /**
     * Delete folder
     */
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param("id") id: string,
        @CurrentUser("id") userId: string
    ): Promise<void> {
        await this.folderService.delete(id, userId);
    }

    /**
     * Move QR code to folder
     */
    @Patch(":folderId/qr/:qrId")
    async moveQRToFolder(
        @Param("folderId") folderId: string,
        @Param("qrId") qrId: string,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.folderService.moveQR(qrId, folderId, userId);
    }

    /**
     * Move QR code to root (no folder)
     */
    @Patch("root/qr/:qrId")
    async moveQRToRoot(
        @Param("qrId") qrId: string,
        @CurrentUser("id") userId: string
    ): Promise<any> {
        return this.folderService.moveQR(qrId, null, userId);
    }
}

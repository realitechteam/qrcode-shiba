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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrController = void 0;
const common_1 = require("@nestjs/common");
const qr_service_1 = require("./qr.service");
const qr_dto_1 = require("./dto/qr.dto");
let QrController = class QrController {
    qrService;
    constructor(qrService) {
        this.qrService = qrService;
    }
    /**
     * Generate preview (no save)
     */
    async generatePreview(dto) {
        return this.qrService.generatePreview(dto);
    }
    /**
     * Create and save QR code
     */
    async create(dto, userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.qrService.create(userId, dto);
    }
    /**
     * Get all QR codes for user
     */
    async findAll(userId, page, limit, type, folderId, search) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.qrService.findAll(userId, {
            page: page || 1,
            limit: limit || 20,
            type,
            folderId,
            search,
        });
    }
    /**
     * Get single QR code
     */
    async findOne(id, userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.qrService.findOne(id, userId);
    }
    /**
     * Update QR code
     */
    async update(id, dto, userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.qrService.update(id, userId, dto);
    }
    /**
     * Delete QR code
     */
    async remove(id, userId) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        await this.qrService.remove(id, userId);
    }
    /**
     * Download QR code
     */
    async download(id, format = "png", size = 1024, userId, res) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        const { buffer, mimeType, filename } = await this.qrService.download(id, userId, format, size);
        res.set({
            "Content-Type": mimeType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": buffer.length,
        });
        res.send(buffer);
    }
    /**
     * Get QR code stats
     */
    async getStats(id, userId, period = "30d") {
        if (!userId) {
            throw new common_1.BadRequestException("User ID required");
        }
        return this.qrService.getStats(id, userId, period);
    }
};
exports.QrController = QrController;
__decorate([
    (0, common_1.Post)("preview"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [qr_dto_1.GeneratePreviewDto]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "generatePreview", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [qr_dto_1.CreateQRDto, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)("x-user-id")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Query)("type")),
    __param(4, (0, common_1.Query)("folder")),
    __param(5, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, qr_dto_1.UpdateQRDto, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(":id/download"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("format")),
    __param(2, (0, common_1.Query)("size")),
    __param(3, (0, common_1.Headers)("x-user-id")),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, Object]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "download", null);
__decorate([
    (0, common_1.Get)(":id/stats"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Headers)("x-user-id")),
    __param(2, (0, common_1.Query)("period")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "getStats", null);
exports.QrController = QrController = __decorate([
    (0, common_1.Controller)("qr"),
    __metadata("design:paramtypes", [qr_service_1.QrService])
], QrController);

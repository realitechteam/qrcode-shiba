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
exports.GeneratePreviewDto = exports.UpdateQRDto = exports.CreateQRDto = exports.StylingDto = exports.QRTypeEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var QRTypeEnum;
(function (QRTypeEnum) {
    QRTypeEnum["URL"] = "URL";
    QRTypeEnum["TEXT"] = "TEXT";
    QRTypeEnum["VCARD"] = "VCARD";
    QRTypeEnum["WIFI"] = "WIFI";
    QRTypeEnum["EMAIL"] = "EMAIL";
    QRTypeEnum["SMS"] = "SMS";
    QRTypeEnum["PHONE"] = "PHONE";
    QRTypeEnum["LOCATION"] = "LOCATION";
})(QRTypeEnum || (exports.QRTypeEnum = QRTypeEnum = {}));
class StylingDto {
    foregroundColor;
    backgroundColor;
    gradientType;
    gradientColors;
    gradientDirection;
    dotsStyle;
    cornersSquareStyle;
    cornersDotStyle;
    frameStyle;
    frameColor;
    frameText;
}
exports.StylingDto = StylingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "foregroundColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "gradientType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StylingDto.prototype, "gradientColors", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StylingDto.prototype, "gradientDirection", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "dotsStyle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "cornersSquareStyle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "cornersDotStyle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "frameStyle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "frameColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StylingDto.prototype, "frameText", void 0);
class CreateQRDto {
    name;
    type;
    data;
    isDynamic;
    styling;
    folderId;
}
exports.CreateQRDto = CreateQRDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQRDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(QRTypeEnum),
    __metadata("design:type", String)
], CreateQRDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateQRDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateQRDto.prototype, "isDynamic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StylingDto),
    __metadata("design:type", StylingDto)
], CreateQRDto.prototype, "styling", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQRDto.prototype, "folderId", void 0);
class UpdateQRDto {
    name;
    data;
    styling;
    destinationUrl;
    folderId;
}
exports.UpdateQRDto = UpdateQRDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQRDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateQRDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StylingDto),
    __metadata("design:type", StylingDto)
], UpdateQRDto.prototype, "styling", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQRDto.prototype, "destinationUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQRDto.prototype, "folderId", void 0);
class GeneratePreviewDto {
    type;
    data;
    styling;
    size;
}
exports.GeneratePreviewDto = GeneratePreviewDto;
__decorate([
    (0, class_validator_1.IsEnum)(QRTypeEnum),
    __metadata("design:type", String)
], GeneratePreviewDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeneratePreviewDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StylingDto),
    __metadata("design:type", StylingDto)
], GeneratePreviewDto.prototype, "styling", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GeneratePreviewDto.prototype, "size", void 0);

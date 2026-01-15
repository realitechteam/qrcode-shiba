"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VnpayModule = void 0;
const common_1 = require("@nestjs/common");
const vnpay_controller_1 = require("./vnpay.controller");
const vnpay_service_1 = require("./vnpay.service");
let VnpayModule = class VnpayModule {
};
exports.VnpayModule = VnpayModule;
exports.VnpayModule = VnpayModule = __decorate([
    (0, common_1.Module)({
        controllers: [vnpay_controller_1.VnpayController],
        providers: [vnpay_service_1.VnpayService],
        exports: [vnpay_service_1.VnpayService],
    })
], VnpayModule);

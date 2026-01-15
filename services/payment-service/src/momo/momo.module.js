"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomoModule = void 0;
const common_1 = require("@nestjs/common");
const momo_controller_1 = require("./momo.controller");
const momo_service_1 = require("./momo.service");
let MomoModule = class MomoModule {
};
exports.MomoModule = MomoModule;
exports.MomoModule = MomoModule = __decorate([
    (0, common_1.Module)({
        controllers: [momo_controller_1.MomoController],
        providers: [momo_service_1.MomoService],
        exports: [momo_service_1.MomoService],
    })
], MomoModule);

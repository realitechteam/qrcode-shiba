import { Module } from "@nestjs/common";
import { MomoController } from "./momo.controller";
import { MomoService } from "./momo.service";

@Module({
    controllers: [MomoController],
    providers: [MomoService],
    exports: [MomoService],
})
export class MomoModule { }

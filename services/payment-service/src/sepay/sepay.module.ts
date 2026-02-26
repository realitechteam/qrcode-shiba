import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SepayService } from "./sepay.service";
import { SepayController } from "./sepay.controller";

@Module({
    imports: [ConfigModule],
    controllers: [SepayController],
    providers: [SepayService],
    exports: [SepayService],
})
export class SepayModule { }

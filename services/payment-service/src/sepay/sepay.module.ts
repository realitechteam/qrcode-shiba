import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SepayService } from "./sepay.service";
import { SepayController } from "./sepay.controller";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
    imports: [ConfigModule, SubscriptionModule],
    controllers: [SepayController],
    providers: [SepayService],
    exports: [SepayService],
})
export class SepayModule { }

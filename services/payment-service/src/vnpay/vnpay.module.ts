import { Module } from "@nestjs/common";
import { VnpayController } from "./vnpay.controller";
import { VnpayService } from "./vnpay.service";

@Module({
    controllers: [VnpayController],
    providers: [VnpayService],
    exports: [VnpayService],
})
export class VnpayModule { }

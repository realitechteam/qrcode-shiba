import { Module } from "@nestjs/common";
import { RedirectController } from "./redirect.controller";
import { RedirectService } from "./redirect.service";
import { TrackingService } from "./tracking.service";

@Module({
    controllers: [RedirectController],
    providers: [RedirectService, TrackingService],
})
export class RedirectModule { }

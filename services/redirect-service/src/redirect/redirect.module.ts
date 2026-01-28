import { Module } from "@nestjs/common";
import { RedirectController } from "./redirect.controller";
import { RedirectService } from "./redirect.service";
import { TrackingService } from "./tracking.service";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

@Module({
    controllers: [RedirectController, AnalyticsController],
    providers: [RedirectService, TrackingService, AnalyticsService],
})
export class RedirectModule { }

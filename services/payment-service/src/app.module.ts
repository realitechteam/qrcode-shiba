import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { SharedModule } from "./shared/shared.module";
import { SepayModule } from "./sepay/sepay.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { AffiliateModule } from "./affiliate/affiliate.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [
                "../../.env.local",
                "../../.env",
                ".env.local",
                ".env"
            ],
        }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),
        PrismaModule,
        AuthModule,
        SharedModule,
        SepayModule,
        SubscriptionModule,
        AffiliateModule,
    ],
})
export class AppModule { }

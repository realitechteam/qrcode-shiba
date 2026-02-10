import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { VnpayModule } from "./vnpay/vnpay.module";
import { MomoModule } from "./momo/momo.module";
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
        PrismaModule,
        VnpayModule,
        MomoModule,
        SepayModule,
        SubscriptionModule,
        AffiliateModule,
    ],
})
export class AppModule { }

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { VnpayModule } from "./vnpay/vnpay.module";
import { MomoModule } from "./momo/momo.module";
import { SubscriptionModule } from "./subscription/subscription.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env.local", ".env"],
        }),
        PrismaModule,
        VnpayModule,
        MomoModule,
        SubscriptionModule,
    ],
})
export class AppModule { }

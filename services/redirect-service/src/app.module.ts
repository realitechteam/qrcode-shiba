import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { RedirectModule } from "./redirect/redirect.module";
import { PrismaModule } from "./prisma/prisma.module";
import { NotificationModule } from "./notification/notification.module";

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
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),
        PrismaModule,
        RedirectModule,
        NotificationModule,
    ],
})
export class AppModule { }

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
        PrismaModule,
        RedirectModule,
        NotificationModule,
    ],
})
export class AppModule { }

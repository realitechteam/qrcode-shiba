import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedirectModule } from "./redirect/redirect.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env.local", ".env"],
        }),
        PrismaModule,
        RedirectModule,
    ],
})
export class AppModule { }

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { QrModule } from "./qr/qr.module";
import { GeneratorModule } from "./generator/generator.module";
import { PrismaModule } from "./prisma/prisma.module";
import { FolderModule } from "./folder/folder.module";
import { BulkModule } from "./bulk/bulk.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env.local", ".env"],
        }),
        PrismaModule,
        GeneratorModule,
        QrModule,
        FolderModule,
        BulkModule,
    ],
})
export class AppModule { }

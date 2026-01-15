import { Module } from "@nestjs/common";
import { QrController } from "./qr.controller";
import { QrService } from "./qr.service";
import { GeneratorModule } from "../generator/generator.module";

@Module({
    imports: [GeneratorModule],
    controllers: [QrController],
    providers: [QrService],
})
export class QrModule { }

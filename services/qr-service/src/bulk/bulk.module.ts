import { Module } from "@nestjs/common";
import { BulkController } from "./bulk.controller";
import { BulkService } from "./bulk.service";
import { GeneratorModule } from "../generator/generator.module";

@Module({
    imports: [GeneratorModule],
    controllers: [BulkController],
    providers: [BulkService],
    exports: [BulkService],
})
export class BulkModule { }

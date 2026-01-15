import { Module } from "@nestjs/common";
import { GeneratorService } from "./generator.service";
import { StylerService } from "./styler.service";
import { RendererService } from "./renderer.service";

@Module({
    providers: [GeneratorService, StylerService, RendererService],
    exports: [GeneratorService, StylerService, RendererService],
})
export class GeneratorModule { }

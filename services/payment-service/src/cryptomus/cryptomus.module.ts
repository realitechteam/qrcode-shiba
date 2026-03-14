import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CryptomusService } from "./cryptomus.service";
import { CryptomusController } from "./cryptomus.controller";

@Module({
    imports: [ConfigModule],
    controllers: [CryptomusController],
    providers: [CryptomusService],
    exports: [CryptomusService],
})
export class CryptomusModule {}

import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@qrcode-shiba/database";
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map
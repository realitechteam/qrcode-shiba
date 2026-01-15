"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get("PORT", 3001);
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // CORS
    app.enableCors({
        origin: configService.get("FRONTEND_URL", "http://localhost:3000"),
        credentials: true,
    });
    // Global prefix
    app.setGlobalPrefix("api/v1");
    await app.listen(port);
    console.log(`🚀 Auth service is running on http://localhost:${port}`);
}
bootstrap();

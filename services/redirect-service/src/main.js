"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get("PORT", 3003);
    // CORS - allow from anywhere since this is a public redirect service
    app.enableCors({
        origin: "*",
    });
    await app.listen(port);
    console.log(`🔗 Redirect service is running on http://localhost:${port}`);
}
bootstrap();

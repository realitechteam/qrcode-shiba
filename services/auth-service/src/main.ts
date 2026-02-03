import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>("PORT", 3001);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        })
    );

    // CORS
    app.enableCors({
        origin: [
            "http://localhost:3000",
            "https://shiba.pw",
            "https://www.shiba.pw",
            configService.get<string>("FRONTEND_URL"),
        ].filter(Boolean),
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix("api/v1");

    await app.listen(port);
    console.log(`🚀 Auth service is running on http://localhost:${port}`);
}

bootstrap();

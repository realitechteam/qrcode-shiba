import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>("PORT", 3002);

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
        origin: configService.get<string>("FRONTEND_URL", "http://localhost:3000"),
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix("api/v1");

    await app.listen(port);
    console.log(`🎨 QR service is running on http://localhost:${port}`);
}

bootstrap();

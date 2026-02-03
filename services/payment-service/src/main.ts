import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>("PORT", 3004);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    app.enableCors({
        origin: [
            "http://localhost:3000",
            "https://shiba.pw",
            "https://www.shiba.pw",
            configService.get<string>("FRONTEND_URL"),
        ].filter(Boolean),
        credentials: true,
    });

    app.setGlobalPrefix("api/v1");

    await app.listen(port);
    console.log(`💳 Payment service is running on http://localhost:${port}`);
}

bootstrap();

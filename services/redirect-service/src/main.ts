import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>("PORT", 3003);

    // Security headers
    app.use(helmet());

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    // CORS - allow from anywhere since this is a public redirect service
    app.enableCors({
        origin: "*",
    });

    await app.listen(port);
    console.log(`🔗 Redirect service is running on http://localhost:${port}`);
}

bootstrap();

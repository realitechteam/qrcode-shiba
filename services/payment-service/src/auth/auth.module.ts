import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>("JWT_ACCESS_SECRET");
                if (!secret) {
                    throw new Error("JWT_ACCESS_SECRET environment variable is required");
                }
                return { secret };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [JwtStrategy],
    exports: [PassportModule, JwtModule],
})
export class AuthModule {}

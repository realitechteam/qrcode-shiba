import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { User, AuthProvider } from "@qrcode-shiba/database";
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            avatarUrl: string | null;
            authProvider: import("@prisma/client").$Enums.AuthProvider;
            providerId: string | null;
            emailVerified: boolean;
            tier: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    validateUser(email: string, password: string): Promise<User | null>;
    login(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            avatarUrl: string | null;
            authProvider: import("@prisma/client").$Enums.AuthProvider;
            providerId: string | null;
            emailVerified: boolean;
            tier: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        avatarUrl: string | null;
        authProvider: import("@prisma/client").$Enums.AuthProvider;
        providerId: string | null;
        emailVerified: boolean;
        tier: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateOAuthUser(email: string, name: string, providerId: string, provider: AuthProvider): Promise<User>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    private generateTokens;
    private sanitizeUser;
}
//# sourceMappingURL=auth.service.d.ts.map
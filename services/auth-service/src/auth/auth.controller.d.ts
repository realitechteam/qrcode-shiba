import { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(loginDto: LoginDto, req: any): Promise<{
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
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getMe(user: any): Promise<{
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
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, password: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map
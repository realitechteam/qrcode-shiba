import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(email: string, password: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        passwordHash: string | null;
        avatarUrl: string | null;
        authProvider: import("@prisma/client").$Enums.AuthProvider;
        providerId: string | null;
        emailVerified: boolean;
        tier: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
//# sourceMappingURL=local.strategy.d.ts.map
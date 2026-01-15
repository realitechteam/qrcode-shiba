import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(userId: string): Promise<{
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
    } | null>;
    updateMe(userId: string, updateUserDto: UpdateUserDto): Promise<{
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
    deleteMe(userId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map
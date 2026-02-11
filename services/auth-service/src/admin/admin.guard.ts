import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.id) {
            throw new ForbiddenException("Authentication required");
        }

        // Check role from database to ensure it's always up-to-date
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (!dbUser || dbUser.role !== "ADMIN") {
            throw new ForbiddenException("Admin access required");
        }

        return true;
    }
}

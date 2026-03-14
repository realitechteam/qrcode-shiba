import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User, Prisma } from "@qrcode-shiba/database";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    /** Standard include for user queries — subscription + latest completed order */
    private static readonly USER_INCLUDE = {
        subscription: true,
        orders: {
            where: { status: 'COMPLETED' as const },
            orderBy: { createdAt: 'desc' as const },
            take: 1,
        },
    } as const;

    async create(data: Prisma.UserCreateInput) {
        // Ensure email is lowercase
        if (data.email) {
            data.email = data.email.toLowerCase();
        }

        return this.prisma.user.create({
            data,
            include: UsersService.USER_INCLUDE,
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: UsersService.USER_INCLUDE,
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: UsersService.USER_INCLUDE,
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput) {
        // Ensure email is lowercase if being updated
        if (data.email && typeof data.email === 'string') {
            data.email = data.email.toLowerCase();
        }

        return this.prisma.user.update({
            where: { id },
            data,
            include: UsersService.USER_INCLUDE,
        });
    }

    async delete(id: string): Promise<User> {
        // Get user email and QR code IDs for cleaning up related data
        const user = await this.prisma.user.findUnique({ where: { id }, select: { email: true } });
        const qrCodes = await this.prisma.qRCode.findMany({ where: { userId: id }, select: { id: true } });
        const qrIds = qrCodes.map((qr) => qr.id);

        // Clean up all related data before deleting the user
        await this.prisma.$transaction([
            this.prisma.refreshToken.deleteMany({ where: { userId: id } }),
            ...(user ? [this.prisma.verificationToken.deleteMany({ where: { email: user.email } })] : []),
            this.prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
            ...(user ? [this.prisma.magicLink.deleteMany({ where: { email: user.email } })] : []),
            this.prisma.subscription.deleteMany({ where: { userId: id } }),
            this.prisma.order.deleteMany({ where: { userId: id } }),
            this.prisma.apiKey.deleteMany({ where: { userId: id } }),
            // Delete scans and content for user's QR codes
            ...(qrIds.length > 0
                ? [
                    this.prisma.scan.deleteMany({ where: { qrId: { in: qrIds } } }),
                    this.prisma.qRContent.deleteMany({ where: { qrId: { in: qrIds } } }),
                  ]
                : []),
            this.prisma.qRCode.deleteMany({ where: { userId: id } }),
            this.prisma.folder.deleteMany({ where: { userId: id } }),
            this.prisma.teamMember.deleteMany({ where: { userId: id } }),
            this.prisma.user.delete({ where: { id } }),
        ]);

        return { id } as User;
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }
}

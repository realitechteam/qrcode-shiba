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
        return this.prisma.user.delete({
            where: { id },
        });
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


import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

// Mock uuid
jest.mock("uuid", () => ({
    v4: () => "test-uuid",
}));

describe("AuthService", () => {
    let service: AuthService;
    let usersService: Partial<UsersService>;
    let emailService: Partial<EmailService>;
    let prismaService: Partial<PrismaService>;

    beforeEach(async () => {
        usersService = {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
        };
        emailService = {
            sendMagicLink: jest.fn().mockResolvedValue(true),
        };
        prismaService = {
            magicLink: {
                upsert: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            } as any,
            refreshToken: {
                create: jest.fn(),
                delete: jest.fn(),
                findFirst: jest.fn(),
                deleteMany: jest.fn(),
            } as any,
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: { sign: jest.fn(() => "token"), verify: jest.fn() } },
                { provide: ConfigService, useValue: { get: jest.fn() } },
                { provide: EmailService, useValue: emailService },
                { provide: PrismaService, useValue: prismaService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("register", () => {
        it("should lowercase email before checking existence", async () => {
            const registerDto = { email: "TEST@example.com", password: "password", name: "Test" };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
            (usersService.create as jest.Mock).mockResolvedValue({
                id: "1",
                email: "test@example.com",
                passwordHash: "hash",
                role: "USER",
                tier: "FREE",
                authProvider: "EMAIL",
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as User);

            await service.register(registerDto);

            expect(usersService.findByEmail).toHaveBeenCalledWith("test@example.com");
            expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
                email: "test@example.com"
            }));
        });
    });

    describe("validateUser", () => {
        it("should lowercase email before finding user", async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue({
                id: "1",
                email: "test@example.com",
                passwordHash: "hash" // Mock hash needs to match or we check calls before validation
            } as User);

            // We just want to verify findByEmail call
            try {
                await service.validateUser("TEST@example.com", "password");
            } catch (e) { }

            expect(usersService.findByEmail).toHaveBeenCalledWith("test@example.com");
        });
    });

    describe("requestMagicLink", () => {
        it("should lowercase email before sending", async () => {
            await service.requestMagicLink("TEST@example.com");
            expect(emailService.sendMagicLink).toHaveBeenCalledWith("test@example.com", expect.any(String));
        });
    });
});

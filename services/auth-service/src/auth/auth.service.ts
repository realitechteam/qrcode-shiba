import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "./email.service";
import { RegisterDto } from "./dto/register.dto";
import { User, AuthProvider } from "@qrcode-shiba/database";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 12);

        const user = await this.usersService.create({
            email: registerDto.email,
            passwordHash: hashedPassword,
            name: registerDto.name,
            authProvider: AuthProvider.EMAIL,
        });

        // TODO: Send verification email

        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.passwordHash) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async login(user: User) {
        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_SECRET") || "dev-refresh-secret-change-in-production",
            });

            // Check if refresh token exists in database
            const storedToken = await this.prisma.refreshToken.findFirst({
                where: {
                    token: refreshToken,
                    userId: payload.sub,
                    expiresAt: { gt: new Date() },
                },
            });

            if (!storedToken) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException("User not found");
            }

            // Delete old refresh token
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });

            // Generate new tokens
            return this.generateTokens(user);
        } catch {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    async logout(userId: string) {
        // Delete all refresh tokens for user
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        return { message: "Logged out successfully" };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return this.sanitizeUser(user);
    }

    async validateOAuthUser(
        email: string,
        name: string,
        providerId: string,
        provider: AuthProvider
    ): Promise<User> {
        let user = await this.usersService.findByEmail(email);

        if (!user) {
            user = await this.usersService.create({
                email,
                name,
                providerId,
                authProvider: provider,
                emailVerified: true,
            });
        } else if (user.authProvider !== provider) {
            // User exists with different provider
            throw new ConflictException(
                `Email already registered with ${user.authProvider}`
            );
        }

        return user;
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists
            return { message: "If email exists, reset link will be sent" };
        }

        // TODO: Generate reset token and send email

        return { message: "If email exists, reset link will be sent" };
    }

    async resetPassword(token: string, newPassword: string) {
        // TODO: Validate token and update password
        throw new BadRequestException("Not implemented");
    }

    async verifyEmail(token: string) {
        // TODO: Validate token and mark email as verified
        throw new BadRequestException("Not implemented");
    }

    /**
     * Request magic link for passwordless login/registration
     */
    async requestMagicLink(email: string) {
        // Generate a unique token
        const token = nanoid(32);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store magic link token in database
        await this.prisma.magicLink.upsert({
            where: { email },
            update: { token, expiresAt },
            create: { email, token, expiresAt },
        });

        // Send email with magic link
        await this.emailService.sendMagicLink(email, token);

        return { message: "Magic link sent to your email" };
    }

    /**
     * Verify magic link and login/register user
     */
    async verifyMagicLink(token: string) {
        // Find the magic link
        const magicLink = await this.prisma.magicLink.findUnique({
            where: { token },
        });

        if (!magicLink) {
            throw new BadRequestException("Invalid or expired magic link");
        }

        if (magicLink.expiresAt < new Date()) {
            // Delete expired token
            await this.prisma.magicLink.delete({ where: { token } });
            throw new BadRequestException("Magic link has expired");
        }

        // Find or create user
        let user = await this.usersService.findByEmail(magicLink.email);

        if (!user) {
            // Create new user with magic link provider
            user = await this.usersService.create({
                email: magicLink.email,
                authProvider: AuthProvider.EMAIL,
                emailVerified: true,
            });
        } else {
            // Mark email as verified if not already
            if (!user.emailVerified) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { emailVerified: true },
                });
            }
        }

        // Delete used magic link
        await this.prisma.magicLink.delete({ where: { token } });

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    // Sync Firebase user with backend database
    async syncFirebaseUser(
        email: string,
        name: string | null,
        firebaseUid: string,
        photoUrl: string | null
    ) {
        // Try to find existing user by email
        let user = await this.usersService.findByEmail(email);

        if (!user) {
            // Create new user with Firebase provider
            user = await this.usersService.create({
                email,
                name: name || undefined,
                providerId: firebaseUid,
                authProvider: AuthProvider.GOOGLE,
                emailVerified: true,
                avatarUrl: photoUrl || undefined,
            });
        } else {
            // Update existing user's Firebase info if needed
            if (!user.providerId) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        providerId: firebaseUid,
                        authProvider: AuthProvider.GOOGLE,
                        avatarUrl: photoUrl || user.avatarUrl,
                        name: name || user.name,
                    },
                });
            }
        }

        // Generate tokens for this user
        const tokens = await this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    private async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_SECRET") || "dev-refresh-secret-change-in-production",
            expiresIn: "7d",
        });

        // Store refresh token in database
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private sanitizeUser(user: User) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }

}

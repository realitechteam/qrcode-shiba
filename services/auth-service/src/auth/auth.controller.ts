import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Req,
    Res,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("register")
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard("local"))
    async login(@Body() loginDto: LoginDto, @Req() req: any) {
        return this.authService.login(req.user);
    }

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async logout(@CurrentUser("id") userId: string) {
        return this.authService.logout(userId);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async getMe(@CurrentUser() user: any) {
        return this.authService.getProfile(user.id);
    }

    // Google OAuth
    @Get("google")
    @UseGuards(AuthGuard("google"))
    async googleAuth() {
        // Initiates Google OAuth flow
    }

    @Get("google/callback")
    @UseGuards(AuthGuard("google"))
    async googleAuthCallback(@Req() req: any, @Res() res: Response) {
        const tokens = await this.authService.login(req.user);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(
            `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
        );
    }

    @Post("forgot-password")
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body("email") email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post("reset-password")
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body("token") token: string,
        @Body("password") password: string
    ) {
        return this.authService.resetPassword(token, password);
    }

    @Post("verify-email")
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body("token") token: string) {
        return this.authService.verifyEmail(token);
    }
}

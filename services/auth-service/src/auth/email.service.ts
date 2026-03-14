import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private resend: Resend | null = null;
    private readonly fromEmail: string;
    private readonly frontendUrl: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>("RESEND_API_KEY");

        if (!apiKey || apiKey === "re_dummy_key") {
            this.logger.warn("RESEND_API_KEY not set - emails will be logged only");
        } else {
            try {
                this.resend = new Resend(apiKey);
            } catch (err) {
                this.logger.error("Failed to initialize Resend:", err);
            }
        }

        this.fromEmail = this.configService.get<string>("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
        this.frontendUrl = this.configService.get<string>("FRONTEND_URL") || "https://www.shiba.pw";
    }

    /**
     * Send magic link email for passwordless login
     */
    async sendMagicLink(email: string, token: string): Promise<boolean> {
        const magicLinkUrl = `${this.frontendUrl}/verify?token=${token}`;

        // ... (html content skipped for brevity) ...

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐕 QRCode-Shiba</h1>
        </div>
        <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px;">Đăng nhập vào tài khoản của bạn</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 24px;">
                Nhấn nút bên dưới để đăng nhập vào QRCode-Shiba. Link này sẽ hết hạn sau 15 phút.
            </p>
            <a href="${magicLinkUrl}" style="display: block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; font-size: 16px;">
                Đăng nhập ngay
            </a>
            <p style="color: #999; font-size: 12px; margin: 24px 0 0; text-align: center;">
                Nếu bạn không yêu cầu email này, hãy bỏ qua nó.
            </p>
        </div>
        <div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2026 QRCode-Shiba. Tạo mã QR thông minh.
            </p>
        </div>
    </div>
</body>
</html>`;

        try {
            // If no Resend client (no API key), just log
            if (!this.resend) {
                this.logger.log(`[DEV] Magic link for ${email}: ${magicLinkUrl}`);
                return true;
            }

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: "Đăng nhập vào QRCode-Shiba",
                html,
            });

            if (result.error) {
                this.logger.error(`Failed to send magic link to ${email}:`, result.error);
                return false;
            }

            this.logger.log(`Magic link email sent to ${email}: ${result.data?.id}`);
            return true;
        } catch (error: any) {
            this.logger.error(`Failed to send magic link to ${email}:`, error?.message || error);
            return false;
        }
    }

    /**
     * Send email verification link
     */
    async sendVerificationEmail(email: string, token: string): Promise<boolean> {
        const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐕 QRCode-Shiba</h1>
        </div>
        <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px;">Xác thực email của bạn</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 24px;">
                Nhấn nút bên dưới để xác thực email của bạn. Link này sẽ hết hạn sau 24 giờ.
            </p>
            <a href="${verifyUrl}" style="display: block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; font-size: 16px;">
                Xác thực email
            </a>
            <p style="color: #999; font-size: 12px; margin: 24px 0 0; text-align: center;">
                Nếu bạn không yêu cầu email này, hãy bỏ qua nó.
            </p>
        </div>
        <div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2026 QRCode-Shiba. Tạo mã QR thông minh.
            </p>
        </div>
    </div>
</body>
</html>`;

        try {
            if (!this.resend) {
                this.logger.log(`[DEV] Verification email for ${email}: ${verifyUrl}`);
                return true;
            }

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: "Xác thực email - QRCode-Shiba",
                html,
            });

            if (result.error) {
                this.logger.error(`Failed to send verification email to ${email}:`, result.error);
                return false;
            }

            this.logger.log(`Verification email sent to ${email}: ${result.data?.id}`);
            return true;
        } catch (error: any) {
            this.logger.error(`Failed to send verification email to ${email}:`, error?.message || error);
            return false;
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐕 QRCode-Shiba</h1>
        </div>
        <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px;">Đặt lại mật khẩu</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 24px;">
                Nhấn nút bên dưới để đặt lại mật khẩu của bạn. Link này sẽ hết hạn sau 1 giờ.
            </p>
            <a href="${resetUrl}" style="display: block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; font-size: 16px;">
                Đặt lại mật khẩu
            </a>
            <p style="color: #999; font-size: 12px; margin: 24px 0 0; text-align: center;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
            </p>
        </div>
        <div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2026 QRCode-Shiba. Tạo mã QR thông minh.
            </p>
        </div>
    </div>
</body>
</html>`;

        try {
            if (!this.resend) {
                this.logger.log(`[DEV] Password reset email for ${email}: ${resetUrl}`);
                return true;
            }

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: "Đặt lại mật khẩu - QRCode-Shiba",
                html,
            });

            if (result.error) {
                this.logger.error(`Failed to send password reset email to ${email}:`, result.error);
                return false;
            }

            this.logger.log(`Password reset email sent to ${email}: ${result.data?.id}`);
            return true;
        } catch (error: any) {
            this.logger.error(`Failed to send password reset email to ${email}:`, error?.message || error);
            return false;
        }
    }

    /**
     * Send notification email (scan alerts, weekly reports, etc.)
     */
    async sendNotification(
        email: string,
        subject: string,
        title: string,
        content: string
    ): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐕 QRCode-Shiba</h1>
        </div>
        <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px;">${title}</h2>
            <div style="color: #666; line-height: 1.6;">
                ${content}
            </div>
            <a href="${this.frontendUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 24px;">
                Xem Dashboard
            </a>
        </div>
        <div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <a href="${this.frontendUrl}/dashboard/settings/notifications" style="color: #9ca3af;">Quản lý thông báo</a>
            </p>
        </div>
    </div>
</body>
</html>`;

        try {
            if (!this.configService.get<string>("RESEND_API_KEY")) {
                this.logger.log(`[DEV] Notification to ${email}: ${subject}`);
                return true;
            }

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject,
                html,
            });

            this.logger.log(`Notification sent to ${email}: ${result.data?.id}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send notification to ${email}:`, error);
            return false;
        }
    }

    /**
     * Send weekly scan report
     */
    async sendWeeklyReport(
        email: string,
        stats: { totalScans: number; topQR: string; growth: number }
    ): Promise<boolean> {
        const growthEmoji = stats.growth >= 0 ? "📈" : "📉";
        const growthText = stats.growth >= 0 ? `+${stats.growth}%` : `${stats.growth}%`;

        const content = `
            <p>Dưới đây là báo cáo tuần của bạn:</p>
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 16px 0;">
                <p style="margin: 0 0 12px;"><strong>Tổng lượt quét:</strong> ${stats.totalScans.toLocaleString()}</p>
                <p style="margin: 0 0 12px;"><strong>QR được quét nhiều nhất:</strong> ${stats.topQR}</p>
                <p style="margin: 0;"><strong>Tăng trưởng:</strong> ${growthEmoji} ${growthText}</p>
            </div>
        `;

        return this.sendNotification(
            email,
            "📊 Báo cáo tuần QRCode-Shiba",
            "Báo cáo tuần của bạn",
            content
        );
    }
}

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { PrismaService } from "../prisma/prisma.service";

export interface ScanAlertData {
    qrId: string;
    qrName: string;
    scanCount: number;
    location?: string;
    deviceType?: string;
}

export interface WeeklyReportData {
    userId: string;
    email: string;
    totalScans: number;
    topQRCodes: Array<{ name: string; scans: number }>;
    topLocations: Array<{ country: string; count: number }>;
    growthPercentage: number;
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private resend: Resend | null = null;
    private readonly fromEmail: string;
    private readonly frontendUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) {
        const apiKey = this.configService.get<string>("RESEND_API_KEY");
        
        if (apiKey && apiKey !== "re_dummy_key") {
            try {
                this.resend = new Resend(apiKey);
            } catch (err) {
                this.logger.error("Failed to initialize Resend:", err);
            }
        }
        
        this.fromEmail = this.configService.get<string>("RESEND_FROM_EMAIL") || "QRCode-Shiba <noreply@shiba.pw>";
        this.frontendUrl = this.configService.get<string>("FRONTEND_URL") || "https://www.shiba.pw";
    }

    /**
     * Send scan alert email when QR code reaches scan threshold
     */
    async sendScanAlert(email: string, data: ScanAlertData): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Thông báo quét QR</h1>
        </div>
        <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px;">${data.qrName}</h2>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 36px; font-weight: bold; color: #10b981; text-align: center;">
                    ${data.scanCount}
                </p>
                <p style="margin: 8px 0 0; text-align: center; color: #666;">lượt quét</p>
            </div>
            ${data.location ? `<p style="color: #666; margin: 0 0 8px;">📍 Vị trí: ${data.location}</p>` : ""}
            ${data.deviceType ? `<p style="color: #666; margin: 0 0 8px;">📱 Thiết bị: ${data.deviceType}</p>` : ""}
            <a href="${this.frontendUrl}/dashboard/qr/${data.qrId}" style="display: block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; font-size: 16px; margin-top: 24px;">
                Xem chi tiết
            </a>
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
                this.logger.log(`[DEV] Scan alert for ${email}: ${data.qrName} - ${data.scanCount} scans`);
                return true;
            }

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: `🔔 ${data.qrName} đã đạt ${data.scanCount} lượt quét`,
                html,
            });

            this.logger.log(`Scan alert sent to ${email}: ${result.data?.id}`);
            return true;
        } catch (error: any) {
            this.logger.error(`Failed to send scan alert to ${email}:`, error?.message || error);
            return false;
        }
    }

    /**
     * Send weekly report email
     */
    async sendWeeklyReport(data: WeeklyReportData): Promise<boolean> {
        const topQRsHtml = data.topQRCodes
            .slice(0, 5)
            .map((qr, i) => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${i + 1}. ${qr.name}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${qr.scans}</td>
                </tr>
            `)
            .join("");

        const growthColor = data.growthPercentage >= 0 ? "#10b981" : "#ef4444";
        const growthIcon = data.growthPercentage >= 0 ? "📈" : "📉";

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Báo cáo tuần</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">QRCode-Shiba</p>
        </div>
        <div style="padding: 32px;">
            <!-- Stats -->
            <div style="display: flex; gap: 16px; margin-bottom: 32px;">
                <div style="flex: 1; background: #fff7ed; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #f97316;">${data.totalScans.toLocaleString()}</p>
                    <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Tổng lượt quét</p>
                </div>
                <div style="flex: 1; background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${growthColor};">${growthIcon} ${Math.abs(data.growthPercentage)}%</p>
                    <p style="margin: 8px 0 0; color: #666; font-size: 14px;">So với tuần trước</p>
                </div>
            </div>

            <!-- Top QR Codes -->
            <h3 style="margin: 0 0 16px; color: #1a1a1a;">🏆 Top QR Codes</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                    <tr style="background: #f9fafb;">
                        <th style="padding: 12px; text-align: left; font-weight: 600;">Tên</th>
                        <th style="padding: 12px; text-align: right; font-weight: 600;">Lượt quét</th>
                    </tr>
                </thead>
                <tbody>
                    ${topQRsHtml || '<tr><td colspan="2" style="padding: 12px; text-align: center; color: #666;">Chưa có dữ liệu</td></tr>'}
                </tbody>
            </table>

            <a href="${this.frontendUrl}/dashboard/analytics" style="display: block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; font-size: 16px;">
                Xem đầy đủ Analytics
            </a>
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
                this.logger.log(`[DEV] Weekly report for ${data.email}: ${data.totalScans} scans`);
                return true;
            }

            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: data.email,
                subject: `📊 Báo cáo tuần: ${data.totalScans.toLocaleString()} lượt quét`,
                html,
            });

            this.logger.log(`Weekly report sent to ${data.email}: ${result.data?.id}`);
            return true;
        } catch (error: any) {
            this.logger.error(`Failed to send weekly report to ${data.email}:`, error?.message || error);
            return false;
        }
    }

    /**
     * Check if user should receive scan alert based on their settings
     */
    async checkAndSendScanAlert(qrId: string): Promise<void> {
        try {
            const qr = await this.prisma.qRCode.findUnique({
                where: { id: qrId },
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            notificationSettings: true,
                        },
                    },
                    _count: {
                        select: { scans: true },
                    },
                },
            });

            if (!qr || !qr.owner?.email) return;

            const settings = qr.owner.notificationSettings as any;
            if (!settings?.scanAlerts?.enabled) return;

            const threshold = settings.scanAlerts.threshold || 100;
            const scanCount = qr._count?.scans || 0;

            // Only alert at threshold milestones (100, 500, 1000, etc.)
            const milestones = [10, 50, 100, 500, 1000, 5000, 10000];
            const shouldAlert = milestones.some(m => scanCount === m);

            if (shouldAlert) {
                await this.sendScanAlert(qr.owner.email, {
                    qrId: qr.id,
                    qrName: qr.name,
                    scanCount,
                });
            }
        } catch (error) {
            this.logger.error(`Error in checkAndSendScanAlert:`, error);
        }
    }
}

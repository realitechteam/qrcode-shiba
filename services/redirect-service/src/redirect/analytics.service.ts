import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get scans over time grouped by date
     */
    async getScansOverTime(userId: string, period: string) {
        // Calculate date range
        const daysMap: Record<string, number> = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "1y": 365,
        };
        const days = daysMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get user's QR codes
        const userQRs = await this.prisma.qRCode.findMany({
            where: { userId },
            select: { id: true },
        });
        const qrIds = userQRs.map((qr) => qr.id);

        if (qrIds.length === 0) {
            return [];
        }

        // Get scans grouped by date
        const scans = await this.prisma.scan.groupBy({
            by: ["scannedAt"],
            where: {
                qrId: { in: qrIds },
                scannedAt: { gte: startDate },
            },
            _count: { id: true },
        });

        // Aggregate by date
        const dateMap = new Map<string, { scans: number; visitors: number }>();
        
        scans.forEach((scan) => {
            const date = new Date(scan.scannedAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
            });
            const existing = dateMap.get(date) || { scans: 0, visitors: 0 };
            dateMap.set(date, {
                scans: existing.scans + scan._count.id,
                visitors: existing.visitors + Math.ceil(scan._count.id * 0.7), // Estimate unique visitors
            });
        });

        // Fill in missing dates
        const result = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
            });
            const data = dateMap.get(dateStr) || { scans: 0, visitors: 0 };
            result.push({ date: dateStr, ...data });
        }

        return result;
    }

    /**
     * Get device type breakdown
     */
    async getDeviceBreakdown(userId: string, period: string) {
        const daysMap: Record<string, number> = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "1y": 365,
        };
        const days = daysMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const userQRs = await this.prisma.qRCode.findMany({
            where: { userId },
            select: { id: true },
        });
        const qrIds = userQRs.map((qr) => qr.id);

        if (qrIds.length === 0) {
            return [
                { name: "Mobile", value: 0 },
                { name: "Desktop", value: 0 },
                { name: "Tablet", value: 0 },
            ];
        }

        const devices = await this.prisma.scan.groupBy({
            by: ["deviceType"],
            where: {
                qrId: { in: qrIds },
                scannedAt: { gte: startDate },
            },
            _count: { id: true },
        });

        const total = devices.reduce((sum, d) => sum + d._count.id, 0);
        
        return devices.map((d) => ({
            name: d.deviceType || "Unknown",
            value: total > 0 ? Math.round((d._count.id / total) * 100) : 0,
            count: d._count.id,
        }));
    }

    /**
     * Get country breakdown
     */
    async getCountryBreakdown(userId: string, period: string) {
        const daysMap: Record<string, number> = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "1y": 365,
        };
        const days = daysMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const userQRs = await this.prisma.qRCode.findMany({
            where: { userId },
            select: { id: true },
        });
        const qrIds = userQRs.map((qr) => qr.id);

        if (qrIds.length === 0) {
            return [];
        }

        const countries = await this.prisma.scan.groupBy({
            by: ["country"],
            where: {
                qrId: { in: qrIds },
                scannedAt: { gte: startDate },
            },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        });

        const total = countries.reduce((sum, c) => sum + c._count.id, 0);

        return countries.map((c) => ({
            country: c.country || "Unknown",
            count: c._count.id,
            percent: total > 0 ? Math.round((c._count.id / total) * 100) : 0,
        }));
    }

    /**
     * Get overall analytics stats
     */
    async getStats(userId: string, period: string) {
        const daysMap: Record<string, number> = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "1y": 365,
        };
        const days = daysMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const userQRs = await this.prisma.qRCode.findMany({
            where: { userId },
            select: { id: true },
        });
        const qrIds = userQRs.map((qr) => qr.id);

        if (qrIds.length === 0) {
            return {
                totalScans: 0,
                uniqueVisitors: 0,
                avgScansPerDay: 0,
                topCountry: "N/A",
                topDevice: "N/A",
                mobilePercent: 0,
            };
        }

        // Total scans in period
        const totalScans = await this.prisma.scan.count({
            where: {
                qrId: { in: qrIds },
                scannedAt: { gte: startDate },
            },
        });

        // Unique IPs (estimate unique visitors)
        const uniqueIps = await this.prisma.scan.groupBy({
            by: ["ip"],
            where: {
                qrId: { in: qrIds },
                scannedAt: { gte: startDate },
            },
        });

        // Top country
        const topCountry = await this.prisma.scan.groupBy({
            by: ["country"],
            where: {
                qrId: { in: qrIds },
                scannedAt: { gte: startDate },
            },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 1,
        });

        // Device breakdown for mobile %
        const devices = await this.prisma.scan.groupBy({
            by: ["deviceType"],
            where: {
                qrId: { in: qrIds },
                scannedAt: { gte: startDate },
            },
            _count: { id: true },
        });

        const mobileCount = devices.find((d) => d.deviceType === "Mobile")?._count.id || 0;
        const mobilePercent = totalScans > 0 ? Math.round((mobileCount / totalScans) * 100) : 0;

        const topDevice = devices.sort((a, b) => b._count.id - a._count.id)[0]?.deviceType || "N/A";

        return {
            totalScans,
            uniqueVisitors: uniqueIps.length,
            avgScansPerDay: Math.round(totalScans / days),
            topCountry: topCountry[0]?.country || "N/A",
            topDevice,
            mobilePercent,
        };
    }
}

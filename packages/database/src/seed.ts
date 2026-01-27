import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Keep the dotenv config
dotenv.config({ path: path.resolve(__dirname, "../../../.env"), override: true });

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + "connect_timeout=30&pool_timeout=30",
        },
    },
});

async function main() {
    console.log("Seeding plans...");

    const plans = [
        {
            id: "free",
            name: "Free",
            slug: "free",
            description: "Dành cho cá nhân mới bắt đầu",
            priceMonthly: 0,
            priceYearly: 0,
            dynamicQrLimit: 3,
            scanLimit: 100,
            bulkLimit: 0,
            apiAccess: false,
            teamMembers: 1,
            features: JSON.stringify([
                "Doesn't expire",
                "3 dynamic QR codes",
                "100 scans/month",
            ]),
            isActive: true,
            sortOrder: 0,
        },
        {
            id: "pro",
            name: "Pro",
            slug: "pro",
            description: "Dành cho freelancers và startups",
            priceMonthly: 99000,
            priceYearly: 990000,
            dynamicQrLimit: 50,
            scanLimit: 10000,
            bulkLimit: 0,
            apiAccess: false,
            teamMembers: 1,
            features: JSON.stringify([
                "50 dynamic QR codes",
                "10,000 scans/month",
                "Advanced analytics",
                "Custom logo",
            ]),
            isActive: true,
            sortOrder: 1,
        },
        {
            id: "business",
            name: "Business",
            slug: "business",
            description: "Dành cho doanh nghiệp vừa và nhỏ",
            priceMonthly: 299000,
            priceYearly: 2990000,
            dynamicQrLimit: 500,
            scanLimit: 100000,
            bulkLimit: 100,
            apiAccess: true,
            teamMembers: 5,
            features: JSON.stringify([
                "500 dynamic QR codes",
                "100,000 scans/month",
                "API Access",
                "Bulk generation",
            ]),
            isActive: true,
            sortOrder: 2,
        },
        {
            id: "enterprise",
            name: "Enterprise",
            slug: "enterprise",
            description: "Dành cho doanh nghiệp lớn",
            priceMonthly: 999000,
            priceYearly: 9990000,
            dynamicQrLimit: -1,
            scanLimit: -1,
            bulkLimit: -1,
            apiAccess: true,
            teamMembers: -1,
            features: JSON.stringify([
                "Unlimited QR codes",
                "Unlimited scans",
                "Custom domain",
                "SLA 99.9%",
            ]),
            isActive: true,
            sortOrder: 3,
        },
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { id: plan.id },
            update: plan,
            create: plan,
        });
    }

    console.log("Plans seeded!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

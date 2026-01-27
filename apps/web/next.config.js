/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@qrcode-shiba/database"],
    images: {
        domains: ["localhost", "qrcode-shiba.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "**.s3.amazonaws.com",
            },
        ],
    },
    async redirects() {
        return [
            {
                source: "/dashboard",
                destination: "/dashboard/qr",
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            // Redirect Short Links
            {
                source: "/:path((?!dashboard|auth|login|register|forgot-password|reset-password|verify-email|terms|privacy|logo|favicon.ico|_next|static|api).*)",
                destination: `${process.env.REDIRECT_URL || "http://localhost:4001"}/:path`,
            },
            // API Gateway Pattern
            {
                source: "/api/v1/auth/:path*",
                destination: `${process.env.AUTH_SERVICE_URL || "http://localhost:4000"}/auth/:path*`,
            },
            {
                source: "/api/v1/qr/:path*",
                destination: `${process.env.QR_SERVICE_URL || "http://localhost:4002"}/qr/:path*`,
            },
            {
                source: "/api/v1/payments/:path*",
                destination: `${process.env.PAYMENT_SERVICE_URL || "http://localhost:4003"}/:path*`, // Payment service controllers usually have their own prefixes like /sepay
            },
        ];
    },
};

module.exports = nextConfig;

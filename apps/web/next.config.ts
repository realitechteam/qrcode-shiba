import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@qrcode-shiba/database"],
    images: {
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
};

export default nextConfig;

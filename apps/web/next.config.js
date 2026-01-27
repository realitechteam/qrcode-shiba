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
};

module.exports = nextConfig;

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
    title: {
        default: "QRCode-Shiba | Tạo mã QR thông minh",
        template: "%s | QRCode-Shiba",
    },
    description:
        "Nền tảng tạo và quản lý mã QR code hiện đại cho doanh nghiệp Việt Nam. Tạo QR code miễn phí với logo, theo dõi lượt quét, và nhiều tính năng khác.",
    keywords: [
        "QR code",
        "tạo mã QR",
        "QR code generator",
        "QR code với logo",
        "dynamic QR code",
        "QR code Việt Nam",
    ],
    authors: [{ name: "QRCode-Shiba Team" }],
    creator: "QRCode-Shiba",
    openGraph: {
        type: "website",
        locale: "vi_VN",
        url: "https://qrcode-shiba.com",
        title: "QRCode-Shiba | Tạo mã QR thông minh",
        description:
            "Nền tảng tạo và quản lý mã QR code hiện đại cho doanh nghiệp Việt Nam",
        siteName: "QRCode-Shiba",
    },
    twitter: {
        card: "summary_large_image",
        title: "QRCode-Shiba | Tạo mã QR thông minh",
        description:
            "Nền tảng tạo và quản lý mã QR code hiện đại cho doanh nghiệp Việt Nam",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        {children}
                        <Toaster />
                        <SpeedInsights />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

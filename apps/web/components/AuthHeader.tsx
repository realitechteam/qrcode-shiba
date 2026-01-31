"use client";

import Link from "next/link";
import { QrCode, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";

export function AuthHeader() {
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    // Wait for hydration to avoid mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="glass sticky top-0 z-50 border-b">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-shiba-500 to-shiba-600">
                        <QrCode className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">
                        QRCode-<span className="text-shiba-500">Shiba</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/pricing"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Bảng giá
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Giới thiệu
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Liên hệ
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    {mounted && _hasHydrated && isAuthenticated ? (
                        // User is logged in - show dashboard button
                        <Link href="/dashboard/qr">
                            <Button size="sm" className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                                <User className="h-4 w-4" />
                                {user?.name ? user.name.split(" ")[0] : "Dashboard"}
                            </Button>
                        </Link>
                    ) : (
                        // Not logged in - show login/register
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Đăng nhập
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

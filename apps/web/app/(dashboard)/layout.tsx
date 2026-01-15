"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    QrCode,
    LayoutDashboard,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Plus,
    CreditCard,
    FolderOpen,
    ChevronDown,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "QR Codes", href: "/dashboard/qr", icon: QrCode },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Folders", href: "/dashboard/folders", icon: FolderOpen },
];

const bottomNavigation = [
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout, fetchUser } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        } else if (!user) {
            fetchUser();
        }
    }, [isAuthenticated, user, router, fetchUser]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-4 border-b">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-shiba-500 to-shiba-600">
                                <QrCode className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold">QRCode-Shiba</span>
                        </Link>
                        <button
                            className="lg:hidden text-muted-foreground hover:text-foreground"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Create button */}
                    <div className="p-4">
                        <Link href="/dashboard/qr/new">
                            <Button className="w-full bg-shiba-500 hover:bg-shiba-600 gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo QR Code
                            </Button>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-shiba-100 text-shiba-700 dark:bg-shiba-900/30 dark:text-shiba-400"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom navigation */}
                    <div className="px-3 py-4 border-t space-y-1">
                        {bottomNavigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-shiba-100 text-shiba-700 dark:bg-shiba-900/30 dark:text-shiba-400"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User section */}
                    <div className="p-4 border-t">
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-shiba-100 text-shiba-700 font-semibold">
                                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium truncate">
                                        {user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                <ChevronDown className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform",
                                    userMenuOpen && "rotate-180"
                                )} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-card rounded-lg border shadow-lg py-1">
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        Hồ sơ
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted w-full"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur border-b flex items-center px-4 lg:px-6">
                    <button
                        className="lg:hidden mr-4 text-muted-foreground hover:text-foreground"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex-1" />

                    {/* Quick actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/qr/new">
                            <Button size="sm" className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Tạo QR</span>
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}

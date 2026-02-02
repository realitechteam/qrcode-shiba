"use client";

import { useEffect, useState, useRef } from "react";
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
    Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { processPendingQR } from "@/lib/pending-qr";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navigation = [
    { name: "QR Codes", href: "/dashboard/qr", icon: QrCode },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
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
    const { user, isAuthenticated, logout, fetchUser, _hasHydrated } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        // Wait for hydration before checking auth
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push("/login");
        } else if (!user) {
            fetchUser();
        }
    }, [_hasHydrated, isAuthenticated, user, router, fetchUser]);

    // Process pending QR from homepage after auth
    const { toast } = useToast();
    const pendingProcessed = useRef(false);

    useEffect(() => {
        if (!_hasHydrated || !isAuthenticated || !user) return;
        if (pendingProcessed.current) return; // Already processed

        const processPending = async () => {
            // Mark as processed immediately to prevent duplicate calls
            pendingProcessed.current = true;

            const result = await processPendingQR();
            if (result.success && result.qrName) {
                toast({
                    title: "🎉 QR Code đã được tạo!",
                    description: `"${result.qrName}" đã được thêm vào danh sách của bạn.`,
                });
                // Force reload the page to refresh QR list
                if (pathname === "/dashboard/qr") {
                    window.location.reload();
                } else {
                    router.push("/dashboard/qr");
                }
            }
        };

        processPending();
    }, [_hasHydrated, isAuthenticated, user, toast, pathname, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    // Show loading while hydrating OR if not authenticated yet
    if (!_hasHydrated || !isAuthenticated) {
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

                    <nav className="flex-1 px-3 space-y-1">
                        {navigation.map((item) => {
                            // Dashboard should only be active on exact match
                            const isActive = item.href === "/dashboard" 
                                ? pathname === "/dashboard"
                                : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name || "User"}
                                        className="h-9 w-9 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-shiba-500 to-shiba-600 text-white font-semibold shadow-sm">
                                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
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
                        <LanguageSwitcher />
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                                {/* Notification badge */}
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-shiba-500" />
                            </button>

                            {showNotifications && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotifications(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border shadow-lg z-50 animate-scale-in">
                                        <div className="p-4 border-b">
                                            <h3 className="font-semibold">Thông báo</h3>
                                        </div>
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">Chưa có thông báo mới</p>
                                        </div>
                                        <div className="p-2 border-t">
                                            <button 
                                                className="w-full text-sm text-shiba-500 hover:text-shiba-600 py-2"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Xem tất cả thông báo
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <Link href="/dashboard/qr/new">
                            <Button size="sm" className="bg-shiba-500 hover:bg-shiba-600 gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Tạo QR</span>
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t pb-safe">
                <div className="flex items-center justify-around h-16">
                    {[
                        { name: "QR Codes", href: "/dashboard/qr", icon: QrCode },
                        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
                        { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
                        { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
                    ].map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                                    isActive
                                        ? "text-shiba-600 dark:text-shiba-400"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 transition-transform duration-200",
                                        isActive && "scale-110"
                                    )}
                                />
                                <span className={cn(
                                    "text-[10px] font-medium transition-all duration-200",
                                    isActive ? "opacity-100" : "opacity-70"
                                )}>
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-shiba-500" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

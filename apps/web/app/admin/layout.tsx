"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    QrCode,
    BadgePercent,
    ArrowLeft,
    Menu,
    X,
    Shield,
    ClipboardList,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const adminNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Người dùng", href: "/admin/users", icon: Users },
    { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
    { label: "QR Codes", href: "/admin/qrcodes", icon: QrCode },
    { label: "Affiliates", href: "/admin/affiliates", icon: BadgePercent },
    { label: "Lịch sử hệ thống", href: "/admin/audit-logs", icon: ClipboardList },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, _hasHydrated, fetchUser } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (!user) {
            fetchUser();
            return;
        }

        // Non-admin users get redirected
        if (user.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [_hasHydrated, isAuthenticated, user, router, fetchUser]);

    if (!_hasHydrated || !isAuthenticated || !user || user.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-pulse text-gray-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-white">Admin Panel</span>
                        </div>
                        <button
                            className="lg:hidden text-gray-400 hover:text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {adminNavItems.map((item) => {
                            const isActive = item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="px-3 py-4 border-t border-gray-800">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Về Dashboard
                        </Link>
                        <div className="mt-3 px-3 text-xs text-gray-500">
                            {user.email}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center px-4 lg:px-6">
                    <button
                        className="lg:hidden mr-4 text-gray-400 hover:text-white"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Shield className="h-4 w-4 text-red-400" />
                        <span>Admin Panel</span>
                    </div>
                </header>

                {/* Content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    CreditCard,
    Key,
    Trash2,
    Moon,
    Sun,
    Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";

const tabs = [
    { id: "account", name: "Tài khoản", icon: User },
    { id: "appearance", name: "Giao diện", icon: Palette },
    { id: "notifications", name: "Thông báo", icon: Bell },
    { id: "security", name: "Bảo mật", icon: Shield },
    { id: "api", name: "API Keys", icon: Key },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const { user } = useAuthStore();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Cài đặt</h1>
                <p className="text-muted-foreground">
                    Quản lý tài khoản và tùy chọn của bạn
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="md:w-48 flex-shrink-0">
                    <nav className="flex md:flex-col gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? "bg-shiba-100 text-shiba-700 dark:bg-shiba-900/30 dark:text-shiba-400"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden md:inline">{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                    {activeTab === "account" && (
                        <>
                            <SettingsSection title="Thông tin tài khoản">
                                <div className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Họ tên</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.name || ""}
                                                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email || ""}
                                                disabled
                                                className="w-full rounded-lg border bg-muted px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <Button className="bg-shiba-500 hover:bg-shiba-600">
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </SettingsSection>

                            <SettingsSection title="Xóa tài khoản" danger>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Khi xóa tài khoản, tất cả dữ liệu QR codes, analytics sẽ bị xóa vĩnh viễn
                                    và không thể khôi phục.
                                </p>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa tài khoản
                                </Button>
                            </SettingsSection>
                        </>
                    )}

                    {activeTab === "appearance" && (
                        <SettingsSection title="Giao diện">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Chế độ</label>
                                    <div className="flex gap-3">
                                        {[
                                            { id: "light", name: "Sáng", icon: Sun },
                                            { id: "dark", name: "Tối", icon: Moon },
                                            { id: "system", name: "Hệ thống", icon: Monitor },
                                        ].map((mode) => {
                                            const Icon = mode.icon;
                                            return (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setTheme(mode.id)}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${theme === mode.id
                                                            ? "border-shiba-500 bg-shiba-50 text-shiba-700 dark:bg-shiba-900/30 dark:text-shiba-400"
                                                            : "hover:bg-muted"
                                                        }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {mode.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-3 block">Ngôn ngữ</label>
                                    <select className="w-full max-w-xs rounded-lg border bg-background px-4 py-2.5 text-sm">
                                        <option value="vi">🇻🇳 Tiếng Việt</option>
                                        <option value="en">🇺🇸 English</option>
                                    </select>
                                </div>
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === "notifications" && (
                        <SettingsSection title="Thông báo">
                            <div className="space-y-4">
                                {[
                                    { id: "email_scan", name: "Thông báo lượt quét qua email", enabled: true },
                                    { id: "email_weekly", name: "Báo cáo hàng tuần", enabled: true },
                                    { id: "email_promo", name: "Tin tức và khuyến mãi", enabled: false },
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50"
                                    >
                                        <span className="text-sm font-medium">{item.name}</span>
                                        <input
                                            type="checkbox"
                                            defaultChecked={item.enabled}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                    </label>
                                ))}
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === "security" && (
                        <>
                            <SettingsSection title="Đổi mật khẩu">
                                <div className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                                        <input
                                            type="password"
                                            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm"
                                        />
                                    </div>
                                    <Button className="bg-shiba-500 hover:bg-shiba-600">
                                        Đổi mật khẩu
                                    </Button>
                                </div>
                            </SettingsSection>

                            <SettingsSection title="Xác thực 2 yếu tố (2FA)">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Tăng cường bảo mật cho tài khoản của bạn bằng xác thực 2 yếu tố.
                                </p>
                                <Button variant="outline">Thiết lập 2FA</Button>
                            </SettingsSection>
                        </>
                    )}

                    {activeTab === "api" && (
                        <SettingsSection title="API Keys">
                            <p className="text-sm text-muted-foreground mb-4">
                                Sử dụng API Keys để tích hợp QRCode-Shiba vào ứng dụng của bạn.
                                Tính năng này khả dụng cho gói Pro trở lên.
                            </p>
                            <div className="p-8 rounded-lg border-2 border-dashed text-center">
                                <Key className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground mb-4">
                                    Bạn chưa có API key nào
                                </p>
                                <Button className="bg-shiba-500 hover:bg-shiba-600">
                                    Tạo API Key
                                </Button>
                            </div>
                        </SettingsSection>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsSection({
    title,
    danger,
    children,
}: {
    title: string;
    danger?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-xl border bg-card p-6 ${danger ? "border-destructive/50" : ""
                }`}
        >
            <h2
                className={`font-semibold mb-4 ${danger ? "text-destructive" : ""}`}
            >
                {title}
            </h2>
            {children}
        </div>
    );
}

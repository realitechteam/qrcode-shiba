"use client";

import { useState, useEffect } from "react";
import {
    User,
    Bell,
    Shield,
    Palette,
    Key,
    Trash2,
    Moon,
    Sun,
    Monitor,
    Loader2,
    Smartphone,
    Lock,
    Crown,
    Building2,
    Copy,
    Check,
    Plus,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

const tabItems = [
    { id: "account", key: "dashboard.settings.profile", icon: User },
    { id: "appearance", key: "dashboard.settings.appearance", icon: Palette },
    { id: "notifications", key: "dashboard.settings.notifications", icon: Bell },
    { id: "security", key: "common.security", icon: Shield },
    { id: "api", key: "common.apiKeys", icon: Key },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const { user, fetchUser, isBusinessUser } = useAuthStore();
    const { t } = useTranslation();

    // Account form state
    const [name, setName] = useState(user?.name || "");
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 2FA state
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [showTwoFASetup, setShowTwoFASetup] = useState(false);

    // Notification state
    const [notifications, setNotifications] = useState({
        emailPromo: true,
        emailWeekly: true,
    });

    useEffect(() => {
        if (user?.name) setName(user.name);
    }, [user?.name]);

    const handleSaveAccount = async () => {
        setIsSaving(true);
        try {
            await api.patch("/auth/profile", { name });
            await fetchUser();
            toast({ title: "Đã lưu", description: "Thông tin tài khoản đã được cập nhật" });
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err.response?.data?.message || "Không thể cập nhật thông tin",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete("/auth/account");
            window.location.href = "/login";
        } catch (err: any) {
            toast({
                title: "Lỗi xóa tài khoản",
                description: err.response?.data?.message || "Không thể xóa tài khoản",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{t("dashboard.settings.title")}</h1>
                <p className="text-muted-foreground">
                    {t("dashboard.settings.subtitle")}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="md:w-48 flex-shrink-0">
                    <nav className="flex md:flex-col gap-1">
                        {tabItems.map((tab) => {
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
                                    <span className="hidden md:inline">{t(tab.key)}</span>
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
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={user?.email || ""}
                                                disabled
                                                className="w-full rounded-lg border bg-muted px-4 py-2.5 text-sm cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        className="bg-shiba-500 hover:bg-shiba-600"
                                        onClick={handleSaveAccount}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : null}
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </SettingsSection>

                            <SettingsSection title="Xóa tài khoản" danger>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Khi xóa tài khoản, tất cả dữ liệu QR codes, analytics sẽ bị xóa vĩnh viễn
                                    và không thể khôi phục.
                                </p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa tài khoản
                                </Button>
                            </SettingsSection>
                        </>
                    )}

                    {activeTab === "appearance" && (
                        <AppearanceSection />
                    )}

                    {activeTab === "notifications" && (
                        <SettingsSection title="Thông báo Email">
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                                    <div>
                                        <span className="text-sm font-medium block">Tin tức và khuyến mãi</span>
                                        <span className="text-xs text-muted-foreground">Nhận thông tin về tính năng mới và ưu đãi</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailPromo}
                                        onChange={(e) => setNotifications({ ...notifications, emailPromo: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                                    <div>
                                        <span className="text-sm font-medium block">Báo cáo hàng tuần</span>
                                        <span className="text-xs text-muted-foreground">Tổng hợp lượt quét và analytics hàng tuần</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailWeekly}
                                        onChange={(e) => setNotifications({ ...notifications, emailWeekly: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                </label>
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === "security" && (
                        <SettingsSection title="Xác thực 2 yếu tố (2FA)">
                            <div className="flex items-start gap-4 p-4 rounded-lg border">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-shiba-100 dark:bg-shiba-900/30 flex-shrink-0">
                                    <Smartphone className="h-5 w-5 text-shiba-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">Authenticator App</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Sử dụng ứng dụng như Google Authenticator hoặc Authy để bảo vệ tài khoản.
                                    </p>
                                    <div className="mt-3">
                                        {twoFAEnabled ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                    <Check className="h-4 w-4" />
                                                    Đã bật
                                                </span>
                                                <Button variant="outline" size="sm" onClick={() => setTwoFAEnabled(false)}>
                                                    Tắt 2FA
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    toast({
                                                        title: "Sắp ra mắt",
                                                        description: "Tính năng 2FA sẽ được cập nhật trong phiên bản tiếp theo",
                                                    });
                                                }}
                                            >
                                                <Lock className="h-4 w-4 mr-2" />
                                                Thiết lập 2FA
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Lưu ý:</strong> QRCode-Shiba sử dụng link đăng nhập qua email,
                                    không cần mật khẩu. 2FA sẽ thêm một lớp bảo mật bổ sung khi cần thiết.
                                </p>
                            </div>
                        </SettingsSection>
                    )}

                    {activeTab === "api" && (
                        <SettingsSection title="API Keys">
                            {isBusinessUser() ? (
                                <APIKeysSection />
                            ) : (
                                <div className="p-8 rounded-lg border-2 border-dashed text-center">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-shiba-100 to-orange-100 dark:from-shiba-900/30 dark:to-orange-900/30 mb-4">
                                        <Building2 className="h-8 w-8 text-shiba-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Dành cho gói Business</h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                                        API Keys cho phép bạn tích hợp QRCode-Shiba vào ứng dụng của mình.
                                        Nâng cấp lên gói Business để sử dụng tính năng này.
                                    </p>
                                    <Link href="/dashboard/billing">
                                        <Button className="bg-gradient-to-r from-shiba-500 to-orange-500 hover:from-shiba-600 hover:to-orange-600 text-white gap-2">
                                            <Crown className="h-4 w-4" />
                                            Nâng cấp Business
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </SettingsSection>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <h2 className="text-lg font-semibold">Xóa tài khoản?</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Hành động này không thể hoàn tác. Tất cả QR codes, analytics và dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Xóa tài khoản
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function APIKeysSection() {
    const { toast } = useToast();
    const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; createdAt: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        // TODO: Fetch API keys from backend
        setIsLoading(false);
    }, []);

    const handleCopy = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast({ title: "Đã sao chép" });
    };

    const handleCreate = () => {
        toast({
            title: "Sắp ra mắt",
            description: "Tính năng API Keys sẽ được cập nhật trong phiên bản tiếp theo",
        });
        setShowCreate(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm text-muted-foreground mb-4">
                Sử dụng API Keys để tích hợp QRCode-Shiba vào ứng dụng của bạn.
            </p>

            {apiKeys.length === 0 ? (
                <div className="p-8 rounded-lg border-2 border-dashed text-center">
                    <Key className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                        Bạn chưa có API key nào
                    </p>
                    <Button
                        className="bg-shiba-500 hover:bg-shiba-600"
                        onClick={handleCreate}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo API Key
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                                <p className="font-medium">{key.name}</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {key.key.slice(0, 12)}...{key.key.slice(-4)}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(key.key, key.id)}
                            >
                                {copiedId === key.id ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCreate}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo thêm API Key
                    </Button>
                </div>
            )}
        </div>
    );
}

function AppearanceSection() {
    const { theme, setTheme } = useTheme();
    const { locale, setLocale, locales, t } = useTranslation();

    return (
        <SettingsSection title={t("dashboard.settings.appearance")}>
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-medium mb-3 block">{t("dashboard.settings.theme")}</label>
                    <div className="flex gap-3">
                        {[
                            { id: "light", name: t("dashboard.settings.light"), icon: Sun },
                            { id: "dark", name: t("dashboard.settings.dark"), icon: Moon },
                            { id: "system", name: t("dashboard.settings.system"), icon: Monitor },
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
                    <label className="text-sm font-medium mb-3 block">{t("dashboard.settings.language")}</label>
                    <div className="flex flex-wrap gap-3">
                        {locales.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLocale(lang.code)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${locale === lang.code
                                    ? "border-shiba-500 bg-shiba-50 text-shiba-700 dark:bg-shiba-900/30 dark:text-shiba-400"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                {lang.nativeName}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </SettingsSection>
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

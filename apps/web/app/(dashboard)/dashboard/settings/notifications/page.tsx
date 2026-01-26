"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";

export default function NotificationsPage() {
    const { toast } = useToast();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    
    // Mock user preferences (replace with real backend data later)
    const [preferences, setPreferences] = useState({
        weeklyReport: true,
        newScanAlert: true,
        productUpdates: false,
        securityAlerts: true,
    });

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoading(false);
        toast({
            title: "Đã lưu cài đặt",
            description: "Tùy chọn thông báo của bạn đã được cập nhật",
        });
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Cài đặt thông báo</h1>
                <p className="text-muted-foreground">
                    Quản lý cách chúng tôi liên lạc với bạn qua email.
                </p>
            </div>

            <div className="space-y-6">
                {/* Email Notifications */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-shiba-100 dark:bg-shiba-900/30 rounded-full">
                            <Mail className="h-5 w-5 text-shiba-600 dark:text-shiba-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email thông báo</h3>
                            <p className="text-sm text-muted-foreground">Gửi đến {user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Báo cáo tuần</label>
                                <p className="text-xs text-muted-foreground">
                                    Nhận tổng hợp lượt quét và xu hướng mỗi tuần
                                </p>
                            </div>
                            <Switch
                                checked={preferences.weeklyReport}
                                onCheckedChange={(c) => setPreferences({ ...preferences, weeklyReport: c })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Cảnh báo lượt quét mới</label>
                                <p className="text-xs text-muted-foreground">
                                    Thông báo khi có lượt quét mới (Giới hạn 1 email/giờ)
                                </p>
                            </div>
                            <Switch
                                checked={preferences.newScanAlert}
                                onCheckedChange={(c) => setPreferences({ ...preferences, newScanAlert: c })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Cập nhật sản phẩm</label>
                                <p className="text-xs text-muted-foreground">
                                    Tin tức về tính năng mới và cải tiến
                                </p>
                            </div>
                            <Switch
                                checked={preferences.productUpdates}
                                onCheckedChange={(c) => setPreferences({ ...preferences, productUpdates: c })}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Bảo mật</label>
                                <p className="text-xs text-muted-foreground">
                                    Cảnh báo đăng nhập lạ và thay đổi tài khoản quan trọng
                                </p>
                            </div>
                            <Switch
                                checked={preferences.securityAlerts}
                                disabled // Always on
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="bg-shiba-500 hover:bg-shiba-600"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Mail, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";

const profileSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        try {
            const response = await api.patch("/users/me", data);
            setUser(response.data);
            toast({
                title: "Cập nhật thành công!",
                description: "Thông tin hồ sơ đã được lưu",
            });
        } catch (error: any) {
            toast({
                title: "Cập nhật thất bại",
                description: error.message || "Có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
                <p className="text-muted-foreground">
                    Quản lý thông tin tài khoản của bạn
                </p>
            </div>

            {/* Avatar section */}
            <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold mb-4">Ảnh đại diện</h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-shiba-100 dark:bg-shiba-900/30 flex items-center justify-center text-2xl font-bold text-shiba-600">
                            {user?.name?.[0]?.toUpperCase() ||
                                user?.email?.[0]?.toUpperCase() ||
                                "U"}
                        </div>
                        <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-shiba-500 text-white flex items-center justify-center hover:bg-shiba-600 transition-colors">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">
                            JPG, GIF hoặc PNG. Tối đa 2MB.
                        </p>
                        <Button variant="outline" size="sm" disabled>
                            Tải ảnh lên
                        </Button>
                    </div>
                </div>
            </div>

            {/* Profile form */}
            <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold mb-4">Thông tin cơ bản</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Họ và tên
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 disabled:opacity-50"
                            disabled={isLoading}
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={user?.email || ""}
                            readOnly
                            className="w-full rounded-lg border bg-muted px-4 py-3 text-sm cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email không thể thay đổi
                        </p>
                    </div>

                    {/* Email verification status */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <div
                            className={`h-2 w-2 rounded-full ${user?.emailVerified ? "bg-green-500" : "bg-yellow-500"
                                }`}
                        />
                        <span className="text-sm">
                            {user?.emailVerified
                                ? "Email đã xác thực"
                                : "Email chưa xác thực"}
                        </span>
                        {!user?.emailVerified && (
                            <Button variant="link" size="sm" className="ml-auto text-shiba-500 p-0 h-auto">
                                Gửi lại email xác thực
                            </Button>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="bg-shiba-500 hover:bg-shiba-600"
                            disabled={isLoading || !isDirty}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu thay đổi"
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Danger zone */}
            <div className="rounded-xl border border-destructive/50 bg-card p-6">
                <h2 className="font-semibold text-destructive mb-2">Vùng nguy hiểm</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn bao gồm QR codes
                    và analytics. Hành động này không thể hoàn tác.
                </p>
                <Button variant="destructive" size="sm">
                    Xóa tài khoản
                </Button>
            </div>
        </div>
    );
}

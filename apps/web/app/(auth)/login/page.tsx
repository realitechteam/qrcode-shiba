"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QrCode, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { login, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
            toast({
                title: "Đăng nhập thành công!",
                description: "Chào mừng bạn trở lại QRCode-Shiba",
            });
            router.push("/dashboard/qr");
        } catch (error: any) {
            toast({
                title: "Đăng nhập thất bại",
                description: error.message || "Email hoặc mật khẩu không đúng",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-shiba-500 to-shiba-600">
                                <QrCode className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold">
                                QRCode-<span className="text-shiba-500">Shiba</span>
                            </span>
                        </Link>
                    </div>

                    {/* Form */}
                    <div className="bg-card rounded-2xl border p-8 shadow-lg">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">Chào mừng trở lại!</h1>
                            <p className="text-muted-foreground mt-1">
                                Đăng nhập để tiếp tục quản lý QR codes của bạn
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Mật khẩu
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-shiba-500 hover:text-shiba-600"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="w-full rounded-lg border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 disabled:opacity-50"
                                        disabled={isLoading}
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full bg-shiba-500 hover:bg-shiba-600"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 border-t" />
                            <span className="text-xs text-muted-foreground">HOẶC</span>
                            <div className="flex-1 border-t" />
                        </div>

                        {/* Social Login */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
                            }}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Đăng nhập với Google
                        </Button>

                        {/* Register link */}
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Chưa có tài khoản?{" "}
                            <Link href="/register" className="text-shiba-500 hover:text-shiba-600 font-medium">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-shiba-500 to-shiba-600 items-center justify-center p-12">
                <div className="max-w-md text-white text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <QrCode className="h-20 w-20" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                        Tạo QR Code chuyên nghiệp trong vài giây
                    </h2>
                    <p className="text-shiba-100">
                        Tùy chỉnh với logo, theo dõi lượt quét real-time, và tích hợp dễ dàng
                        với hệ thống của bạn.
                    </p>
                </div>
            </div>
        </div>
    );
}

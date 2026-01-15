"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QrCode, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";

const registerSchema = z
    .object({
        name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
        email: z.string().email("Email không hợp lệ"),
        password: z
            .string()
            .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
            .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
            .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRequirements = [
    { label: "Ít nhất 8 ký tự", test: (p: string) => p.length >= 8 },
    { label: "Ít nhất 1 chữ hoa", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Ít nhất 1 số", test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { register: registerUser, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
    });

    const password = watch("password", "");

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data.email, data.password, data.name);
            toast({
                title: "Đăng ký thành công!",
                description: "Chào mừng bạn đến với QRCode-Shiba",
            });
            router.push("/dashboard/qr");
        } catch (error: any) {
            toast({
                title: "Đăng ký thất bại",
                description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-shiba-500 to-shiba-600 items-center justify-center p-12">
                <div className="max-w-md text-white text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <QrCode className="h-20 w-20" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                        Bắt đầu tạo QR Code miễn phí
                    </h2>
                    <ul className="text-left text-shiba-100 space-y-3">
                        <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-white" />
                            <span>Tạo không giới hạn QR Code tĩnh</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-white" />
                            <span>Tùy chỉnh màu sắc và logo</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-white" />
                            <span>Theo dõi lượt quét cơ bản</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-white" />
                            <span>Tải xuống PNG, SVG chất lượng cao</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right side - Form */}
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
                            <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                            <p className="text-muted-foreground mt-1">
                                Đăng ký miễn phí và bắt đầu tạo QR codes ngay
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Họ và tên
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Nguyễn Văn A"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

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
                                <label htmlFor="password" className="text-sm font-medium">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
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
                                {/* Password requirements */}
                                <div className="space-y-1 pt-1">
                                    {passwordRequirements.map((req) => (
                                        <div
                                            key={req.label}
                                            className={`flex items-center gap-2 text-xs ${req.test(password)
                                                    ? "text-green-600"
                                                    : "text-muted-foreground"
                                                }`}
                                        >
                                            <Check
                                                className={`h-3 w-3 ${req.test(password) ? "opacity-100" : "opacity-30"
                                                    }`}
                                            />
                                            {req.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Terms */}
                            <p className="text-xs text-muted-foreground">
                                Bằng việc đăng ký, bạn đồng ý với{" "}
                                <Link href="/terms" className="text-shiba-500 hover:underline">
                                    Điều khoản dịch vụ
                                </Link>{" "}
                                và{" "}
                                <Link href="/privacy" className="text-shiba-500 hover:underline">
                                    Chính sách bảo mật
                                </Link>{" "}
                                của chúng tôi.
                            </p>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full bg-shiba-500 hover:bg-shiba-600"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang đăng ký...
                                    </>
                                ) : (
                                    "Đăng ký"
                                )}
                            </Button>
                        </form>

                        {/* Login link */}
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Đã có tài khoản?{" "}
                            <Link href="/login" className="text-shiba-500 hover:text-shiba-600 font-medium">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

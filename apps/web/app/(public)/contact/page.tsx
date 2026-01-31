"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSuccess(true);
        toast({
            title: "Đã gửi thành công!",
            description: "Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
        });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4 flex items-center justify-center">
                <div className="max-w-md text-center animate-scale-in">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Cảm ơn bạn!</h2>
                    <p className="text-muted-foreground mb-6">
                        Tin nhắn của bạn đã được gửi. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline">
                        Gửi tin nhắn khác
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-6 -ml-2 text-muted-foreground hover:text-foreground gap-2 animate-fade-in"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>

                {/* Header */}
                <div className="text-center mb-12 animate-slide-up">
                    <h1 className="text-3xl font-bold mb-2">Liên hệ với chúng tôi</h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Bạn có câu hỏi hoặc cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng giúp đỡ.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-6">Thông tin liên hệ</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-shiba-500/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-5 w-5 text-shiba-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <a href="mailto:support@shiba.pw" className="text-muted-foreground hover:text-shiba-500">
                                            support@shiba.pw
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-shiba-500/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-5 w-5 text-shiba-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Hotline</p>
                                        <a href="tel:1900xxxx" className="text-muted-foreground hover:text-shiba-500">
                                            1900 xxxx (8:00 - 22:00)
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-shiba-500/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-shiba-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Địa chỉ</p>
                                        <p className="text-muted-foreground">
                                            Quận 1, TP. Hồ Chí Minh, Việt Nam
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border bg-card">
                            <h3 className="font-bold mb-2">Giờ làm việc</h3>
                            <p className="text-muted-foreground text-sm">
                                Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                                Thứ 7: 8:00 - 12:00<br />
                                Chủ nhật: Nghỉ
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-6">Gửi tin nhắn</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Họ tên</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Chủ đề</label>
                                <select
                                    required
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                >
                                    <option value="">Chọn chủ đề</option>
                                    <option value="support">Hỗ trợ kỹ thuật</option>
                                    <option value="billing">Thanh toán & đăng ký</option>
                                    <option value="partnership">Hợp tác kinh doanh</option>
                                    <option value="feedback">Góp ý & phản hồi</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nội dung</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                                    placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-shiba-500 hover:bg-shiba-600 gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Gửi tin nhắn
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

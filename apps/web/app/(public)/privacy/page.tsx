"use client";

import { useRouter } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 px-4">
            <div className="max-w-3xl mx-auto">
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
                    <div className="w-16 h-16 rounded-2xl bg-shiba-500/10 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-shiba-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Chính sách bảo mật</h1>
                    <p className="text-muted-foreground">Cập nhật lần cuối: 31/01/2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">1. Thông tin chúng tôi thu thập</h2>
                        <p className="text-muted-foreground mb-3">
                            Khi bạn sử dụng QRCode-Shiba, chúng tôi có thể thu thập:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li><strong>Thông tin tài khoản:</strong> Email, tên, ảnh đại diện</li>
                            <li><strong>Dữ liệu QR code:</strong> Nội dung, thiết kế, URL đích</li>
                            <li><strong>Dữ liệu analytics:</strong> Lượt quét, vị trí, thiết bị</li>
                            <li><strong>Thông tin thanh toán:</strong> Được xử lý qua cổng thanh toán bảo mật</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">2. Cách chúng tôi sử dụng dữ liệu</h2>
                        <p className="text-muted-foreground mb-3">
                            Dữ liệu của bạn được sử dụng để:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Cung cấp và cải thiện dịch vụ</li>
                            <li>Hiển thị thống kê và analytics</li>
                            <li>Gửi thông báo quan trọng về tài khoản</li>
                            <li>Hỗ trợ khách hàng</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">3. Bảo mật dữ liệu</h2>
                        <p className="text-muted-foreground">
                            Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>Mã hóa SSL/TLS cho mọi kết nối</li>
                            <li>Mã hóa dữ liệu nhạy cảm khi lưu trữ</li>
                            <li>Xác thực hai lớp (tùy chọn)</li>
                            <li>Kiểm tra bảo mật định kỳ</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">4. Chia sẻ dữ liệu</h2>
                        <p className="text-muted-foreground">
                            Chúng tôi <strong>không bán</strong> dữ liệu cá nhân của bạn.
                            Dữ liệu chỉ được chia sẻ với:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>Nhà cung cấp dịch vụ hỗ trợ (hosting, email, thanh toán)</li>
                            <li>Cơ quan chức năng khi có yêu cầu pháp lý</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">5. Quyền của bạn</h2>
                        <p className="text-muted-foreground">
                            Bạn có quyền:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                            <li>Truy cập và tải xuống dữ liệu của bạn</li>
                            <li>Chỉnh sửa thông tin cá nhân</li>
                            <li>Xóa tài khoản và dữ liệu liên quan</li>
                            <li>Hủy đăng ký nhận email marketing</li>
                        </ul>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">6. Cookies</h2>
                        <p className="text-muted-foreground">
                            Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng,
                            bao gồm cookies phiên đăng nhập và cookies analytics.
                            Bạn có thể quản lý cookies trong cài đặt trình duyệt.
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl border bg-card">
                        <h2 className="text-xl font-bold mb-4">7. Liên hệ</h2>
                        <p className="text-muted-foreground">
                            Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ:{" "}
                            <a href="mailto:privacy@shiba.pw" className="text-shiba-500 hover:underline">
                                privacy@shiba.pw
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

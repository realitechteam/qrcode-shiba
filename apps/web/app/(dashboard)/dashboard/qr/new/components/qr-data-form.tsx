"use client";

interface QRDataFormProps {
    type: string;
    data: Record<string, any>;
    onChange: (data: Record<string, any>) => void;
}

export function QRDataForm({ type, data, onChange }: QRDataFormProps) {
    const updateField = (field: string, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const renderForm = () => {
        switch (type) {
            case "URL":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Nhập URL</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Đường dẫn website</label>
                            <input
                                type="url"
                                value={data.url || ""}
                                onChange={(e) => updateField("url", e.target.value)}
                                placeholder="https://example.com"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                    </div>
                );

            case "TEXT":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Nhập văn bản</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nội dung</label>
                            <textarea
                                value={data.text || ""}
                                onChange={(e) => updateField("text", e.target.value)}
                                placeholder="Nhập nội dung văn bản..."
                                rows={5}
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                            />
                        </div>
                    </div>
                );

            case "WIFI":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Thông tin WiFi</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tên mạng (SSID)</label>
                                <input
                                    type="text"
                                    value={data.ssid || ""}
                                    onChange={(e) => updateField("ssid", e.target.value)}
                                    placeholder="Tên WiFi"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mật khẩu</label>
                                <input
                                    type="text"
                                    value={data.password || ""}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    placeholder="Mật khẩu WiFi"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mã hóa</label>
                                <select
                                    value={data.encryption || "WPA"}
                                    onChange={(e) => updateField("encryption", e.target.value)}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                >
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">Không mật khẩu</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.hidden || false}
                                    onChange={(e) => updateField("hidden", e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm">Mạng ẩn</span>
                            </label>
                        </div>
                    </div>
                );

            case "VCARD":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Thông tin danh thiếp</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Họ</label>
                                <input
                                    type="text"
                                    value={data.lastName || ""}
                                    onChange={(e) => updateField("lastName", e.target.value)}
                                    placeholder="Nguyễn"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tên</label>
                                <input
                                    type="text"
                                    value={data.firstName || ""}
                                    onChange={(e) => updateField("firstName", e.target.value)}
                                    placeholder="Văn A"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Công ty</label>
                            <input
                                type="text"
                                value={data.organization || ""}
                                onChange={(e) => updateField("organization", e.target.value)}
                                placeholder="Tên công ty"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chức vụ</label>
                            <input
                                type="text"
                                value={data.title || ""}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="Trưởng phòng Marketing"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Số điện thoại</label>
                            <input
                                type="tel"
                                value={data.phone || ""}
                                onChange={(e) => updateField("phone", e.target.value)}
                                placeholder="0912345678"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                value={data.email || ""}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="email@company.com"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website</label>
                            <input
                                type="url"
                                value={data.website || ""}
                                onChange={(e) => updateField("website", e.target.value)}
                                placeholder="https://company.com"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                    </div>
                );

            case "EMAIL":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Gửi Email</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email người nhận</label>
                            <input
                                type="email"
                                value={data.email || ""}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="recipient@example.com"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tiêu đề (tùy chọn)</label>
                            <input
                                type="text"
                                value={data.subject || ""}
                                onChange={(e) => updateField("subject", e.target.value)}
                                placeholder="Tiêu đề email"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nội dung (tùy chọn)</label>
                            <textarea
                                value={data.body || ""}
                                onChange={(e) => updateField("body", e.target.value)}
                                placeholder="Nội dung email..."
                                rows={3}
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                            />
                        </div>
                    </div>
                );

            case "PHONE":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Số điện thoại</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Số điện thoại</label>
                            <input
                                type="tel"
                                value={data.phone || ""}
                                onChange={(e) => updateField("phone", e.target.value)}
                                placeholder="+84 912 345 678"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                    </div>
                );

            case "SMS":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Gửi SMS</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Số điện thoại</label>
                            <input
                                type="tel"
                                value={data.phone || ""}
                                onChange={(e) => updateField("phone", e.target.value)}
                                placeholder="+84 912 345 678"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tin nhắn (tùy chọn)</label>
                            <textarea
                                value={data.message || ""}
                                onChange={(e) => updateField("message", e.target.value)}
                                placeholder="Nội dung tin nhắn..."
                                rows={3}
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                            />
                        </div>
                    </div>
                );

            case "LOCATION":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Vị trí địa lý</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vĩ độ (Latitude)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.latitude || ""}
                                    onChange={(e) =>
                                        updateField("latitude", parseFloat(e.target.value))
                                    }
                                    placeholder="21.0285"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kinh độ (Longitude)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.longitude || ""}
                                    onChange={(e) =>
                                        updateField("longitude", parseFloat(e.target.value))
                                    }
                                    placeholder="105.8542"
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tip: Tìm tọa độ trên Google Maps, click chuột phải vào vị trí cần lấy
                        </p>
                    </div>
                );

            case "SOCIAL_LINKS":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Link mạng xã hội</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tên hiển thị</label>
                            <input
                                type="text"
                                value={data.name || ""}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="Tên của bạn hoặc doanh nghiệp"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        {[
                            { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
                            { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
                            { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
                            { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
                            { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/username" },
                            { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
                            { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
                            { key: "website", label: "Website", placeholder: "https://example.com" },
                            { key: "telegram", label: "Telegram", placeholder: "https://t.me/username" },
                            { key: "zalo", label: "Zalo", placeholder: "https://zalo.me/phone" },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-2">
                                <label className="text-sm font-medium">{label}</label>
                                <input
                                    type="url"
                                    value={data[key] || ""}
                                    onChange={(e) => updateField(key, e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground">
                            Điền ít nhất 1 link mạng xã hội
                        </p>
                    </div>
                );

            case "EVENT":
                return (
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Thông tin sự kiện</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Tên sự kiện <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title || ""}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="Họp team hàng tuần"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mô tả</label>
                            <textarea
                                value={data.description || ""}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Chi tiết về sự kiện..."
                                rows={3}
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Địa điểm</label>
                            <input
                                type="text"
                                value={data.location || ""}
                                onChange={(e) => updateField("location", e.target.value)}
                                placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Ngày bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.startDate || ""}
                                    onChange={(e) => updateField("startDate", e.target.value)}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Giờ bắt đầu</label>
                                <input
                                    type="time"
                                    value={data.startTime || ""}
                                    onChange={(e) => updateField("startTime", e.target.value)}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ngày kết thúc</label>
                                <input
                                    type="date"
                                    value={data.endDate || ""}
                                    onChange={(e) => updateField("endDate", e.target.value)}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Giờ kết thúc</label>
                                <input
                                    type="time"
                                    value={data.endTime || ""}
                                    onChange={(e) => updateField("endTime", e.target.value)}
                                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Người tổ chức</label>
                            <input
                                type="text"
                                value={data.organizer || ""}
                                onChange={(e) => updateField("organizer", e.target.value)}
                                placeholder="Tên người hoặc tổ chức"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL sự kiện</label>
                            <input
                                type="url"
                                value={data.url || ""}
                                onChange={(e) => updateField("url", e.target.value)}
                                placeholder="https://event.example.com"
                                className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                            />
                        </div>
                    </div>
                );

            default:
                return <p>Loại QR không hỗ trợ</p>;
        }
    };

    return renderForm();
}

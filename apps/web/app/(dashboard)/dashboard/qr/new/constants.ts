import {
    Link2,
    FileText,
    User,
    Wifi,
    Mail,
    Phone,
    MessageSquare,
    MapPin,
} from "lucide-react";

export const qrTypes = [
    { id: "URL", name: "URL", icon: Link2, description: "Link website" },
    { id: "TEXT", name: "Text", icon: FileText, description: "Văn bản tùy ý" },
    { id: "VCARD", name: "vCard", icon: User, description: "Danh thiếp điện tử" },
    { id: "WIFI", name: "WiFi", icon: Wifi, description: "Chia sẻ mật khẩu WiFi" },
    { id: "EMAIL", name: "Email", icon: Mail, description: "Gửi email" },
    { id: "PHONE", name: "Điện thoại", icon: Phone, description: "Gọi điện thoại" },
    { id: "SMS", name: "SMS", icon: MessageSquare, description: "Gửi tin nhắn" },
    { id: "LOCATION", name: "Vị trí", icon: MapPin, description: "Google Maps" },
];

export const steps = [
    { id: 1, name: "Loại QR", description: "Chọn loại QR code" },
    { id: 2, name: "Nội dung", description: "Nhập thông tin" },
    { id: 3, name: "Tùy chỉnh", description: "Thiết kế giao diện" },
    { id: 4, name: "Hoàn tất", description: "Lưu và tải xuống" },
];

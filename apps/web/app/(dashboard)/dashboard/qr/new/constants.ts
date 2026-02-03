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
    { id: "URL", name: "URL", icon: Link2, description: "Link website", supportsTracking: true },
    { id: "TEXT", name: "Text", icon: FileText, description: "Văn bản tùy ý", supportsTracking: false },
    { id: "VCARD", name: "vCard", icon: User, description: "Danh thiếp điện tử", supportsTracking: true },
    { id: "WIFI", name: "WiFi", icon: Wifi, description: "Chia sẻ mật khẩu WiFi", supportsTracking: false },
    { id: "EMAIL", name: "Email", icon: Mail, description: "Gửi email", supportsTracking: true },
    { id: "PHONE", name: "Điện thoại", icon: Phone, description: "Gọi điện thoại", supportsTracking: true },
    { id: "SMS", name: "SMS", icon: MessageSquare, description: "Gửi tin nhắn", supportsTracking: true },
    { id: "LOCATION", name: "Vị trí", icon: MapPin, description: "Google Maps", supportsTracking: true },
];

export const steps = [
    { id: 1, name: "Loại QR", description: "Chọn loại QR code" },
    { id: 2, name: "Nội dung", description: "Nhập thông tin" },
    { id: 3, name: "Tùy chỉnh", description: "Thiết kế giao diện" },
    { id: 4, name: "Hoàn tất", description: "Lưu và tải xuống" },
];

"use client";

import { useState, useCallback } from "react";
import {
    Link as LinkIcon,
    Type,
    Mail,
    Phone,
    MessageSquare,
    Download,
    Loader2,
    Palette,
    QrCode,
    Sparkles,
    Frame,
    Shapes,
    Image,
    Wifi,
    User,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupModal } from "@/components/SignupModal";
import { savePendingQR } from "@/lib/pending-qr";

// QR Types for static generation
const QR_TYPES = [
    { id: "URL", label: "Link", icon: LinkIcon },
    { id: "TEXT", label: "Văn bản", icon: Type },
    { id: "EMAIL", label: "E-mail", icon: Mail },
    { id: "PHONE", label: "Gọi điện", icon: Phone },
    { id: "SMS", label: "SMS", icon: MessageSquare },
    { id: "WIFI", label: "WiFi", icon: Wifi },
    { id: "VCARD", label: "Danh bạ", icon: User },
    { id: "LOCATION", label: "Vị trí", icon: MapPin },
] as const;

// Color presets
const COLOR_PRESETS = [
    "#000000", // Black
    "#FF6B35", // Shiba Orange
    "#2563EB", // Blue
    "#16A34A", // Green
    "#9333EA", // Purple
    "#DC2626", // Red
];

// Design tabs
const DESIGN_TABS = [
    { id: "frame", label: "Khung", icon: Frame },
    { id: "shape", label: "Kiểu dáng", icon: Shapes },
    { id: "logo", label: "Logo", icon: Image },
] as const;

// Frame options - values must match backend frameStyle
const FRAME_OPTIONS = [
    { id: "none", label: "Không", backendStyle: "none", text: undefined },
    { id: "basic", label: "Đơn giản", backendStyle: "basic", text: undefined },
    { id: "rounded", label: "Bo góc", backendStyle: "rounded", text: undefined },
    { id: "scan-me", label: "Scan Me", backendStyle: "rounded", text: "SCAN ME" },
];

// Shape options (dot styles)
const SHAPE_OPTIONS = [
    { id: "square", label: "Vuông" },
    { id: "rounded", label: "Tròn" },
    { id: "dots", label: "Chấm" },
];

export function HomeQRGenerator() {
    const [activeType, setActiveType] = useState<string>("URL");

    // URL type
    const [url, setUrl] = useState("https://");

    // Text type
    const [text, setText] = useState("");

    // Email type
    const [emailTo, setEmailTo] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");

    // Phone type
    const [phoneNumber, setPhoneNumber] = useState("");

    // SMS type
    const [smsNumber, setSmsNumber] = useState("");
    const [smsBody, setSmsBody] = useState("");

    // WiFi type
    const [wifiSsid, setWifiSsid] = useState("");
    const [wifiPassword, setWifiPassword] = useState("");
    const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");

    // vCard type
    const [vcardName, setVcardName] = useState("");
    const [vcardPhone, setVcardPhone] = useState("");
    const [vcardEmail, setVcardEmail] = useState("");
    const [vcardCompany, setVcardCompany] = useState("");

    // Location type
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // Styling
    const [foregroundColor, setForegroundColor] = useState("#000000");

    // Design options
    const [activeDesignTab, setActiveDesignTab] = useState("frame");
    const [frameStyle, setFrameStyle] = useState("none");
    const [shapeStyle, setShapeStyle] = useState("square");

    // Preview state
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);

    // Get data based on active type
    const getQRData = useCallback(() => {
        switch (activeType) {
            case "URL":
                return { url: url || "https://example.com" };
            case "TEXT":
                return { text: text || "Hello World" };
            case "EMAIL":
                return {
                    email: emailTo || "email@example.com",
                    subject: emailSubject,
                    body: emailBody
                };
            case "PHONE":
                return { phone: phoneNumber || "+84123456789" };
            case "SMS":
                return {
                    phone: smsNumber || "+84123456789",
                    message: smsBody
                };
            case "WIFI":
                return {
                    ssid: wifiSsid,
                    password: wifiPassword,
                    encryption: wifiEncryption
                };
            case "VCARD":
                return {
                    firstName: vcardName.split(" ")[0] || "",
                    lastName: vcardName.split(" ").slice(1).join(" ") || "",
                    phone: vcardPhone,
                    email: vcardEmail,
                    organization: vcardCompany
                };
            case "LOCATION":
                return {
                    latitude: parseFloat(latitude) || 0,
                    longitude: parseFloat(longitude) || 0
                };
            default:
                return { url: "https://example.com" };
        }
    }, [activeType, url, text, emailTo, emailSubject, emailBody, phoneNumber, smsNumber, smsBody, wifiSsid, wifiPassword, wifiEncryption, vcardName, vcardPhone, vcardEmail, vcardCompany, latitude, longitude]);

    // Check if content is empty (should not generate QR)
    const isContentEmpty = useCallback(() => {
        switch (activeType) {
            case "URL":
                return !url || url === "https://" || url.trim() === "";
            case "TEXT":
                return !text || text.trim() === "";
            case "EMAIL":
                return !emailTo || emailTo.trim() === "";
            case "PHONE":
                return !phoneNumber || phoneNumber.trim() === "";
            case "SMS":
                return !smsNumber || smsNumber.trim() === "";
            case "WIFI":
                return !wifiSsid || wifiSsid.trim() === "";
            case "VCARD":
                return !vcardName || vcardName.trim() === "";
            case "LOCATION":
                return !latitude || !longitude;
            default:
                return true;
        }
    }, [activeType, url, text, emailTo, phoneNumber, smsNumber, wifiSsid, vcardName, latitude, longitude]);

    // Generate QR preview - MANUALLY triggered by button
    const handleGenerateQR = useCallback(async () => {
        if (isContentEmpty()) return;

        setIsGenerating(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_QR_API_URL || "https://qr-service-production-f6fd.up.railway.app/api/v1"}/qr/preview`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        // Backend DTO expects UPPERCASE type (enum validation)
                        type: activeType.toUpperCase(),
                        data: getQRData(),
                        styling: {
                            foregroundColor,
                            backgroundColor: "#FFFFFF",
                            dotsStyle: shapeStyle, // square | rounded | dots
                            frameStyle: FRAME_OPTIONS.find(f => f.id === frameStyle)?.backendStyle || "none",
                            frameText: FRAME_OPTIONS.find(f => f.id === frameStyle)?.text,
                        },
                        size: 300,
                    }),
                }
            );

            if (response.ok) {
                const result = await response.json();
                setQrPreview(result.dataUrl);
            }
        } catch (error) {
            console.error("Failed to generate preview:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [activeType, getQRData, foregroundColor, shapeStyle, frameStyle, isContentEmpty]);

    // Handle download click - save pending QR and show signup modal
    const handleDownload = () => {
        // Save QR data to localStorage for processing after signup/login
        const frameOption = FRAME_OPTIONS.find(f => f.id === frameStyle);
        savePendingQR({
            type: activeType.toUpperCase(), // Backend DTO expects uppercase
            data: getQRData(),
            styling: {
                foregroundColor,
                backgroundColor: "#FFFFFF",
                dotsStyle: shapeStyle,
                frameStyle: frameOption?.backendStyle || "none",
                frameText: frameOption?.text,
            },
            preview: qrPreview || undefined,
        });
        setShowSignupModal(true);
    };

    // Block right-click on QR image
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowSignupModal(true);
    };

    return (
        <>
            <div className="mx-auto max-w-5xl rounded-2xl border bg-card p-6 md:p-8 shadow-2xl">
                <div className="grid lg:grid-cols-[1fr_280px] gap-8">
                    {/* Left Column - Form */}
                    <div className="space-y-6">
                        {/* QR Type Tabs */}
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                Chọn loại QR Code
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {QR_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setActiveType(type.id);
                                            setQrPreview(null); // Clear preview when type changes
                                        }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${activeType === type.id
                                            ? "border-shiba-500 bg-shiba-50 dark:bg-shiba-900/20 text-shiba-600"
                                            : "border-transparent bg-muted/50 hover:bg-muted"
                                            }`}
                                    >
                                        <type.icon className="h-5 w-5" />
                                        <span className="text-xs font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Complete Content */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-shiba-500 text-xs font-bold text-white">1</span>
                                <h3 className="text-sm font-medium">Nhập nội dung</h3>
                            </div>

                            {/* URL Input */}
                            {activeType === "URL" && (
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            )}

                            {/* Text Input */}
                            {activeType === "TEXT" && (
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Nhập nội dung văn bản..."
                                    rows={3}
                                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                                />
                            )}

                            {/* Email Inputs */}
                            {activeType === "EMAIL" && (
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        value={emailTo}
                                        onChange={(e) => setEmailTo(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Tiêu đề (tùy chọn)"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <textarea
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Nội dung email (tùy chọn)"
                                        rows={2}
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                                    />
                                </div>
                            )}

                            {/* Phone Input */}
                            {activeType === "PHONE" && (
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+84 123 456 789"
                                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                />
                            )}

                            {/* SMS Inputs */}
                            {activeType === "SMS" && (
                                <div className="space-y-3">
                                    <input
                                        type="tel"
                                        value={smsNumber}
                                        onChange={(e) => setSmsNumber(e.target.value)}
                                        placeholder="+84 123 456 789"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <textarea
                                        value={smsBody}
                                        onChange={(e) => setSmsBody(e.target.value)}
                                        placeholder="Nội dung tin nhắn"
                                        rows={3}
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500 resize-none"
                                    />
                                </div>
                            )}

                            {/* WiFi Inputs */}
                            {activeType === "WIFI" && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={wifiSsid}
                                        onChange={(e) => setWifiSsid(e.target.value)}
                                        placeholder="Tên WiFi (SSID)"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <input
                                        type="password"
                                        value={wifiPassword}
                                        onChange={(e) => setWifiPassword(e.target.value)}
                                        placeholder="Mật khẩu"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <select
                                        value={wifiEncryption}
                                        onChange={(e) => setWifiEncryption(e.target.value as "WPA" | "WEP" | "nopass")}
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    >
                                        <option value="WPA">WPA/WPA2</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">Không mật khẩu</option>
                                    </select>
                                </div>
                            )}

                            {/* vCard Inputs */}
                            {activeType === "VCARD" && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={vcardName}
                                        onChange={(e) => setVcardName(e.target.value)}
                                        placeholder="Họ và tên"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <input
                                        type="tel"
                                        value={vcardPhone}
                                        onChange={(e) => setVcardPhone(e.target.value)}
                                        placeholder="Số điện thoại"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <input
                                        type="email"
                                        value={vcardEmail}
                                        onChange={(e) => setVcardEmail(e.target.value)}
                                        placeholder="Email (tùy chọn)"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                    <input
                                        type="text"
                                        value={vcardCompany}
                                        onChange={(e) => setVcardCompany(e.target.value)}
                                        placeholder="Công ty (tùy chọn)"
                                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                    />
                                </div>
                            )}

                            {/* Location Inputs */}
                            {activeType === "LOCATION" && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            step="any"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            placeholder="Vĩ độ (lat)"
                                            className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            placeholder="Kinh độ (lng)"
                                            className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-shiba-500"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Ví dụ: Hà Nội (21.0285, 105.8542)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Design your QR Code */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-shiba-500 text-xs font-bold text-white">2</span>
                                <h3 className="text-sm font-medium">Thiết kế QR Code</h3>
                            </div>

                            {/* Design Tabs */}
                            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                                {DESIGN_TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveDesignTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeDesignTab === tab.id
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Frame Options */}
                            {activeDesignTab === "frame" && (
                                <div className="grid grid-cols-4 gap-2">
                                    {FRAME_OPTIONS.map((frame) => (
                                        <button
                                            key={frame.id}
                                            onClick={() => setFrameStyle(frame.id)}
                                            className={`p-3 rounded-lg border text-center transition-all ${frameStyle === frame.id
                                                ? "border-shiba-500 bg-shiba-50 dark:bg-shiba-900/20"
                                                : "border-muted hover:border-muted-foreground/30"
                                                }`}
                                        >
                                            <div className="h-8 w-8 mx-auto mb-1 bg-muted rounded flex items-center justify-center">
                                                <QrCode className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <span className="text-xs">{frame.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Shape Options */}
                            {activeDesignTab === "shape" && (
                                <div className="grid grid-cols-3 gap-2">
                                    {SHAPE_OPTIONS.map((shape) => (
                                        <button
                                            key={shape.id}
                                            onClick={() => setShapeStyle(shape.id)}
                                            className={`p-3 rounded-lg border text-center transition-all ${shapeStyle === shape.id
                                                ? "border-shiba-500 bg-shiba-50 dark:bg-shiba-900/20"
                                                : "border-muted hover:border-muted-foreground/30"
                                                }`}
                                        >
                                            <div className="h-8 w-8 mx-auto mb-1 bg-muted rounded flex items-center justify-center">
                                                <span className={`block h-3 w-3 ${shape.id === "square" ? "bg-foreground" :
                                                    shape.id === "rounded" ? "bg-foreground rounded-sm" :
                                                        "bg-foreground rounded-full"
                                                    }`} />
                                            </div>
                                            <span className="text-xs">{shape.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Logo Options */}
                            {activeDesignTab === "logo" && (
                                <div className="p-4 border border-dashed rounded-lg text-center">
                                    <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Đăng ký để thêm logo vào QR
                                    </p>
                                    <Button variant="link" size="sm" className="text-shiba-500 mt-1">
                                        Đăng ký miễn phí
                                    </Button>
                                </div>
                            )}

                            {/* Color Presets */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Palette className="h-4 w-4" />
                                    Màu:
                                </span>
                                <div className="flex gap-2">
                                    {COLOR_PRESETS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setForegroundColor(color)}
                                            className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${foregroundColor === color
                                                ? "border-shiba-500 scale-110"
                                                : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview & Download (Fixed Size) */}
                    <div className="flex flex-col items-center bg-muted/30 rounded-xl p-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-shiba-500 text-xs font-bold text-white">3</span>
                            Tải QR Code
                        </h4>

                        {/* QR Preview - Fixed size with right-click protection */}
                        <div className="relative mb-4">
                            <div
                                className="h-48 w-48 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden border select-none"
                                onContextMenu={handleContextMenu}
                                style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-shiba-500" />
                                ) : qrPreview ? (
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={qrPreview}
                                        alt="QR Preview"
                                        className="w-full h-full object-contain p-2 pointer-events-none"
                                        draggable={false}
                                        onContextMenu={handleContextMenu}
                                        onDragStart={(e) => e.preventDefault()}
                                    />
                                ) : (
                                    /* Placeholder when no QR generated */
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        <QrCode className="h-16 w-16 text-muted-foreground/20 mb-2" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Validation Message */}
                        {isContentEmpty() && (
                            <p className="text-xs text-shiba-500 text-center mb-3">
                                Nhập nội dung để tạo QR Code
                            </p>
                        )}

                        {/* Generate QR Button */}
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full mb-2 gap-2"
                            onClick={handleGenerateQR}
                            disabled={isContentEmpty() || isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            Tạo mã QR
                        </Button>

                        {/* Download Button */}
                        <Button
                            size="lg"
                            className="w-full bg-shiba-500 hover:bg-shiba-600 gap-2"
                            onClick={handleDownload}
                            disabled={!qrPreview}
                        >
                            <Download className="h-5 w-5" />
                            Tải QR Code
                        </Button>

                        <p className="mt-3 text-xs text-muted-foreground text-center">
                            Miễn phí • Không giới hạn
                        </p>
                    </div>
                </div>
            </div>

            {/* Signup Modal */}
            <SignupModal
                isOpen={showSignupModal}
                onClose={() => setShowSignupModal(false)}
                qrPreview={qrPreview || undefined}
            />
        </>
    );
}

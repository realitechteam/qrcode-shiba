"use client";

import { useEffect, useState } from "react";
import {
    Users,
    DollarSign,
    TrendingUp,
    Copy,
    Check,
    Link2,
    ArrowDownToLine,
    Loader2,
    Wallet,
    UserPlus,
    BadgePercent,
    Building2,
    Plus,
    Pencil,
    Trash2,
    X,
    MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import paymentApi from "@/lib/payment-api";

// Types
interface AffiliateLink {
    id: string;
    referralCode: string;
    label: string | null;
    commissionRate: number;
    discountRate: number;
    clickCount: number;
    referralCount: number;
    isActive: boolean;
    createdAt: string;
}

interface AffiliateDashboard {
    referralCode: string;
    referralLink: string;
    commissionRate: number;
    totalEarnings: number;
    pendingBalance: number;
    paidBalance: number;
    totalReferrals: number;
    convertedReferrals: number;
    conversionRate: string;
    totalCommissions: number;
    status: string;
    bankInfo: {
        bankName: string | null;
        bankAccount: string | null;
        bankHolder: string | null;
    };
    links?: AffiliateLink[];
}

interface Commission {
    id: string;
    orderId: string;
    amount: number;
    rate: number;
    status: string;
    createdAt: string;
}

interface Payout {
    id: string;
    amount: number;
    method: string;
    status: string;
    processedAt: string | null;
    createdAt: string;
}

// Format VND
function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

export default function AffiliatePage() {
    const { toast } = useToast();
    const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null);
    const [links, setLinks] = useState<AffiliateLink[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [tab, setTab] = useState<"overview" | "links" | "commissions" | "payouts">("overview");

    // Registration form
    const [regCode, setRegCode] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    // Payout form
    const [payoutAmount, setPayoutAmount] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankHolder, setBankHolder] = useState("");
    const [isRequestingPayout, setIsRequestingPayout] = useState(false);
    const [isSavingBank, setIsSavingBank] = useState(false);
    const [showPayoutForm, setShowPayoutForm] = useState(false);

    // Link form
    const [showLinkForm, setShowLinkForm] = useState(false);
    const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
    const [linkLabel, setLinkLabel] = useState("");
    const [linkCode, setLinkCode] = useState("");
    const [linkCommission, setLinkCommission] = useState("10");
    const [linkDiscount, setLinkDiscount] = useState("10");
    const [isSavingLink, setIsSavingLink] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        setIsLoading(true);
        try {
            const res = await paymentApi.get("/affiliate/dashboard");
            setDashboard(res.data);
            setIsRegistered(true);
            setBankName(res.data.bankInfo?.bankName || "");
            setBankAccount(res.data.bankInfo?.bankAccount || "");
            setBankHolder(res.data.bankInfo?.bankHolder || "");

            // Load links, commissions and payouts
            const [linksRes, commRes, payRes] = await Promise.all([
                paymentApi.get("/affiliate/links").catch(() => ({ data: [] })),
                paymentApi.get("/affiliate/commissions"),
                paymentApi.get("/affiliate/payouts"),
            ]);
            setLinks(linksRes.data || []);
            setCommissions(commRes.data.items || []);
            setPayouts(payRes.data.items || []);
        } catch (err: any) {
            if (err?.response?.status === 404) {
                setIsRegistered(false);
            } else {
                toast({ title: "Lỗi", description: "Không thể tải dữ liệu Affiliate", variant: "destructive" });
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRegister() {
        setIsRegistering(true);
        try {
            await paymentApi.post("/affiliate/register", {
                referralCode: regCode.trim() || undefined,
            });
            toast({ title: "Đăng ký thành công!", description: "Bạn đã trở thành Affiliate" });
            loadDashboard();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.message || "Không thể đăng ký",
                variant: "destructive",
            });
        } finally {
            setIsRegistering(false);
        }
    }

    async function handleCopyLink(link: AffiliateLink) {
        const url = `${window.location.origin}?ref=${link.referralCode}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    async function handleCopyMainLink() {
        if (!dashboard) return;
        await navigator.clipboard.writeText(dashboard.referralLink);
        setCopiedId("main");
        setTimeout(() => setCopiedId(null), 2000);
    }

    async function handleSaveBank() {
        setIsSavingBank(true);
        try {
            await paymentApi.patch("/affiliate/bank-info", {
                bankName,
                bankAccount,
                bankHolder,
            });
            toast({ title: "Đã lưu thông tin ngân hàng" });
            loadDashboard();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.message || "Không thể lưu",
                variant: "destructive",
            });
        } finally {
            setIsSavingBank(false);
        }
    }

    async function handleRequestPayout() {
        const amount = parseInt(payoutAmount);
        if (!amount || amount < 500000) {
            toast({ title: "Lỗi", description: "Số tiền tối thiểu là 500,000 VND", variant: "destructive" });
            return;
        }
        setIsRequestingPayout(true);
        try {
            await paymentApi.post("/affiliate/payout", { amount });
            toast({ title: "Yêu cầu rút tiền đã được gửi!" });
            setPayoutAmount("");
            setShowPayoutForm(false);
            loadDashboard();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.message || "Không thể gửi yêu cầu",
                variant: "destructive",
            });
        } finally {
            setIsRequestingPayout(false);
        }
    }

    // Link management
    function openCreateLink() {
        setEditingLink(null);
        setLinkLabel("");
        setLinkCode("");
        setLinkCommission("10");
        setLinkDiscount("10");
        setShowLinkForm(true);
    }

    function openEditLink(link: AffiliateLink) {
        setEditingLink(link);
        setLinkLabel(link.label || "");
        setLinkCode(link.referralCode);
        setLinkCommission(String(link.commissionRate * 100));
        setLinkDiscount(String(link.discountRate * 100));
        setShowLinkForm(true);
    }

    async function handleSaveLink() {
        setIsSavingLink(true);
        try {
            const payload = {
                label: linkLabel.trim() || undefined,
                commissionRate: parseFloat(linkCommission) / 100,
                discountRate: parseFloat(linkDiscount) / 100,
            };

            if (editingLink) {
                await paymentApi.patch(`/affiliate/links/${editingLink.id}`, payload);
                toast({ title: "Đã cập nhật link!" });
            } else {
                await paymentApi.post("/affiliate/links", {
                    ...payload,
                    referralCode: linkCode.trim() || undefined,
                });
                toast({ title: "Đã tạo link mới!" });
            }
            setShowLinkForm(false);
            loadDashboard();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.message || "Không thể lưu link",
                variant: "destructive",
            });
        } finally {
            setIsSavingLink(false);
        }
    }

    async function handleDeleteLink(linkId: string) {
        if (!confirm("Bạn có chắc muốn xóa link này?")) return;
        try {
            await paymentApi.delete(`/affiliate/links/${linkId}`);
            toast({ title: "Đã xóa link" });
            loadDashboard();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err?.response?.data?.message || "Không thể xóa",
                variant: "destructive",
            });
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-shiba-500" />
            </div>
        );
    }

    // Registration screen
    if (isRegistered === false) {
        return (
            <div className="max-w-lg mx-auto mt-12">
                <div className="rounded-xl border bg-card p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-shiba-100 dark:bg-shiba-900/30 flex items-center justify-center mb-6">
                        <BadgePercent className="h-8 w-8 text-shiba-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Chương Trình Affiliate</h1>
                    <p className="text-muted-foreground mb-6">
                        Giới thiệu bạn bè và nhận hoa hồng trên mỗi giao dịch thanh toán. Tùy chỉnh tỷ lệ commission và discount cho từng link.
                    </p>

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Mã giới thiệu (tùy chọn)
                            </label>
                            <input
                                type="text"
                                value={regCode}
                                onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                                placeholder="VD: JOHN2026 (để trống = tự tạo)"
                                maxLength={20}
                                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                            />
                        </div>
                        <Button
                            className="w-full bg-shiba-500 hover:bg-shiba-600"
                            onClick={handleRegister}
                            disabled={isRegistering}
                        >
                            {isRegistering && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Đăng Ký Affiliate
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t text-sm text-muted-foreground space-y-2">
                        <p>✅ Tạo nhiều link giới thiệu với tỷ lệ khác nhau</p>
                        <p>✅ Tùy chỉnh commission + discount cho từng link</p>
                        <p>✅ Rút tiền từ 500,000 VND</p>
                        <p>✅ Theo dõi realtime trên dashboard</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboard) return null;

    const totalCommission = parseFloat(linkCommission || "0");
    const totalDiscount = parseFloat(linkDiscount || "0");
    const totalRate = totalCommission + totalDiscount;
    const maxRate = 20; // Will be overridden by server validation

    // Main dashboard
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
                <p className="text-muted-foreground">
                    Quản lý chương trình giới thiệu và thu nhập của bạn
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng Thu Nhập"
                    value={formatVND(dashboard.totalEarnings)}
                    icon={<DollarSign className="h-5 w-5" />}
                    color="text-green-500"
                />
                <StatCard
                    title="Chờ Thanh Toán"
                    value={formatVND(dashboard.pendingBalance)}
                    icon={<Wallet className="h-5 w-5" />}
                    color="text-yellow-500"
                />
                <StatCard
                    title="Đã Chi Trả"
                    value={formatVND(dashboard.paidBalance)}
                    icon={<ArrowDownToLine className="h-5 w-5" />}
                    color="text-blue-500"
                />
                <StatCard
                    title="Người Giới Thiệu"
                    value={`${dashboard.convertedReferrals} / ${dashboard.totalReferrals}`}
                    icon={<Users className="h-5 w-5" />}
                    color="text-shiba-500"
                    subtitle={`Tỷ lệ chuyển đổi: ${dashboard.conversionRate}`}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
                {(["overview", "links", "commissions", "payouts"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t
                            ? "bg-background shadow text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t === "overview" ? "Tổng quan" : t === "links" ? "Links" : t === "commissions" ? "Hoa hồng" : "Rút tiền"}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === "overview" && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Bank Info */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="h-5 w-5 text-shiba-500" />
                            <h3 className="font-semibold">Thông Tin Ngân Hàng</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground">Ngân hàng</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="VD: Vietcombank"
                                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Số tài khoản</label>
                                <input
                                    type="text"
                                    value={bankAccount}
                                    onChange={(e) => setBankAccount(e.target.value)}
                                    placeholder="Số tài khoản ngân hàng"
                                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">Chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={bankHolder}
                                    onChange={(e) => setBankHolder(e.target.value)}
                                    placeholder="Tên chủ tài khoản"
                                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                                />
                            </div>
                            <Button
                                onClick={handleSaveBank}
                                disabled={isSavingBank || !bankName || !bankAccount || !bankHolder}
                                className="w-full bg-shiba-500 hover:bg-shiba-600"
                                size="sm"
                            >
                                {isSavingBank && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Lưu Thông Tin
                            </Button>
                        </div>
                    </div>

                    {/* Withdraw */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ArrowDownToLine className="h-5 w-5 text-shiba-500" />
                                <h3 className="font-semibold">Rút Tiền</h3>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                Khả dụng: <strong className="text-foreground">{formatVND(dashboard.pendingBalance)}</strong>
                            </span>
                        </div>

                        {!showPayoutForm ? (
                            <Button
                                onClick={() => setShowPayoutForm(true)}
                                disabled={dashboard.pendingBalance < 500000}
                                className="w-full bg-shiba-500 hover:bg-shiba-600"
                            >
                                <ArrowDownToLine className="h-4 w-4 mr-2" />
                                Yêu Cầu Rút Tiền
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground">Số tiền (VND)</label>
                                    <input
                                        type="number"
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        placeholder="500000"
                                        min={500000}
                                        max={dashboard.pendingBalance}
                                        className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Tối thiểu: 500,000 VND</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowPayoutForm(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        className="flex-1 bg-shiba-500 hover:bg-shiba-600"
                                        onClick={handleRequestPayout}
                                        disabled={isRequestingPayout}
                                    >
                                        {isRequestingPayout && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                        Gửi Yêu Cầu
                                    </Button>
                                </div>
                            </div>
                        )}

                        {dashboard.pendingBalance < 500000 && !showPayoutForm && (
                            <p className="text-xs text-muted-foreground mt-3 text-center">
                                Cần tối thiểu {formatVND(500000)} để rút tiền
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Links Tab */}
            {tab === "links" && (
                <div className="space-y-4">
                    {/* Create Link Button */}
                    <div className="flex justify-end">
                        <Button onClick={openCreateLink} className="bg-shiba-500 hover:bg-shiba-600" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo Link Mới
                        </Button>
                    </div>

                    {/* Link Form Modal */}
                    {showLinkForm && (
                        <div className="rounded-xl border bg-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">{editingLink ? "Chỉnh sửa Link" : "Tạo Link Mới"}</h3>
                                <button onClick={() => setShowLinkForm(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Nhãn (tùy chọn)</label>
                                        <input
                                            type="text"
                                            value={linkLabel}
                                            onChange={(e) => setLinkLabel(e.target.value)}
                                            placeholder="VD: Facebook, YouTube..."
                                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                                        />
                                    </div>
                                    {!editingLink && (
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">Mã giới thiệu</label>
                                            <input
                                                type="text"
                                                value={linkCode}
                                                onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                                                placeholder="Để trống = tự tạo"
                                                maxLength={20}
                                                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Commission (% cho bạn)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={linkCommission}
                                                onChange={(e) => setLinkCommission(e.target.value)}
                                                min={0}
                                                max={20}
                                                step={1}
                                                className="w-24 px-3 py-2 rounded-lg border bg-background text-sm"
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Discount (% cho người mua)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={linkDiscount}
                                                onChange={(e) => setLinkDiscount(e.target.value)}
                                                min={0}
                                                max={20}
                                                step={1}
                                                className="w-24 px-3 py-2 rounded-lg border bg-background text-sm"
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rate indicator */}
                                <div className={`text-xs px-3 py-2 rounded-lg ${totalRate > maxRate ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                                    Commission ({totalCommission}%) + Discount ({totalDiscount}%) = <strong>{totalRate}%</strong>
                                    {totalRate > maxRate && " — Vượt quá giới hạn!"}
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowLinkForm(false)} className="flex-1">
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleSaveLink}
                                        disabled={isSavingLink || totalRate > maxRate}
                                        className="flex-1 bg-shiba-500 hover:bg-shiba-600"
                                    >
                                        {isSavingLink && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                        {editingLink ? "Cập nhật" : "Tạo Link"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Links List */}
                    {links.length === 0 ? (
                        <div className="rounded-xl border bg-card p-12 text-center">
                            <Link2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Chưa có link giới thiệu nào</p>
                            <p className="text-xs text-muted-foreground mt-1">Nhấn &quot;Tạo Link Mới&quot; để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {links.map((link) => (
                                <div key={link.id} className="rounded-xl border bg-card p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{link.label || link.referralCode}</h3>
                                                {!link.isActive && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                        Tắt
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                                {link.referralCode}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleCopyLink(link)}
                                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                title="Copy link"
                                            >
                                                {copiedId === link.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => openEditLink(link)}
                                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLink(link.id)}
                                                className="p-1.5 rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Link stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                        <div className="rounded-lg bg-muted/50 p-2.5">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                                <BadgePercent className="h-3 w-3" />
                                                Commission
                                            </div>
                                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                {(link.commissionRate * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-2.5">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                                <DollarSign className="h-3 w-3" />
                                                Discount
                                            </div>
                                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {(link.discountRate * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-2.5">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                                <MousePointerClick className="h-3 w-3" />
                                                Clicks
                                            </div>
                                            <p className="text-sm font-semibold">{link.clickCount}</p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-2.5">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                                <UserPlus className="h-3 w-3" />
                                                Referrals
                                            </div>
                                            <p className="text-sm font-semibold">{link.referralCount}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === "commissions" && (
                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Lịch Sử Hoa Hồng</h3>
                    </div>
                    {commissions.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>Chưa có hoa hồng nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="p-3">Ngày</th>
                                        <th className="p-3">Đơn hàng</th>
                                        <th className="p-3">Tỷ lệ</th>
                                        <th className="p-3 text-right">Số tiền</th>
                                        <th className="p-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.map((c) => (
                                        <tr key={c.id} className="border-b last:border-0">
                                            <td className="p-3">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                                            <td className="p-3 font-mono text-xs">{c.orderId.slice(0, 8)}...</td>
                                            <td className="p-3">{(c.rate * 100).toFixed(0)}%</td>
                                            <td className="p-3 text-right font-medium text-green-600">{formatVND(c.amount)}</td>
                                            <td className="p-3">
                                                <StatusBadge status={c.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === "payouts" && (
                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Lịch Sử Rút Tiền</h3>
                    </div>
                    {payouts.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <ArrowDownToLine className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>Chưa có yêu cầu rút tiền nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="p-3">Ngày</th>
                                        <th className="p-3">Phương thức</th>
                                        <th className="p-3 text-right">Số tiền</th>
                                        <th className="p-3">Trạng thái</th>
                                        <th className="p-3">Xử lý</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((p) => (
                                        <tr key={p.id} className="border-b last:border-0">
                                            <td className="p-3">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                                            <td className="p-3">Chuyển khoản</td>
                                            <td className="p-3 text-right font-medium">{formatVND(p.amount)}</td>
                                            <td className="p-3"><StatusBadge status={p.status} /></td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {p.processedAt
                                                    ? new Date(p.processedAt).toLocaleDateString("vi-VN")
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Sub-components

function StatCard({
    title,
    value,
    icon,
    color,
    subtitle,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className={color}>{icon}</div>
            </div>
            <div className="text-xl font-bold">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    const labels: Record<string, string> = {
        PENDING: "Chờ duyệt",
        APPROVED: "Đã duyệt",
        PAID: "Đã thanh toán",
        COMPLETED: "Hoàn thành",
        PROCESSING: "Đang xử lý",
        REJECTED: "Từ chối",
        FAILED: "Thất bại",
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
            {labels[status] || status}
        </span>
    );
}

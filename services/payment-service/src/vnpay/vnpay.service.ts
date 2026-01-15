import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as qs from "qs";
import * as dayjs from "dayjs";

export interface VnpayPaymentParams {
    orderId: string;
    amount: number;
    orderInfo: string;
    returnUrl: string;
    ipAddr: string;
    locale?: "vn" | "en";
    bankCode?: string;
}

export interface VnpayReturnParams {
    vnp_Amount: string;
    vnp_BankCode: string;
    vnp_BankTranNo?: string;
    vnp_CardType?: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TmnCode: string;
    vnp_TransactionNo: string;
    vnp_TransactionStatus: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
}

@Injectable()
export class VnpayService {
    private readonly tmnCode: string;
    private readonly secretKey: string;
    private readonly vnpUrl: string;
    private readonly apiUrl: string;

    constructor(private configService: ConfigService) {
        this.tmnCode = this.configService.get<string>("VNPAY_TMN_CODE", "");
        this.secretKey = this.configService.get<string>("VNPAY_SECRET_KEY", "");
        this.vnpUrl = this.configService.get<string>(
            "VNPAY_URL",
            "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
        );
        this.apiUrl = this.configService.get<string>(
            "VNPAY_API_URL",
            "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"
        );
    }

    /**
     * Create VNPay payment URL
     */
    createPaymentUrl(params: VnpayPaymentParams): string {
        const date = dayjs();
        const createDate = date.format("YYYYMMDDHHmmss");
        const expireDate = date.add(15, "minute").format("YYYYMMDDHHmmss");

        const vnpParams: Record<string, string | number> = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: this.tmnCode,
            vnp_Locale: params.locale || "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: params.orderId,
            vnp_OrderInfo: params.orderInfo,
            vnp_OrderType: "subscription",
            vnp_Amount: params.amount * 100, // VNPay uses smallest unit
            vnp_ReturnUrl: params.returnUrl,
            vnp_IpAddr: params.ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
        };

        if (params.bankCode) {
            vnpParams.vnp_BankCode = params.bankCode;
        }

        // Sort params alphabetically
        const sortedParams = this.sortObject(vnpParams);

        // Create signature
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac("sha512", this.secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        sortedParams.vnp_SecureHash = signed;

        return `${this.vnpUrl}?${qs.stringify(sortedParams, { encode: false })}`;
    }

    /**
     * Verify VNPay return/IPN signature
     */
    verifyReturnUrl(params: VnpayReturnParams): boolean {
        const secureHash = params.vnp_SecureHash;
        const queryParams = { ...params } as Record<string, string>;

        delete queryParams.vnp_SecureHash;
        delete (queryParams as any).vnp_SecureHashType;

        const sortedParams = this.sortObject(queryParams);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac("sha512", this.secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        return secureHash === signed;
    }

    /**
     * Check if payment was successful
     */
    isPaymentSuccessful(params: VnpayReturnParams): boolean {
        return (
            params.vnp_ResponseCode === "00" &&
            params.vnp_TransactionStatus === "00"
        );
    }

    /**
     * Get VNPay response message
     */
    getResponseMessage(responseCode: string): string {
        const messages: Record<string, string> = {
            "00": "Giao dịch thành công",
            "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ",
            "09": "Thẻ/Tài khoản chưa đăng ký InternetBanking",
            "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
            "11": "Đã hết hạn chờ thanh toán",
            "12": "Thẻ/Tài khoản bị khóa",
            "13": "Quý khách nhập sai mật khẩu xác thực giao dịch",
            "24": "Quý khách hủy giao dịch",
            "51": "Tài khoản không đủ số dư",
            "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
            "75": "Ngân hàng thanh toán đang bảo trì",
            "79": "Nhập sai mật khẩu thanh toán quá số lần quy định",
            "99": "Lỗi không xác định",
        };

        return messages[responseCode] || "Lỗi không xác định";
    }

    /**
     * Sort object keys alphabetically
     */
    private sortObject(obj: Record<string, any>): Record<string, any> {
        return Object.keys(obj)
            .sort()
            .reduce((result: Record<string, any>, key) => {
                result[key] = obj[key];
                return result;
            }, {});
    }
}

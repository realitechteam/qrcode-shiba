import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import axios from "axios";

export interface MomoPaymentParams {
    orderId: string;
    amount: number;
    orderInfo: string;
    returnUrl: string;
    notifyUrl: string;
    requestId?: string;
    extraData?: string;
}

export interface MomoPaymentResult {
    partnerCode: string;
    requestId: string;
    orderId: string;
    amount: number;
    responseTime: number;
    message: string;
    resultCode: number;
    payUrl: string;
    deeplink?: string;
    qrCodeUrl?: string;
}

export interface MomoCallbackData {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    orderInfo: string;
    orderType: string;
    transId: number;
    resultCode: number;
    message: string;
    payType: string;
    responseTime: number;
    extraData: string;
    signature: string;
}

@Injectable()
export class MomoService {
    private readonly partnerCode: string;
    private readonly accessKey: string;
    private readonly secretKey: string;
    private readonly apiEndpoint: string;

    constructor(private configService: ConfigService) {
        this.partnerCode = this.configService.get<string>("MOMO_PARTNER_CODE", "");
        this.accessKey = this.configService.get<string>("MOMO_ACCESS_KEY", "");
        this.secretKey = this.configService.get<string>("MOMO_SECRET_KEY", "");
        this.apiEndpoint = this.configService.get<string>(
            "MOMO_API_ENDPOINT",
            "https://test-payment.momo.vn/v2/gateway/api/create"
        );
    }

    /**
     * Create MoMo payment request
     */
    async createPayment(params: MomoPaymentParams): Promise<MomoPaymentResult> {
        const requestId = params.requestId || this.generateRequestId();
        const requestType = "captureWallet";
        const extraData = params.extraData || "";

        // Create signature
        const rawSignature = [
            `accessKey=${this.accessKey}`,
            `amount=${params.amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${params.notifyUrl}`,
            `orderId=${params.orderId}`,
            `orderInfo=${params.orderInfo}`,
            `partnerCode=${this.partnerCode}`,
            `redirectUrl=${params.returnUrl}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join("&");

        const signature = crypto
            .createHmac("sha256", this.secretKey)
            .update(rawSignature)
            .digest("hex");

        const requestBody = {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId,
            amount: params.amount,
            orderId: params.orderId,
            orderInfo: params.orderInfo,
            redirectUrl: params.returnUrl,
            ipnUrl: params.notifyUrl,
            extraData,
            requestType,
            signature,
            lang: "vi",
        };

        try {
            const response = await axios.post<MomoPaymentResult>(
                this.apiEndpoint,
                requestBody
            );
            return response.data;
        } catch (error: any) {
            console.error("MoMo payment error:", error.response?.data || error.message);
            throw new Error("MoMo payment creation failed");
        }
    }

    /**
     * Verify MoMo callback signature
     */
    verifySignature(data: MomoCallbackData): boolean {
        const rawSignature = [
            `accessKey=${this.accessKey}`,
            `amount=${data.amount}`,
            `extraData=${data.extraData}`,
            `message=${data.message}`,
            `orderId=${data.orderId}`,
            `orderInfo=${data.orderInfo}`,
            `orderType=${data.orderType}`,
            `partnerCode=${data.partnerCode}`,
            `payType=${data.payType}`,
            `requestId=${data.requestId}`,
            `responseTime=${data.responseTime}`,
            `resultCode=${data.resultCode}`,
            `transId=${data.transId}`,
        ].join("&");

        const expectedSignature = crypto
            .createHmac("sha256", this.secretKey)
            .update(rawSignature)
            .digest("hex");

        return data.signature === expectedSignature;
    }

    /**
     * Check if payment was successful
     */
    isPaymentSuccessful(resultCode: number): boolean {
        return resultCode === 0;
    }

    /**
     * Get result message
     */
    getResultMessage(resultCode: number): string {
        const messages: Record<number, string> = {
            0: "Giao dịch thành công",
            9000: "Giao dịch được cấp quyền thành công",
            8000: "Giao dịch đang được xử lý",
            7000: "Giao dịch đang được xử lý bởi hệ thống",
            1000: "Hệ thống đang bảo trì",
            1001: "Tài khoản không đủ số dư",
            1002: "Giao dịch bị từ chối do không đáp ứng quy tắc thanh toán",
            1003: "Giao dịch bị hủy bởi người dùng",
            1004: "Số tiền thanh toán vượt quá hạn mức",
            1005: "URL hoặc mã QR đã hết hạn",
            1006: "Đơn hàng đã được thanh toán",
        };

        return messages[resultCode] || "Lỗi không xác định";
    }

    /**
     * Generate unique request ID
     */
    private generateRequestId(): string {
        return `${this.partnerCode}${Date.now()}`;
    }
}

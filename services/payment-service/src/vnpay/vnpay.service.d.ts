import { ConfigService } from "@nestjs/config";
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
export declare class VnpayService {
    private configService;
    private readonly tmnCode;
    private readonly secretKey;
    private readonly vnpUrl;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    /**
     * Create VNPay payment URL
     */
    createPaymentUrl(params: VnpayPaymentParams): string;
    /**
     * Verify VNPay return/IPN signature
     */
    verifyReturnUrl(params: VnpayReturnParams): boolean;
    /**
     * Check if payment was successful
     */
    isPaymentSuccessful(params: VnpayReturnParams): boolean;
    /**
     * Get VNPay response message
     */
    getResponseMessage(responseCode: string): string;
    /**
     * Sort object keys alphabetically
     */
    private sortObject;
}
//# sourceMappingURL=vnpay.service.d.ts.map
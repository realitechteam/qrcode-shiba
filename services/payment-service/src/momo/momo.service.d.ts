import { ConfigService } from "@nestjs/config";
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
export declare class MomoService {
    private configService;
    private readonly partnerCode;
    private readonly accessKey;
    private readonly secretKey;
    private readonly apiEndpoint;
    constructor(configService: ConfigService);
    /**
     * Create MoMo payment request
     */
    createPayment(params: MomoPaymentParams): Promise<MomoPaymentResult>;
    /**
     * Verify MoMo callback signature
     */
    verifySignature(data: MomoCallbackData): boolean;
    /**
     * Check if payment was successful
     */
    isPaymentSuccessful(resultCode: number): boolean;
    /**
     * Get result message
     */
    getResultMessage(resultCode: number): string;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
}
//# sourceMappingURL=momo.service.d.ts.map
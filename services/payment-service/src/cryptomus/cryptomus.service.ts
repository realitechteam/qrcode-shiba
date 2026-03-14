import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export interface CryptomusPaymentParams {
    orderId: string;
    amount: number;
    currency?: string;
}

export interface CryptomusPaymentResult {
    paymentUrl: string;
    paymentId: string;
}

export interface CryptomusWebhookPayload {
    type: string;
    uuid: string;
    order_id: string;
    amount: string;
    payment_amount: string;
    payment_amount_usd: string;
    merchant_amount: string;
    commission: string;
    is_final: boolean;
    status: string;
    from: string;
    wallet_address_uuid: string | null;
    network: string;
    currency: string;
    payer_currency: string;
    additional_data: string | null;
    txid: string | null;
    sign: string;
}

@Injectable()
export class CryptomusService {
    private readonly logger = new Logger(CryptomusService.name);
    private readonly merchantId: string;
    private readonly apiKey: string;
    private readonly webhookUrl: string;
    private readonly frontendUrl: string;
    private readonly usdRate: number;
    private readonly apiUrl = "https://api.cryptomus.com/v1";

    constructor(private readonly configService: ConfigService) {
        this.merchantId = this.configService.get<string>("CRYPTOMUS_MERCHANT_ID", "");
        this.apiKey = this.configService.get<string>("CRYPTOMUS_API_KEY", "");
        this.webhookUrl = this.configService.get<string>(
            "CRYPTOMUS_WEBHOOK_URL",
            "https://pay.shiba.pw/api/v1/cryptomus/webhook"
        );
        this.frontendUrl = this.configService.get<string>("FRONTEND_URL", "https://www.shiba.pw");
        this.usdRate = parseInt(
            this.configService.get<string>("CRYPTOMUS_USD_RATE", "25000"),
            10
        );
    }

    /**
     * Convert VND amount to USD
     */
    convertVndToUsd(amountVnd: number): string {
        const usd = amountVnd / this.usdRate;
        return usd.toFixed(2);
    }

    /**
     * Create a payment on Cryptomus
     */
    async createPayment(params: CryptomusPaymentParams): Promise<CryptomusPaymentResult> {
        const { orderId, amount, currency = "USD" } = params;

        const body = {
            amount: typeof amount === "number" ? amount.toString() : amount,
            currency,
            order_id: orderId,
            url_callback: this.webhookUrl,
            url_return: `${this.frontendUrl}/payment/result?status=success`,
            url_success: `${this.frontendUrl}/payment/result?status=success`,
            is_payment_multiple: false,
            lifetime: 3600, // 1 hour
        };

        const bodyBase64 = Buffer.from(JSON.stringify(body)).toString("base64");
        const sign = crypto
            .createHash("md5")
            .update(bodyBase64 + this.apiKey)
            .digest("hex");

        const response = await fetch(`${this.apiUrl}/payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                merchant: this.merchantId,
                sign,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Cryptomus API error: ${response.status} - ${errorText}`);
            throw new Error(`Cryptomus payment creation failed: ${response.statusText}`);
        }

        const result = (await response.json()) as {
            state: number;
            result: { uuid: string; url: string; order_id: string };
        };

        return {
            paymentUrl: result.result.url,
            paymentId: result.result.uuid,
        };
    }

    /**
     * Verify webhook signature from Cryptomus
     */
    verifyWebhookSignature(body: Record<string, any>): boolean {
        try {
            const receivedSign = body.sign;
            if (!receivedSign) return false;

            // Remove sign from body for verification
            const bodyWithoutSign = { ...body };
            delete bodyWithoutSign.sign;

            const bodyBase64 = Buffer.from(JSON.stringify(bodyWithoutSign)).toString("base64");
            const expectedSign = crypto
                .createHash("md5")
                .update(bodyBase64 + this.apiKey)
                .digest("hex");

            // Timing-safe comparison
            const bufReceived = Buffer.from(receivedSign, "utf-8");
            const bufExpected = Buffer.from(expectedSign, "utf-8");

            if (bufReceived.length !== bufExpected.length) {
                crypto.timingSafeEqual(bufReceived, bufReceived);
                return false;
            }

            return crypto.timingSafeEqual(bufReceived, bufExpected);
        } catch (error) {
            this.logger.error("Webhook signature verification failed:", error);
            return false;
        }
    }

    /**
     * Parse webhook payload and extract relevant data
     */
    parseWebhookPayload(body: CryptomusWebhookPayload): {
        orderId: string;
        status: string;
        amount: string;
        paymentId: string;
        isFinal: boolean;
    } {
        return {
            orderId: body.order_id,
            status: body.status,
            amount: body.merchant_amount || body.amount,
            paymentId: body.uuid,
            isFinal: body.is_final,
        };
    }
}

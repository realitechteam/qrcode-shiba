import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export interface SepayQRParams {
    orderId: string;
    amount: number;
    orderInfo: string;
    accountNo?: string; // Bank account number
    bankCode?: string;  // Bank code (e.g., "MB", "VCB")
}

export interface SepayWebhookPayload {
    id: number;
    gateway: string;
    transactionDate: string;
    accountNumber: string;
    subAccount: string | null;
    transferType: "in" | "out";
    transferAmount: number;
    accumulated: number;
    code: string | null;
    content: string;
    referenceCode: string;
    description: string;
}

@Injectable()
export class SepayService {
    private readonly apiToken: string;
    private readonly webhookSecret: string;
    private readonly apiUrl = "https://my.sepay.vn/userapi";

    // Bank account for receiving payments
    private readonly bankCode: string;
    private readonly accountNo: string;

    constructor(private configService: ConfigService) {
        this.apiToken = this.configService.get<string>("SEPAY_API_TOKEN", "");
        this.webhookSecret = this.configService.get<string>("SEPAY_WEBHOOK_SECRET", "");
        
        // Load bank info from env or use default/fallback
        this.bankCode = this.configService.get<string>("SEPAY_BANK_CODE", "MB");
        this.accountNo = this.configService.get<string>("SEPAY_ACCOUNT_NO", "0344449999");
    }

    /**
     * Generate VietQR payment URL for the order
     * Uses VietQR.io to generate QR code
     */
    generateVietQRUrl(params: SepayQRParams): string {
        const { orderId, amount, orderInfo } = params;

        // Create payment content with order ID for tracking
        const content = `QRS ${orderId}`;

        // VietQR quick link format
        // https://img.vietqr.io/image/{bankCode}-{accountNo}-<template>.png?amount={amount}&addInfo={content}
        const template = "compact2"; // compact, compact2, qr_only
        const encodedContent = encodeURIComponent(content);

        return `https://img.vietqr.io/image/${this.bankCode}-${this.accountNo}-${template}.png?amount=${amount}&addInfo=${encodedContent}&accountName=QRCode-Shiba`;
    }

    /**
     * Generate QR data for VietQR (can be used with QR libraries)
     */
    generateQRData(params: SepayQRParams): {
        bankCode: string;
        accountNo: string;
        amount: number;
        content: string;
        qrUrl: string;
    } {
        const content = `QRS ${params.orderId}`;

        return {
            bankCode: this.bankCode,
            accountNo: this.accountNo,
            amount: params.amount,
            content,
            qrUrl: this.generateVietQRUrl(params),
        };
    }

    /**
     * Verify webhook signature from SePay
     */
    verifyWebhookSignature(payload: string, signature: string): boolean {
        const hmac = crypto.createHmac("sha256", this.webhookSecret);
        const expectedSignature = hmac.update(payload).digest("hex");
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Parse order ID from webhook content
     * Content format: "QRS {orderId} ..."
     */
    parseOrderIdFromContent(content: string): string | null {
        const match = content.match(/QRS\s+([A-Za-z0-9-]+)/);
        return match ? match[1] : null;
    }

    /**
     * Check transactions via SePay API
     */
    async getTransactions(limit: number = 10): Promise<any[]> {
        const response = await fetch(`${this.apiUrl}/transactions?limit=${limit}`, {
            headers: {
                "Authorization": `Bearer ${this.apiToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`SePay API error: ${response.statusText}`);
        }

        const data = await response.json() as { transactions?: any[] };
        return data.transactions || [];
    }

    /**
     * Get account balance from SePay
     */
    async getBalance(): Promise<number> {
        const response = await fetch(`${this.apiUrl}/bankaccounts`, {
            headers: {
                "Authorization": `Bearer ${this.apiToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`SePay API error: ${response.statusText}`);
        }

        const data = await response.json() as { bankaccounts?: Array<{ accumulated?: number }> };
        return data.bankaccounts?.[0]?.accumulated || 0;
    }
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
let MomoService = class MomoService {
    configService;
    partnerCode;
    accessKey;
    secretKey;
    apiEndpoint;
    constructor(configService) {
        this.configService = configService;
        this.partnerCode = this.configService.get("MOMO_PARTNER_CODE", "");
        this.accessKey = this.configService.get("MOMO_ACCESS_KEY", "");
        this.secretKey = this.configService.get("MOMO_SECRET_KEY", "");
        this.apiEndpoint = this.configService.get("MOMO_API_ENDPOINT", "https://test-payment.momo.vn/v2/gateway/api/create");
    }
    /**
     * Create MoMo payment request
     */
    async createPayment(params) {
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
            const response = await axios_1.default.post(this.apiEndpoint, requestBody);
            return response.data;
        }
        catch (error) {
            console.error("MoMo payment error:", error.response?.data || error.message);
            throw new Error("MoMo payment creation failed");
        }
    }
    /**
     * Verify MoMo callback signature
     */
    verifySignature(data) {
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
    isPaymentSuccessful(resultCode) {
        return resultCode === 0;
    }
    /**
     * Get result message
     */
    getResultMessage(resultCode) {
        const messages = {
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
    generateRequestId() {
        return `${this.partnerCode}${Date.now()}`;
    }
};
exports.MomoService = MomoService;
exports.MomoService = MomoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MomoService);

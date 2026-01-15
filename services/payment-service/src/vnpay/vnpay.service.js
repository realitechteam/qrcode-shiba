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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VnpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const qs = __importStar(require("qs"));
const dayjs = __importStar(require("dayjs"));
let VnpayService = class VnpayService {
    configService;
    tmnCode;
    secretKey;
    vnpUrl;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.tmnCode = this.configService.get("VNPAY_TMN_CODE", "");
        this.secretKey = this.configService.get("VNPAY_SECRET_KEY", "");
        this.vnpUrl = this.configService.get("VNPAY_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        this.apiUrl = this.configService.get("VNPAY_API_URL", "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction");
    }
    /**
     * Create VNPay payment URL
     */
    createPaymentUrl(params) {
        const date = dayjs();
        const createDate = date.format("YYYYMMDDHHmmss");
        const expireDate = date.add(15, "minute").format("YYYYMMDDHHmmss");
        const vnpParams = {
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
    verifyReturnUrl(params) {
        const secureHash = params.vnp_SecureHash;
        const queryParams = { ...params };
        delete queryParams.vnp_SecureHash;
        delete queryParams.vnp_SecureHashType;
        const sortedParams = this.sortObject(queryParams);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac("sha512", this.secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
        return secureHash === signed;
    }
    /**
     * Check if payment was successful
     */
    isPaymentSuccessful(params) {
        return (params.vnp_ResponseCode === "00" &&
            params.vnp_TransactionStatus === "00");
    }
    /**
     * Get VNPay response message
     */
    getResponseMessage(responseCode) {
        const messages = {
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
    sortObject(obj) {
        return Object.keys(obj)
            .sort()
            .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
    }
};
exports.VnpayService = VnpayService;
exports.VnpayService = VnpayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VnpayService);

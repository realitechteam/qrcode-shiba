import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

// Use the payment service URL
const API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:3004/api/v1";

export interface CreatePaymentResponse {
    success: boolean;
    data: {
        orderId: string;
        amount: number;
        planId: string;
        billingCycle: "monthly" | "yearly";
        bankCode: string;
        accountNo: string;
        content: string;
        qrUrl: string;
    };
}

export interface OrderStatusResponse {
    success: boolean;
    data: {
        id: string;
        status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
        planId: string;
        amount: number;
        paidAt?: string;
    };
}

export const paymentService = {
    /**
     * Create a payment order and get QR code data
     */
    async createPayment(planId: string, billingCycle: "monthly" | "yearly"): Promise<CreatePaymentResponse> {
        const { user } = useAuthStore.getState();
        
        if (!user?.id) {
            throw new Error("User not found");
        }

        const response = await axios.post(`${API_URL}/sepay/create-payment`, {
            userId: user.id,
            planId,
            billingCycle,
        });

        return response.data;
    },

    /**
     * Check the status of an order
     */
    async checkOrderStatus(orderId: string): Promise<OrderStatusResponse> {
        const response = await axios.get(`${API_URL}/subscription/orders/${orderId}`);
        return response.data;
    }
};

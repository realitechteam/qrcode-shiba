"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BulkUpload } from "@/components/qr/BulkUpload";

export default function BulkQRPage() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/qr"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </Link>
                <h1 className="text-2xl font-bold">Tạo QR Code hàng loạt</h1>
                <p className="text-gray-500">
                    Upload file CSV để tạo nhiều QR codes cùng lúc
                </p>
            </div>

            {/* Bulk Upload Component */}
            <BulkUpload />
        </div>
    );
}

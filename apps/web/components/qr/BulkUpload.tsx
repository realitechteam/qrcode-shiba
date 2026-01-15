"use client";

import { useState } from "react";
import { Upload, FileText, Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { qrApi } from "@/lib/qr-api";

interface BulkResult {
    jobId: string;
    total: number;
    created: number;
    failed: number;
    errors: { index: number; error: string }[];
    qrCodes: { id: string; name: string; shortCode: string }[];
}

export function BulkUpload() {
    const [csvContent, setCsvContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BulkResult | null>(null);
    const [downloading, setDownloading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setCsvContent(content);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        if (!csvContent.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const response = await qrApi.post("/bulk/csv", { csv: csvContent });
            setResult(response.data);
        } catch (error: any) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadZip = async () => {
        if (!result || result.qrCodes.length === 0) return;

        setDownloading(true);
        try {
            const qrIds = result.qrCodes.map((qr) => qr.id);
            const response = await qrApi.post(
                "/bulk/download",
                { qrIds, size: 512 },
                { responseType: "blob" }
            );

            // Download file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "qrcodes.zip");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            alert("Lỗi tải xuống: " + error.message);
        } finally {
            setDownloading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await qrApi.get("/bulk/template");
            const blob = new Blob([response.data.csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "qrcode-template.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download template:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    📋 Hướng dẫn
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Tải file CSV với các cột: <code>name, url, type</code></li>
                    <li>• Mỗi dòng sẽ tạo một QR code</li>
                    <li>• Tối đa 100 QR codes mỗi lần</li>
                </ul>
                <button
                    onClick={downloadTemplate}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                    <Download className="w-4 h-4" />
                    Tải template mẫu
                </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                />
                <label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                        Kéo thả file CSV hoặc{" "}
                        <span className="text-orange-500 hover:underline">chọn file</span>
                    </span>
                </label>
            </div>

            {/* CSV Preview */}
            {csvContent && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Nội dung CSV</span>
                    </div>
                    <pre className="text-xs bg-white dark:bg-gray-800 border rounded p-3 overflow-x-auto max-h-32">
                        {csvContent.slice(0, 500)}
                        {csvContent.length > 500 && "..."}
                    </pre>
                    <div className="mt-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                "Tạo QR Codes"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Kết quả</h3>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold">{result.total}</div>
                            <div className="text-sm text-gray-500">Tổng cộng</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{result.created}</div>
                            <div className="text-sm text-green-600">Thành công</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                            <div className="text-sm text-red-600">Thất bại</div>
                        </div>
                    </div>

                    {/* QR List */}
                    {result.qrCodes.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                            {result.qrCodes.map((qr) => (
                                <div
                                    key={qr.id}
                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded"
                                >
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">{qr.name}</span>
                                    <span className="text-xs text-gray-400 ml-auto">
                                        {qr.shortCode}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Errors */}
                    {result.errors.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
                            {result.errors.map((err) => (
                                <div
                                    key={err.index}
                                    className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded"
                                >
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">
                                        Dòng {err.index + 2}: {err.error}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Download Button */}
                    {result.created > 0 && (
                        <Button
                            onClick={handleDownloadZip}
                            disabled={downloading}
                            className="w-full"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo ZIP...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Tải xuống tất cả ({result.created} files)
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default BulkUpload;

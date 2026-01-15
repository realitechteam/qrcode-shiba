"use client";

import { useState, useEffect } from "react";
import { FolderIcon, FolderPlusIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import { folderApi, Folder } from "@/lib/qr-api";
import { cn } from "@/lib/utils";

interface FolderSidebarProps {
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    className?: string;
}

export function FolderSidebar({ selectedFolderId, onSelectFolder, className }: FolderSidebarProps) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [creating, setCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        try {
            const data = await folderApi.getTree();
            setFolders(data);
        } catch (error) {
            console.error("Failed to load folders:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            await folderApi.create({ name: newFolderName.trim() });
            setNewFolderName("");
            setCreating(false);
            loadFolders();
        } catch (error) {
            console.error("Failed to create folder:", error);
        }
    };

    const renderFolder = (folder: Folder, depth: number = 0) => {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = expandedIds.has(folder.id);
        const isSelected = selectedFolderId === folder.id;

        return (
            <div key={folder.id}>
                <div
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        isSelected && "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    )}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}
                    onClick={() => onSelectFolder(folder.id)}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(folder.id);
                            }}
                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4" />
                            )}
                        </button>
                    ) : (
                        <span className="w-5" />
                    )}
                    <FolderIcon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: folder.color || "#6B7280" }}
                    />
                    <span className="flex-1 truncate text-sm">{folder.name}</span>
                    <span className="text-xs text-gray-400">{folder.qrCount}</span>
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {folder.children!.map((child) => renderFolder(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn("w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Thư mục</h3>
                <button
                    onClick={() => setCreating(true)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Tạo thư mục mới"
                >
                    <FolderPlusIcon className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Create new folder input */}
            {creating && (
                <div className="mb-3">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Tên thư mục..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateFolder();
                            if (e.key === "Escape") {
                                setCreating(false);
                                setNewFolderName("");
                            }
                        }}
                        onBlur={() => {
                            if (!newFolderName.trim()) {
                                setCreating(false);
                            }
                        }}
                    />
                </div>
            )}

            {/* All QRs option */}
            <div
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-2",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    selectedFolderId === null && "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                )}
                onClick={() => onSelectFolder(null)}
            >
                <span className="w-5" />
                <FolderIcon className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-sm">Tất cả mã QR</span>
            </div>

            {/* Folder tree */}
            {loading ? (
                <div className="text-sm text-gray-400 px-3 py-2">Đang tải...</div>
            ) : folders.length === 0 ? (
                <div className="text-sm text-gray-400 px-3 py-2">Chưa có thư mục nào</div>
            ) : (
                <div className="space-y-1">
                    {folders.map((folder) => renderFolder(folder))}
                </div>
            )}
        </div>
    );
}

export default FolderSidebar;

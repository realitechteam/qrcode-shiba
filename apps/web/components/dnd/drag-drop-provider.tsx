"use client";

import { useState, useEffect, useCallback } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import { QrCode, FolderOpen, Loader2, Plus, ChevronRight, Trash2, Pencil, MoreVertical, X } from "lucide-react";
import { DroppableFolder } from "./droppable-folder";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import qrApi from "@/lib/qr-api";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Folder {
    id: string;
    name: string;
    color?: string;
    qrCount: number;
}

interface DragDropProviderProps {
    children: React.ReactNode;
    onQRMovedToFolder?: (qrId: string, folderId: string) => void;
    showFolderPanel?: boolean;
    onToggleFolderPanel?: () => void;
}

const FOLDER_COLORS = [
    "#ff7c10", "#ef4444", "#22c55e", "#3b82f6", 
    "#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6"
];

export function DragDropProvider({ 
    children, 
    onQRMovedToFolder,
    showFolderPanel = false,
    onToggleFolderPanel
}: DragDropProviderProps) {
    const { toast } = useToast();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    
    // Create folder state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderColor, setNewFolderColor] = useState("#ff7c10");
    const [isCreating, setIsCreating] = useState(false);
    
    // Delete folder state
    const [deleteTarget, setDeleteTarget] = useState<Folder | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        })
    );

    const fetchFolders = useCallback(async () => {
        try {
            setIsLoadingFolders(true);
            const response = await qrApi.get("/folders");
            const data = Array.isArray(response.data) ? response.data : response.data.items || [];
            setFolders(data);
        } catch (err) {
            console.error("Failed to fetch folders:", err);
        } finally {
            setIsLoadingFolders(false);
        }
    }, []);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        
        setIsCreating(true);
        try {
            await qrApi.post("/folders", { name: newFolderName.trim(), color: newFolderColor });
            toast({ title: "Đã tạo thư mục", description: newFolderName });
            setNewFolderName("");
            setNewFolderColor("#ff7c10");
            setShowCreateModal(false);
            fetchFolders();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err.response?.data?.message || "Không thể tạo thư mục",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteFolder = async () => {
        if (!deleteTarget) return;
        
        setIsDeleting(true);
        try {
            await qrApi.delete(`/folders/${deleteTarget.id}`);
            toast({ title: "Đã xóa thư mục", description: deleteTarget.name });
            setDeleteTarget(null);
            fetchFolders();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err.response?.data?.message || "Không thể xóa thư mục",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setIsDragging(true);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveId(null);
        setIsDragging(false);

        if (!over) return;

        const qrId = active.id as string;
        const droppableId = over.id as string;

        if (droppableId.startsWith("folder-")) {
            const folderId = droppableId.replace("folder-", "");
            
            setIsMoving(true);
            try {
                await qrApi.patch(`/qr/${qrId}`, { folderId });
                const folder = folders.find(f => f.id === folderId);
                toast({
                    title: "Đã di chuyển QR",
                    description: `Đã thêm vào "${folder?.name || 'thư mục'}"`,
                });
                onQRMovedToFolder?.(qrId, folderId);
                fetchFolders();
            } catch (err: any) {
                toast({
                    title: "Lỗi di chuyển",
                    description: err.response?.data?.message || "Không thể di chuyển QR code",
                    variant: "destructive",
                });
            } finally {
                setIsMoving(false);
            }
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
        setIsDragging(false);
    };

    const showPanel = showFolderPanel || isDragging;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex gap-4">
                {/* Main Content */}
                <div className={cn("flex-1 min-w-0 transition-all", showPanel && "lg:mr-72")}>
                    {children}
                </div>

                {/* Folder Panel - Always visible on desktop when toggled or dragging */}
                <div
                    className={cn(
                        "fixed right-0 top-[73px] bottom-0 w-72 bg-card border-l z-30 transition-transform duration-300 overflow-hidden lg:top-0",
                        showPanel ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-shiba-500" />
                            <span className="font-semibold">Thư mục</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            {onToggleFolderPanel && !isDragging && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={onToggleFolderPanel}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Folders List */}
                    <div className="p-3 space-y-1 max-h-[calc(100%-60px)] overflow-y-auto">
                        {isDragging && (
                            <p className="text-xs text-muted-foreground text-center py-2 mb-2">
                                Kéo QR vào thư mục để di chuyển
                            </p>
                        )}
                        
                        {isLoadingFolders ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : folders.length === 0 ? (
                            <div className="text-center py-8">
                                <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground mb-3">Chưa có thư mục</p>
                                <Button
                                    size="sm"
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-shiba-500 hover:bg-shiba-600"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Tạo thư mục
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* All QR (no folder) */}
                                <Link
                                    href="/dashboard/qr"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <QrCode className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">Tất cả QR</span>
                                </Link>
                                
                                {/* Folder list */}
                                {folders.map((folder) => (
                                    <div key={folder.id} className="group relative">
                                        <DroppableFolder
                                            id={folder.id}
                                            name={folder.name}
                                            color={folder.color}
                                            qrCount={folder.qrCount}
                                        />
                                        {!isDragging && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <Link href={`/dashboard/folders/${folder.id}/edit`}>
                                                    <button className="p-1.5 rounded hover:bg-muted">
                                                        <Pencil className="h-3 w-3" />
                                                    </button>
                                                </Link>
                                                <button 
                                                    className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                                                    onClick={() => setDeleteTarget(folder)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeId ? (
                    <div className="bg-card rounded-xl border shadow-2xl p-4 w-64 opacity-90">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-shiba-100 dark:bg-shiba-900/30 flex items-center justify-center">
                                <QrCode className="h-5 w-5 text-shiba-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Đang di chuyển...</p>
                                <p className="text-xs text-muted-foreground">Thả vào thư mục</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

            {/* Create Folder Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold mb-4">Tạo thư mục mới</h2>
                        <input
                            type="text"
                            placeholder="Tên thư mục"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-shiba-500 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-2 mb-4">
                            {FOLDER_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setNewFolderColor(c)}
                                    className={cn(
                                        "h-6 w-6 rounded-full transition-transform hover:scale-110",
                                        newFolderColor === c && "ring-2 ring-offset-2 ring-shiba-500"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="flex-1 bg-shiba-500 hover:bg-shiba-600"
                                onClick={handleCreateFolder}
                                disabled={isCreating || !newFolderName.trim()}
                            >
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tạo"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold mb-2">Xóa thư mục?</h2>
                        <p className="text-muted-foreground mb-6">
                            Xóa "{deleteTarget.name}"? QR codes trong thư mục sẽ không bị xóa.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDeleteFolder}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xóa"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Moving Overlay */}
            {isMoving && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                    <div className="bg-card rounded-xl p-6 shadow-2xl flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-shiba-500" />
                        <span>Đang di chuyển...</span>
                    </div>
                </div>
            )}
        </DndContext>
    );
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StylingOptions } from "@/app/(dashboard)/dashboard/qr/new/components/qr-styling";

interface QRCreationDraft {
    selectedType: string;
    formData: Record<string, any>;
    styling: StylingOptions;
    qrName: string;
    currentStep: number;
    lastUpdated: number;
}

interface QRCreationStore {
    // Draft state
    draft: QRCreationDraft | null;
    
    // Actions
    saveDraft: (draft: Omit<QRCreationDraft, "lastUpdated">) => void;
    loadDraft: () => QRCreationDraft | null;
    clearDraft: () => void;
    hasDraft: () => boolean;
}

const DEFAULT_STYLING: StylingOptions = {
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    dotsStyle: "square",
    cornersSquareStyle: "square",
    cornersDotStyle: "square",
};

// Draft expires after 24 hours
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const useQRCreationStore = create<QRCreationStore>()(
    persist(
        (set, get) => ({
            draft: null,

            saveDraft: (draftData) => {
                set({
                    draft: {
                        ...draftData,
                        lastUpdated: Date.now(),
                    },
                });
            },

            loadDraft: () => {
                const { draft } = get();
                if (!draft) return null;
                
                // Check if draft has expired
                if (Date.now() - draft.lastUpdated > DRAFT_EXPIRY_MS) {
                    set({ draft: null });
                    return null;
                }
                
                return draft;
            },

            clearDraft: () => {
                set({ draft: null });
            },

            hasDraft: () => {
                const { draft } = get();
                if (!draft) return false;
                
                // Check if draft has expired
                if (Date.now() - draft.lastUpdated > DRAFT_EXPIRY_MS) {
                    return false;
                }
                
                // Check if draft has meaningful data
                return draft.currentStep > 1 || 
                       Object.keys(draft.formData).length > 0 ||
                       draft.qrName.trim().length > 0;
            },
        }),
        {
            name: "qr-creation-draft",
            partialize: (state) => ({ draft: state.draft }),
        }
    )
);

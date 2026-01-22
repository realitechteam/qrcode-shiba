import axios from "axios";

const QR_API_URL = process.env.NEXT_PUBLIC_QR_API_URL || "https://qr-service-production-f6fd.up.railway.app/api/v1";

export const qrApi = axios.create({
    baseURL: QR_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add user ID from auth storage
qrApi.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                const userId = parsed?.state?.user?.id;
                if (userId) {
                    config.headers["x-user-id"] = userId;
                }
            } catch {
                // Ignore parse errors
            }
        }
    }
    return config;
});

// Folder types
export interface Folder {
    id: string;
    name: string;
    color: string | null;
    parentId: string | null;
    qrCount: number;
    children?: Folder[];
}

// Folder API functions
export const folderApi = {
    getTree: async (): Promise<Folder[]> => {
        const response = await qrApi.get("/folders");
        return response.data;
    },

    getList: async (): Promise<Folder[]> => {
        const response = await qrApi.get("/folders/list");
        return response.data;
    },

    getOne: async (id: string): Promise<Folder> => {
        const response = await qrApi.get(`/folders/${id}`);
        return response.data;
    },

    create: async (data: { name: string; color?: string; parentId?: string }): Promise<Folder> => {
        const response = await qrApi.post("/folders", data);
        return response.data;
    },

    update: async (id: string, data: { name?: string; color?: string; parentId?: string }): Promise<Folder> => {
        const response = await qrApi.patch(`/folders/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await qrApi.delete(`/folders/${id}`);
    },

    moveQR: async (folderId: string | null, qrId: string): Promise<any> => {
        if (folderId) {
            const response = await qrApi.patch(`/folders/${folderId}/qr/${qrId}`);
            return response.data;
        } else {
            const response = await qrApi.patch(`/folders/root/qr/${qrId}`);
            return response.data;
        }
    },
};

export default qrApi;

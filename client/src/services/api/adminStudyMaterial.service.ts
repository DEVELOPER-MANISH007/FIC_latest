import axios from "axios";
import api from "./axiosInstance";
import type { ApiResponse, PaginatedResponse, StudyMaterialItem } from "@/types";

export interface AdminMaterialFilters {
  page?: number;
  limit?: number;
  subject?: string;
  visibility?: string;
  keyword?: string;
  sortBy?: "latest" | "oldest" | "downloads" | "title";
}

export const fetchAdminMaterials = async (filters: AdminMaterialFilters = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<StudyMaterialItem>>>("/admin/materials", {
    params: filters,
  });
  return res.data.data;
};

/** Distinct subject names currently in use — powers the admin Subject filter dropdown. */
export const fetchAdminMaterialSubjects = async (): Promise<string[]> => {
  const res = await api.get<ApiResponse<string[]>>("/admin/materials/subjects");
  return res.data.data || [];
};

export const fetchAdminMaterialById = async (id: string) => {
  const res = await api.get<ApiResponse<StudyMaterialItem>>(`/admin/materials/${id}`);
  return res.data.data;
};

/** `payload` must include a "file" field (FormData) on create, or the
 *  direct-upload metadata fields (fileUrl/filePublicId/fileResourceType/
 *  fileName/fileSize) as a plain object. */
export const createMaterial = async (payload: FormData | Record<string, unknown>) => {
  const res = await api.post<ApiResponse<StudyMaterialItem>>("/admin/materials", payload);
  return res.data.data;
};

/** `payload` — file/direct-upload fields are optional; omit to keep the
 *  existing uploaded file. */
export const updateMaterial = async (id: string, payload: FormData | Record<string, unknown>) => {
  const res = await api.put<ApiResponse<StudyMaterialItem>>(`/admin/materials/${id}`, payload);
  return res.data.data;
};

interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  resourceType: "image" | "raw";
  apiKey: string;
  cloudName: string;
}

export interface DirectUploadResult {
  fileUrl: string;
  filePublicId: string;
  fileResourceType: string;
  fileName: string;
  fileSize: number;
}

/** Asks our backend for a short-lived signature (tiny JSON call — never hits
 *  Vercel's request-body limit). */
const getMaterialUploadSignature = async (fileName: string) => {
  const res = await api.post<ApiResponse<UploadSignature>>("/admin/materials/upload-signature", { fileName });
  return res.data.data;
};

/**
 * Uploads a file *directly* to Cloudinary from the browser, bypassing our
 * Vercel serverless function entirely — this is what lets large PDFs/images
 * succeed in production even though Vercel caps request bodies at ~4.5MB.
 * Uses a plain axios instance (not the shared `api`) so the admin's bearer
 * token is never sent to Cloudinary.
 */
export const uploadMaterialFileDirect = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<DirectUploadResult> => {
  const sig = await getMaterialUploadSignature(file.name);

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const cloudRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
    form,
    {
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded * 100) / event.total));
      },
    }
  );

  return {
    fileUrl: cloudRes.data.secure_url,
    filePublicId: cloudRes.data.public_id,
    fileResourceType: sig.resourceType,
    fileName: file.name,
    fileSize: file.size,
  };
};

export const deleteMaterial = async (id: string) => {
  await api.delete(`/admin/materials/${id}`);
};

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

/** `formData` must include a "file" field on create. */
export const createMaterial = async (formData: FormData) => {
  const res = await api.post<ApiResponse<StudyMaterialItem>>("/admin/materials", formData);
  return res.data.data;
};

/** `formData` — "file" is optional; omit it to keep the existing uploaded file. */
export const updateMaterial = async (id: string, formData: FormData) => {
  const res = await api.put<ApiResponse<StudyMaterialItem>>(`/admin/materials/${id}`, formData);
  return res.data.data;
};

export const deleteMaterial = async (id: string) => {
  await api.delete(`/admin/materials/${id}`);
};

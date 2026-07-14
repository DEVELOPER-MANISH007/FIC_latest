import api from "./axiosInstance";
import type { ApiResponse, PaginatedResponse, StudyMaterialItem } from "@/types";

export interface PublicMaterialFilters {
  page?: number;
  limit?: number;
  subject?: string;
  keyword?: string;
  sortBy?: "latest" | "oldest";
}

/** Public Notes Library — no auth token is attached; works for signed-out visitors. */
export const fetchPublicMaterials = async (filters: PublicMaterialFilters = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<StudyMaterialItem>>>("/public/materials", {
    params: filters,
  });
  return res.data.data;
};

export const fetchPublicMaterialSubjects = async (): Promise<string[]> => {
  const res = await api.get<ApiResponse<string[]>>("/public/materials/subjects");
  return res.data.data || [];
};

export const fetchPublicMaterialById = async (id: string) => {
  const res = await api.get<ApiResponse<StudyMaterialItem>>(`/public/materials/${id}`);
  return res.data.data;
};

export const registerPublicDownload = async (id: string) => {
  const res = await api.post<ApiResponse<{ fileUrl: string; fileName?: string }>>(`/public/materials/${id}/download`);
  return res.data.data;
};

import api from "./axiosInstance";
import type { ApiResponse, PaginatedResponse, StudyMaterialItem } from "@/types";

export interface MaterialFilters {
  page?: number;
  limit?: number;
  subject?: string;
  keyword?: string;
  sortBy?: "latest" | "oldest";
  /** "My Notes" mode — only material the student can actually open, no locked entries. */
  accessibleOnly?: boolean;
}

export const fetchMaterials = async (filters: MaterialFilters = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<StudyMaterialItem>>>("/materials", { params: filters });
  return res.data.data;
};

/** Distinct subjects among materials visible to the logged-in student. */
export const fetchMaterialSubjects = async (): Promise<string[]> => {
  const res = await api.get<ApiResponse<string[]>>("/materials/subjects");
  return res.data.data || [];
};

export const fetchMaterialById = async (id: string) => {
  const res = await api.get<ApiResponse<StudyMaterialItem>>(`/materials/${id}`);
  return res.data.data;
};

/** Increments the server-side download count, then returns the file URL to download. */
export const registerDownload = async (id: string) => {
  const res = await api.post<ApiResponse<{ fileUrl: string; fileName?: string }>>(`/materials/${id}/download`);
  return res.data.data;
};

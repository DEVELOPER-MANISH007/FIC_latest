import api from "./axiosInstance";
import type { ApiResponse, AttemptLogItem, PaginatedResponse } from "@/types";

export interface AttemptLogFilters {
  page?: number;
  limit?: number;
  flaggedOnly?: boolean;
}

export const fetchAttemptLogs = async (filters: AttemptLogFilters = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<AttemptLogItem>>>("/admin/attempts", { params: filters });
  return res.data.data;
};

export const fetchAttemptLogById = async (id: string) => {
  const res = await api.get<ApiResponse<AttemptLogItem>>(`/admin/attempts/${id}`);
  return res.data.data;
};

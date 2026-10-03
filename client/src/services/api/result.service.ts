import api from "./axiosInstance";
import type { ApiResponse } from "@/types";
import type { ResultData, Paginated } from "@/types/portal";

export const fetchMyResults = async () => {
  const { data } = await api.get<ApiResponse<ResultData[]>>("/results/my");
  return data.data;
};

export const fetchResultById = async (id: string) => {
  const { data } = await api.get<ApiResponse<ResultData>>(`/results/${id}`);
  return data.data;
};

export const fetchAllResults = async (filters: { student?: string; test?: string; page?: number; limit?: number } = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v !== undefined && params.set(k, String(v)));
  const { data } = await api.get<ApiResponse<Paginated<ResultData>>>(`/results/admin/all?${params.toString()}`);
  return data.data;
};

export const downloadResultsExport = async (filters: { student?: string; test?: string } = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && params.set(k, String(v)));
  const response = await api.get(`/results/admin/export?${params.toString()}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "results-export.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};


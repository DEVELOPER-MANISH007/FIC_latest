import api from "./axiosInstance";
import type { ApiResponse, ExamResult, PaginatedResponse } from "@/types";

export const fetchAdminResults = async (
  params: { page?: number; limit?: number; student?: string; exam?: string; keyword?: string } = {}
) => {
  const res = await api.get<ApiResponse<PaginatedResponse<ExamResult>>>("/admin/results", { params });
  return res.data.data;
};

export const exportResultsExcel = async (params: { student?: string; exam?: string } = {}) => {
  const res = await api.get("/admin/results/export", { params, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "results-export.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
};


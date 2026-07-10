import api from "./axiosInstance";
import type { AdmissionRecord, AdmissionStatus, ApiResponse, PaginatedResponse } from "@/types";

export interface AdmissionListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  course?: string;
  status?: string;
}

export const fetchAdmissions = async (params: AdmissionListParams = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<AdmissionRecord>>>("/admin/admissions", { params });
  return res.data.data;
};

export const fetchAdmissionById = async (id: string) => {
  const res = await api.get<ApiResponse<AdmissionRecord>>(`/admin/admissions/${id}`);
  return res.data.data;
};

export const updateAdmissionStatus = async (id: string, status: AdmissionStatus) => {
  const res = await api.put<ApiResponse<AdmissionRecord>>(`/admin/admissions/${id}`, { status });
  return res.data.data;
};

export const deleteAdmission = async (id: string) => {
  await api.delete(`/admin/admissions/${id}`);
};

/** Triggers a browser download of the (filtered) admission list as CSV. */
export const exportAdmissionsCSV = async (params: AdmissionListParams = {}) => {
  const res = await api.get("/admin/admissions/export", { params, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "admission-forms.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

import api from "./axiosInstance";
import type { ApiResponse, EnquiryRecord, EnquiryStatus, PaginatedResponse } from "@/types";

export interface EnquiryListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}

export const fetchEnquiries = async (params: EnquiryListParams = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<EnquiryRecord>>>("/admin/enquiries", { params });
  return res.data.data;
};

export const fetchEnquiryById = async (id: string) => {
  const res = await api.get<ApiResponse<EnquiryRecord>>(`/admin/enquiries/${id}`);
  return res.data.data;
};

export const updateEnquiryStatus = async (id: string, status: EnquiryStatus) => {
  const res = await api.put<ApiResponse<EnquiryRecord>>(`/admin/enquiries/${id}`, { status });
  return res.data.data;
};

export const deleteEnquiry = async (id: string) => {
  await api.delete(`/admin/enquiries/${id}`);
};

/** Triggers a browser download of the (filtered) enquiry list as CSV. */
export const exportEnquiriesCSV = async (params: EnquiryListParams = {}) => {
  const res = await api.get("/admin/enquiries/export", { params, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "enquiry-forms.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

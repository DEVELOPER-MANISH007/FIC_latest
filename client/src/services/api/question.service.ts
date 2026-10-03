import api from "./axiosInstance";
import type { ApiResponse } from "@/types";
import type { QuestionBankItem, Paginated, ImportSummary } from "@/types/portal";

export interface QuestionFilters {
  category?: string;
  difficulty?: string;
  status?: string;
  keyword?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

const buildQuery = (filters: QuestionFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchQuestions = async (filters: QuestionFilters = {}) => {
  const { data } = await api.get<ApiResponse<Paginated<QuestionBankItem>>>(`/admin/questions${buildQuery(filters)}`);
  return data.data;
};

export const fetchQuestionById = async (id: string) => {
  const { data } = await api.get<ApiResponse<QuestionBankItem>>(`/admin/questions/${id}`);
  return data.data;
};

export const createQuestion = async (payload: Partial<QuestionBankItem>) => {
  const { data } = await api.post<ApiResponse<QuestionBankItem>>("/admin/questions", payload);
  return data.data;
};

export const updateQuestion = async (id: string, payload: Partial<QuestionBankItem>) => {
  const { data } = await api.put<ApiResponse<QuestionBankItem>>(`/admin/questions/${id}`, payload);
  return data.data;
};

export const deleteQuestion = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/questions/${id}`);
  return data.message;
};

export const duplicateQuestion = async (id: string) => {
  const { data } = await api.post<ApiResponse<QuestionBankItem>>(`/admin/questions/${id}/duplicate`);
  return data.data;
};

export const bulkDeleteQuestions = async (ids: string[]) => {
  const { data } = await api.post<ApiResponse<{ deletedCount: number }>>("/admin/questions/bulk-delete", { ids });
  return data.data;
};

export const importQuestions = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ApiResponse<ImportSummary>>("/admin/questions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const downloadQuestionsExport = async (filters: QuestionFilters = {}) => {
  const response = await api.get(`/admin/questions/export${buildQuery(filters)}`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "questions-export.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const fetchQuestionAnalytics = async () => {
  const { data } = await api.get<ApiResponse<any>>("/admin/questions/analytics");
  return data.data;
};


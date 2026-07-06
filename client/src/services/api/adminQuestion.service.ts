import api from "./axiosInstance";
import type { ApiResponse, PaginatedResponse, QuestionBankItem } from "@/types";

export interface QuestionFilters {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  status?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const fetchQuestions = async (filters: QuestionFilters = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<QuestionBankItem>>>("/admin/questions", {
    params: filters,
  });
  return res.data.data;
};

export const fetchQuestionById = async (id: string) => {
  const res = await api.get<ApiResponse<QuestionBankItem>>(`/admin/questions/${id}`);
  return res.data.data;
};

export const createQuestion = async (payload: Partial<QuestionBankItem>) => {
  const res = await api.post<ApiResponse<QuestionBankItem>>("/admin/questions", payload);
  return res.data.data;
};

export const updateQuestion = async (id: string, payload: Partial<QuestionBankItem>) => {
  const res = await api.put<ApiResponse<QuestionBankItem>>(`/admin/questions/${id}`, payload);
  return res.data.data;
};

export const deleteQuestion = async (id: string) => {
  await api.delete(`/admin/questions/${id}`);
};

export const duplicateQuestion = async (id: string) => {
  const res = await api.post<ApiResponse<QuestionBankItem>>(`/admin/questions/${id}/duplicate`);
  return res.data.data;
};

export const bulkDeleteQuestions = async (ids: string[]) => {
  const res = await api.post<ApiResponse<{ deletedCount: number }>>("/admin/questions/bulk-delete", { ids });
  return res.data.data;
};

export const importQuestionsExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<ApiResponse<{
    importedCount: number;
    failedCount: number;
    duplicateCount: number;
    failed: { row: number; reason: string }[];
    duplicates: { row: number; question: string }[];
  }>>("/admin/questions/import", formData);
  return res.data.data;
};

export const exportQuestionsExcel = async (filters: { category?: string; topic?: string; difficulty?: string } = {}) => {
  const res = await api.get("/admin/questions/export", { params: filters, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "questions-export.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const fetchQuestionAnalytics = async () => {
  const res = await api.get<ApiResponse<{
    total: number;
    byCategory: { category: string; count: number }[];
    byDifficulty: { _id: string; count: number }[];
    recentlyAdded: QuestionBankItem[];
    unusedCount: number;
    frequentlyUsed: QuestionBankItem[];
  }>>("/admin/questions/analytics");
  return res.data.data;
};

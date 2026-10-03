import api from "./axiosInstance";
import type { ApiResponse, Category } from "@/types";

export const fetchCategories = async () => {
  const res = await api.get<ApiResponse<Category[]>>("/categories");
  return res.data.data;
};

export const createCategory = async (payload: { name: string; description?: string }) => {
  const res = await api.post<ApiResponse<Category>>("/categories", payload);
  return res.data.data;
};

export const updateCategory = async (id: string, payload: Partial<Category>) => {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return res.data.data;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`);
};


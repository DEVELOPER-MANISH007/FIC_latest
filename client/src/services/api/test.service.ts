import api from "./axiosInstance";
import type { ApiResponse } from "@/types";
import type { TestConfig } from "@/types/portal";

export const fetchActiveTests = async () => {
  const { data } = await api.get<ApiResponse<TestConfig[]>>("/tests");
  return data.data;
};

export const fetchAllTests = async () => {
  const { data } = await api.get<ApiResponse<TestConfig[]>>("/tests/admin/all");
  return data.data;
};

export const createTest = async (payload: Partial<TestConfig>) => {
  const { data } = await api.post<ApiResponse<TestConfig>>("/tests/admin", payload);
  return data.data;
};

export const updateTest = async (id: string, payload: Partial<TestConfig>) => {
  const { data } = await api.put<ApiResponse<TestConfig>>(`/tests/admin/${id}`, payload);
  return data.data;
};

export const deleteTest = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/tests/admin/${id}`);
  return data.message;
};


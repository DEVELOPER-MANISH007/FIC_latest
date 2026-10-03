import api from "./axiosInstance";
import type { ContactFormData, ApiResponse } from "@/types";

export const submitContact = async (
  payload: ContactFormData
): Promise<ApiResponse<{ id: string }>> => {
  const { data } = await api.post<ApiResponse<{ id: string }>>("/contact", payload);
  return data;
};


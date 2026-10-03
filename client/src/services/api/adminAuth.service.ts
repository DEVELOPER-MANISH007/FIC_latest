import api from "./axiosInstance";
import type { AdminUser, ApiResponse, LoginFormData } from "@/types";

interface AdminAuthPayload { token: string; admin: AdminUser }

export const loginAdmin = async (data: LoginFormData) => {
  const res = await api.post<ApiResponse<AdminAuthPayload>>("/admin/auth/login", data);
  return res.data.data;
};

export const getAdminMe = async () => {
  const res = await api.get<ApiResponse<AdminUser>>("/admin/auth/me");
  return res.data.data;
};


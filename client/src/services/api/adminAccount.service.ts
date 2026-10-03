import api from "./axiosInstance";
import type { ApiResponse, AdminUser } from "@/types";

export interface AdminAccountUpdate {
  currentPassword: string;
  adminId?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const updateAdminAccount = async (payload: AdminAccountUpdate) => {
  const { data } = await api.patch<ApiResponse<{ token: string; admin: AdminUser }>>("/admin/auth/account", payload);
  if (!data.data) throw new Error("The account update response was incomplete.");
  return data.data;
};

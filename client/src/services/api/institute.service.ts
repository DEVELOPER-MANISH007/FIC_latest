import api from "./axiosInstance";
import type { ApiResponse, InstituteDetails } from "@/types";

export const fetchInstituteDetails = async (): Promise<InstituteDetails | null> => {
  try {
    const { data } = await api.get<ApiResponse<InstituteDetails>>("/institute");
    return data.data;
  } catch {
    return null;
  }
};


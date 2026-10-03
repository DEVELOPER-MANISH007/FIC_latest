import api from "./axiosInstance";
import type { ApiResponse, FacultyMember } from "@/types";

export const fetchFaculty = async (): Promise<FacultyMember[]> => {
  const { data } = await api.get<ApiResponse<FacultyMember[]>>("/faculty");
  return data.data || [];
};


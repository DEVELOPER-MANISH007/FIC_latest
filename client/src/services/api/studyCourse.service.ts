import api from "./axiosInstance";
import type { ApiResponse, StudyCourseItem } from "@/types";

/** Active courses + active subjects — used by student filters and the admin upload form. */
export const fetchStudyCourses = async (): Promise<StudyCourseItem[]> => {
  const res = await api.get<ApiResponse<StudyCourseItem[]>>("/study-courses");
  return res.data.data || [];
};

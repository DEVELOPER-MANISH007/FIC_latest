import api from "./axiosInstance";
import type { ApiResponse, Course } from "@/types";
import { COURSES_FALLBACK } from "@/constants/siteData";

/**
 * Fetches courses from the API. Falls back to the static course
 * list (identical content) if the backend is unreachable, so the
 * page still renders fully during frontend-only development.
 */
export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const { data } = await api.get<ApiResponse<Course[]>>("/courses");
    return data.data || [];
  } catch {
    return COURSES_FALLBACK;
  }
};

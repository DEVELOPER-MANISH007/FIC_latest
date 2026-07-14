import api from "./axiosInstance";
import type { ApiResponse, StudyCourseItem } from "@/types";

export const fetchAdminStudyCourses = async (): Promise<StudyCourseItem[]> => {
  const res = await api.get<ApiResponse<StudyCourseItem[]>>("/admin/study-courses");
  return res.data.data || [];
};

export const createStudyCourse = async (payload: { name: string; description?: string }) => {
  const res = await api.post<ApiResponse<StudyCourseItem>>("/admin/study-courses", payload);
  return res.data.data;
};

export const updateStudyCourse = async (
  id: string,
  payload: Partial<{ name: string; description: string; isActive: boolean }>
) => {
  const res = await api.put<ApiResponse<StudyCourseItem>>(`/admin/study-courses/${id}`, payload);
  return res.data.data;
};

export const deleteStudyCourse = async (id: string) => {
  await api.delete(`/admin/study-courses/${id}`);
};

export const addStudySubject = async (courseId: string, name: string) => {
  const res = await api.post<ApiResponse<StudyCourseItem>>(`/admin/study-courses/${courseId}/subjects`, { name });
  return res.data.data;
};

export const updateStudySubject = async (
  courseId: string,
  subjectId: string,
  payload: Partial<{ name: string; isActive: boolean }>
) => {
  const res = await api.put<ApiResponse<StudyCourseItem>>(
    `/admin/study-courses/${courseId}/subjects/${subjectId}`,
    payload
  );
  return res.data.data;
};

export const deleteStudySubject = async (courseId: string, subjectId: string) => {
  await api.delete(`/admin/study-courses/${courseId}/subjects/${subjectId}`);
};

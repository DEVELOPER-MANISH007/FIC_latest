import api from "./axiosInstance";
import type { ApiResponse, ExamResult, PaginatedResponse, StudentUser } from "@/types";

type RawStudent = StudentUser & { _id?: string; isActive?: boolean };

/** Resolve student ID from API payloads that may use `id` or MongoDB `_id`. */
export const getStudentId = (student: Pick<RawStudent, "id" | "_id">): string | undefined => {
  const id = student.id ?? student._id;
  if (!id || String(id) === "undefined") return undefined;
  return String(id);
};

const normalizeStudent = (raw: RawStudent): StudentUser & { isActive?: boolean } => ({
  id: getStudentId(raw) || "",
  name: raw.name,
  email: raw.email,
  phone: raw.phone,
  address: raw.address,
  course: raw.course,
  photo: raw.photo,
  studentIdCode: raw.studentIdCode,
  createdAt: raw.createdAt,
  isActive: raw.isActive,
});

export const fetchStudents = async (params: { page?: number; limit?: number; keyword?: string } = {}) => {
  const res = await api.get<ApiResponse<PaginatedResponse<RawStudent>>>("/admin/students", { params });
  const data = res.data.data;
  return {
    ...data,
    items: (data?.items || []).map(normalizeStudent),
  };
};

export const fetchStudentProfile = async (id: string) => {
  const res = await api.get<ApiResponse<{ student: RawStudent; results: ExamResult[] }>>(
    `/admin/students/${id}`
  );
  const data = res.data.data;
  if (!data) return data;
  return {
    ...data,
    student: normalizeStudent(data.student),
  };
};

export const toggleStudentStatus = async (id: string, isActive: boolean) => {
  const res = await api.patch<ApiResponse<StudentUser>>(`/admin/students/${id}/disable`, { isActive });
  return res.data.data;
};

export const deleteStudent = async (id: string) => {
  await api.delete(`/admin/students/${id}`);
};

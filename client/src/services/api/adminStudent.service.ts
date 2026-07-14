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
  username: raw.username,
  phone: raw.phone,
  address: raw.address,
  course: raw.course,
  batch: raw.batch,
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

export interface CreateStudentPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  username?: string;
  course?: string;
  batch?: string;
  address?: string;
  isActive?: boolean;
}

/** Admin-only student account creation — public self-registration has been removed. */
export const createStudent = async (payload: CreateStudentPayload) => {
  const res = await api.post<ApiResponse<RawStudent>>("/admin/students", payload);
  return res.data.data ? normalizeStudent(res.data.data) : null;
};

export interface UpdateStudentPayload {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  course?: string;
  batch?: string;
  address?: string;
  isActive?: boolean;
}

/** Edits profile fields only — password changes always go through resetStudentPassword. */
export const updateStudent = async (id: string, payload: UpdateStudentPayload) => {
  const res = await api.put<ApiResponse<RawStudent>>(`/admin/students/${id}`, payload);
  return res.data.data ? normalizeStudent(res.data.data) : null;
};

export const toggleStudentStatus = async (id: string, isActive: boolean) => {
  const res = await api.patch<ApiResponse<StudentUser>>(`/admin/students/${id}/disable`, { isActive });
  return res.data.data;
};

/** Admin sets a new password for a student — no old password required. */
export const resetStudentPassword = async (id: string, newPassword: string) => {
  await api.patch(`/admin/students/${id}/reset-password`, { newPassword });
};

export const deleteStudent = async (id: string) => {
  await api.delete(`/admin/students/${id}`);
};

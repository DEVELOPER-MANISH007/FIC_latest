import api from "./axiosInstance";
import type { ApiResponse, AttemptPaper, ExamConfig } from "@/types";

export const fetchActiveExams = async () => {
  const res = await api.get<ApiResponse<ExamConfig[]>>("/exams");
  return res.data.data;
};

export const fetchExamById = async (id: string) => {
  const res = await api.get<ApiResponse<ExamConfig>>(`/exams/${id}`);
  return res.data.data;
};

export const startExamAttempt = async (examId: string) => {
  const res = await api.post<ApiResponse<AttemptPaper>>(`/exams/${examId}/start`);
  return res.data.data;
};


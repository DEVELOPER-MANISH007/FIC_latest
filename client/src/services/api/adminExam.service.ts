import api from "./axiosInstance";
import type { ApiResponse, ExamConfig, QuestionBankItem } from "@/types";

export const fetchAllExams = async () => {
  const res = await api.get<ApiResponse<ExamConfig[]>>("/admin/exams");
  return res.data.data;
};

export const fetchAdminExamById = async (id: string) => {
  const res = await api.get<ApiResponse<ExamConfig>>(`/admin/exams/${id}`);
  return res.data.data;
};

export const createExam = async (payload: Partial<ExamConfig>) => {
  const res = await api.post<ApiResponse<ExamConfig>>("/admin/exams", payload);
  return res.data.data;
};

export const updateExam = async (id: string, payload: Partial<ExamConfig>) => {
  const res = await api.put<ApiResponse<ExamConfig>>(`/admin/exams/${id}`, payload);
  return res.data.data;
};

export const deleteExam = async (id: string) => {
  await api.delete(`/admin/exams/${id}`);
};

// ==========================================================
// Test Builder — questions scoped to one test only
// ==========================================================

export type ExamQuestionPayload = Partial<
  Pick<
    QuestionBankItem,
    | "question"
    | "optionA"
    | "optionB"
    | "optionC"
    | "optionD"
    | "correctAnswer"
    | "difficulty"
    | "marks"
    | "explanation"
    | "topic"
  >
>;

export const addExamQuestion = async (examId: string, payload: ExamQuestionPayload) => {
  const res = await api.post<ApiResponse<QuestionBankItem>>(`/admin/exams/${examId}/questions`, payload);
  return res.data.data;
};

export const updateExamQuestion = async (examId: string, questionId: string, payload: ExamQuestionPayload) => {
  const res = await api.put<ApiResponse<QuestionBankItem>>(`/admin/exams/${examId}/questions/${questionId}`, payload);
  return res.data.data;
};

export const deleteExamQuestion = async (examId: string, questionId: string) => {
  await api.delete(`/admin/exams/${examId}/questions/${questionId}`);
};

export const duplicateExamQuestion = async (examId: string, questionId: string) => {
  const res = await api.post<ApiResponse<QuestionBankItem>>(
    `/admin/exams/${examId}/questions/${questionId}/duplicate`
  );
  return res.data.data;
};

export interface ExamImportSummary {
  importedCount: number;
  failedCount: number;
  failed: Array<{ row: number; reason: string }>;
  exam: ExamConfig;
}

export const importExamQuestions = async (examId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<ApiResponse<ExamImportSummary>>(`/admin/exams/${examId}/questions/import`, formData);
  return res.data.data;
};

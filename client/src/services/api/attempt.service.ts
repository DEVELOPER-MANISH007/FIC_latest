import api from "./axiosInstance";
import type { ApiResponse, AttemptPaper, StudentResultSummary } from "@/types";

export const fetchAttempt = async (attemptId: string) => {
  const res = await api.get<
    ApiResponse<AttemptPaper | { autoSubmitted: true; resultId: string } | { submitted: true; resultId: string }>
  >(`/attempts/${attemptId}`);
  return res.data.data;
};

export const saveAnswer = async (
  attemptId: string,
  payload: { questionIndex: number; selectedAnswer?: string | null; isMarkedForReview?: boolean }
) => {
  const res = await api.patch<ApiResponse<{ saved: boolean }>>(`/attempts/${attemptId}/answer`, payload);
  return res.data.data;
};

export const submitAttempt = async (attemptId: string) => {
  const res = await api.post<ApiResponse<{ resultId: string }>>(`/attempts/${attemptId}/submit`);
  return res.data.data;
};

export const fetchResult = async (resultId: string) => {
  const res = await api.get<ApiResponse<StudentResultSummary>>(`/attempts/results/${resultId}`);
  return res.data.data;
};

export const fetchMyResults = async () => {
  const res = await api.get<ApiResponse<StudentResultSummary[]>>("/attempts/results/mine");
  return res.data.data;
};

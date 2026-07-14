import api from "./axiosInstance";
import type { ApiResponse, AttemptPaper, ExamResult, ViolationType } from "@/types";

export const fetchAttempt = async (attemptId: string) => {
  const res = await api.get<ApiResponse<AttemptPaper | { autoSubmitted: true; resultId: string }>>(
    `/attempts/${attemptId}`
  );
  return res.data.data;
};

export const saveAnswer = async (
  attemptId: string,
  payload: { questionIndex: number; selectedAnswer?: string | null; isMarkedForReview?: boolean }
) => {
  const res = await api.patch<ApiResponse<{ saved: boolean }>>(`/attempts/${attemptId}/answer`, payload);
  return res.data.data;
};

/** Suspicious Activity Log — reports one anti-cheating violation. The
 * server is the sole authority on whether this crosses the configured
 * maxViolations threshold and triggers an auto-submit. */
export const reportViolation = async (attemptId: string, type: ViolationType, meta?: string) => {
  const res = await api.post<ApiResponse<{ violationCount: number; autoSubmitted: boolean; resultId?: string }>>(
    `/attempts/${attemptId}/violation`,
    { type, meta }
  );
  return res.data.data;
};

export const submitAttempt = async (attemptId: string) => {
  const res = await api.post<ApiResponse<{ resultId: string }>>(`/attempts/${attemptId}/submit`);
  return res.data.data;
};

/** Score/percentage/pass-fail/time only — the answer key is never sent to students. */
export const fetchResult = async (resultId: string) => {
  const res = await api.get<ApiResponse<{ result: ExamResult }>>(`/attempts/results/${resultId}`);
  return res.data.data;
};

export const fetchMyResults = async () => {
  const res = await api.get<ApiResponse<ExamResult[]>>("/attempts/results/mine");
  return res.data.data;
};

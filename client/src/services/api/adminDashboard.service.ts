import api from "./axiosInstance";
import type { AdminDashboardStats, ApiResponse } from "@/types";

export const fetchAdminDashboard = async () => {
  const res = await api.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard");
  return res.data.data;
};

export const fetchAdminAnalytics = async () => {
  const res = await api.get<ApiResponse<{
    passVsFail: { pass: number; fail: number };
    topStudents: { name: string; percentage: number; obtainedMarks: number; totalMarks: number }[];
    recentAttempts: any[];
    mostDifficultQuestions: { question: string; attempts: number; correct: number; correctRate: number }[];
    scoreDistribution: { percentage: number; date: string }[];
  }>>("/admin/dashboard/analytics");
  return res.data.data;
};


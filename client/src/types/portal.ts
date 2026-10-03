// --- Auth ---
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  course?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
}

export interface StudentSignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  course?: string;
}

export interface StudentLoginData {
  email: string;
  password: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

// --- Question Bank ---
export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface QuestionBankItem {
  _id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  category: Category | string;
  topic?: string;
  difficulty: Difficulty;
  marks: number;
  explanation?: string;
  language: string;
  status: "Active" | "Inactive";
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// --- Test config ---
export interface CategoryDistributionEntry {
  category: string;
  count: number;
}

export interface TestConfig {
  _id: string;
  testName: string;
  duration: number;
  totalQuestions: number;
  topic?: string;
  difficulty: Difficulty | "Mixed";
  passingMarks: number;
  categoryDistribution?: CategoryDistributionEntry[];
  isActive: boolean;
  allowRetest: boolean;
  showExplanationAfterSubmit: boolean;
  createdAt: string;
}

// --- Exam engine ---
export type AnswerStatus = "not-visited" | "not-answered" | "answered" | "marked-for-review" | "answered-marked";

export interface ExamQuestion {
  questionId: string;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
  marks: number;
}

export interface ExamAnswer {
  questionId: string;
  selected: "A" | "B" | "C" | "D" | null;
  status: AnswerStatus;
}

export interface ExamState {
  id: string;
  test: string;
  status: "in-progress" | "completed" | "auto-submitted";
  duration: number;
  startTime: string;
  endTime: string;
  remainingSeconds: number;
  questions: ExamQuestion[];
  answers: ExamAnswer[];
}

// --- Results ---
export interface ResultData {
  _id: string;
  student: { _id: string; name: string; email: string } | string;
  exam: string;
  test: { _id: string; testName: string; passingMarks: number } | string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  result: "Pass" | "Fail";
  timeTakenSeconds: number;
  createdAt: string;
}

// --- Admin dashboard ---
export interface DashboardStats {
  totalStudents: number;
  totalQuestions: number;
  totalTests: number;
  todaysAttempts: number;
  averageScore: number;
  recentRegistrations: Array<{ _id: string; name: string; email: string; course?: string; createdAt: string }>;
}

export interface AnalyticsData {
  scoreTrend: Array<{ _id: string; avgScore: number; count: number }>;
  passFailSplit: Array<{ _id: "Pass" | "Fail"; count: number }>;
  topStudents: Array<{ _id: string; name: string; email: string; best: number; attempts: number }>;
  recentAttempts: ResultData[];
  difficultQuestions: Array<{ _id: string; question: string; wrongCount: number }>;
}

export interface ImportSummary {
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  failed: Array<{ row: number; reason: string }>;
}


export interface Course {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  duration?: string;
  category?: "general" | "programming" | "office" | "industry";
  featured?: boolean;
  badge?: string;
  order?: number;
}

export interface FacultyMember {
  _id?: string;
  name: string;
  designation: string;
  qualification: string;
  bio?: string;
  image: string;
  order?: number;
}

export interface GalleryItem {
  _id?: string;
  title: string;
  category:
    | "Computer Lab"
    | "Smart Classroom"
    | "Practical Sessions"
    | "Institute Building"
    | "Students Learning"
    | "Events";
  image: string;
  order?: number;
}

export interface InstituteDetails {
  name: string;
  alternateName: string;
  tagline: string;
  establishedYear: number;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: {
    phones: string[];
    email: string;
    mapUrl: string;
  };
  stats: {
    studentsTrained: number;
    professionalCourses: number;
    yearsOfExcellence: number;
    practicalLearningPercent: number;
  };
}

export interface AdmissionFormData {
  name: string;
  phone: string;
  email?: string;
  fatherName: string;
  address: string;
  course: string;
  qualification: string;
  message?: string;
}

export type AdmissionStatus = "new" | "contacted" | "admitted" | "closed";
export type EnquiryStatus = "new" | "read" | "resolved";

export interface AdmissionRecord {
  _id: string;
  name: string;
  fatherName: string;
  phone: string;
  email?: string;
  address: string;
  course: string;
  qualification: string;
  message?: string;
  status: AdmissionStatus;
  createdAt: string;
}

export interface EnquiryRecord {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export interface RoadmapStep {
  step: number;
  title: string;
  description?: string;
}

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

// ==========================================================
// Student Portal + Exam Engine + Admin Panel types
// ==========================================================

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  course?: string;
  photo?: string;
  studentIdCode?: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
}

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  course?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface QuestionBankItem {
  _id: string;
  exam?: string | null;
  category?: Category | string | null;
  topic: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  language: string;
  explanation?: string;
  status: "Active" | "Inactive";
  usageCount: number;
  createdAt: string;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
}

export interface ExamConfig {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  questions?: Array<QuestionBankItem | string>;
  durationMinutes: number;
  totalQuestions: number;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  passingPercentage: number;
  categoryDistribution: CategoryDistributionItem[];
  allowRetest: boolean;
  showExplanationAfterSubmit: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PaperOption {
  letter: "A" | "B" | "C" | "D";
  text: string;
}

export interface PaperQuestion {
  index: number;
  questionId: string;
  text: string;
  options: PaperOption[];
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  isMarkedForReview: boolean;
  marks: number;
}

export interface AttemptPaper {
  attemptId: string;
  exam: string | ExamConfig;
  startedAt: string;
  expiresAt: string;
  status: "in-progress" | "submitted" | "expired";
  questions: PaperQuestion[];
}

export interface ExamResult {
  _id: string;
  /** Populated student — null when the account was later deleted. */
  student: string | { _id: string; name: string; email?: string; phone?: string } | null;
  /** Populated exam — null when the test was later deleted by an admin. */
  exam: ExamConfig | string | null;
  attempt: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
  timeTakenSeconds: number;
  createdAt: string;
}

export interface ResultReviewItem {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  explanation: string;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalQuestions: number;
  totalTests: number;
  todaysAttempts: number;
  averageScore: number;
  recentRegistrations: StudentUser[];
  totalAdmissions: number;
  totalEnquiries: number;
  todaysAdmissions: number;
  todaysEnquiries: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

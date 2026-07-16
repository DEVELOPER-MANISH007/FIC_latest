import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import MobileStickyCta from "@/components/layout/MobileStickyCta";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminProtectedRoute from "@/components/common/AdminProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { ToastProvider } from "@/context/ToastContext";

import Home from "@/pages/Home";
import Library from "@/pages/Library";
import NotFound from "@/pages/NotFound";

import StudentLogin from "@/pages/student/StudentLogin";
import ForgotPassword from "@/pages/student/ForgotPassword";
import ResetPassword from "@/pages/student/ResetPassword";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentProfile from "@/pages/student/StudentProfile";
import StudentTests from "@/pages/student/StudentTests";
import StudentAttempted from "@/pages/student/StudentAttempted";
import StudentResults from "@/pages/student/StudentResults";
import StudentPerformance from "@/pages/student/StudentPerformance";
import StudentChangePassword from "@/pages/student/StudentChangePassword";
import StudentStudyMaterial from "@/pages/student/StudentStudyMaterial";
import MyNotes from "@/pages/student/MyNotes";
import ExamPage from "@/pages/student/ExamPage";
import ResultPage from "@/pages/student/ResultPage";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminAdmissions from "@/pages/admin/AdminAdmissions";
import AdminEnquiries from "@/pages/admin/AdminEnquiries";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminExams from "@/pages/admin/AdminExams";
import AdminTestBuilder from "@/pages/admin/AdminTestBuilder";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminStudentProfile from "@/pages/admin/AdminStudentProfile";
import AdminResults from "@/pages/admin/AdminResults";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminAttemptLogs from "@/pages/admin/AdminAttemptLogs";
import AdminStudyMaterials from "@/pages/admin/AdminStudyMaterials";
import AdminStudyCourses from "@/pages/admin/AdminStudyCourses";

/** Wraps a public marketing-site page with the original Navbar/Footer/floating UI. */
const PublicSiteLayout = ({ children }: { children: ReactNode }) => (
  <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only fixed top-2 left-2 z-[100] bg-white px-4 py-2 rounded-lg font-semibold"
    >
      Skip to content
    </a>
    <Navbar />
    <main id="main">{children}</main>
    <Footer />
    <FloatingButtons />
    <MobileStickyCta />
  </>
);

const App = () => (
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Public marketing site — unchanged design */}
            <Route path="/" element={<PublicSiteLayout><Home /></PublicSiteLayout>} />

            {/* Public Digital Library — Public-visibility notes, no login required */}
            <Route path="/library" element={<PublicSiteLayout><Library /></PublicSiteLayout>} />

            {/* Student Portal auth (public) */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Student Portal (protected) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/dashboard/profile" element={<StudentProfile />} />
              <Route path="/dashboard/tests" element={<StudentTests />} />
              <Route path="/dashboard/attempted" element={<StudentAttempted />} />
              <Route path="/dashboard/results" element={<StudentResults />} />
              <Route path="/dashboard/performance" element={<StudentPerformance />} />
              <Route path="/dashboard/change-password" element={<StudentChangePassword />} />
              <Route path="/dashboard/study-material" element={<StudentStudyMaterial />} />
              <Route path="/dashboard/my-notes" element={<MyNotes />} />
              <Route path="/exam/:attemptId" element={<ExamPage />} />
              <Route path="/result/:resultId" element={<ResultPage />} />
            </Route>

            {/* Admin auth (public) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Panel (protected, role-based) */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/admissions" element={<AdminAdmissions />} />
              <Route path="/admin/enquiries" element={<AdminEnquiries />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/exams" element={<AdminExams />} />
              <Route path="/admin/exams/new" element={<AdminTestBuilder />} />
              <Route path="/admin/exams/:examId/builder" element={<AdminTestBuilder />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/students/:id" element={<AdminStudentProfile />} />
              <Route path="/admin/results" element={<AdminResults />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/attempt-logs" element={<AdminAttemptLogs />} />
              <Route path="/admin/study-materials" element={<AdminStudyMaterials />} />
              <Route path="/admin/study-courses" element={<AdminStudyCourses />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
);

export default App;

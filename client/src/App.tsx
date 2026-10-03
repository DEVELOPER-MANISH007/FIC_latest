import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";
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
import { WebsiteProvider } from "@/context/WebsiteContext";

import Home from "@/pages/Home";
import Library from "@/pages/Library";
import NotFound from "@/pages/NotFound";

const StudentLogin = lazy(() => import("@/pages/student/StudentLogin"));
const ForgotPassword = lazy(() => import("@/pages/student/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/student/ResetPassword"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentProfile = lazy(() => import("@/pages/student/StudentProfile"));
const StudentTests = lazy(() => import("@/pages/student/StudentTests"));
const StudentAttempted = lazy(() => import("@/pages/student/StudentAttempted"));
const StudentResults = lazy(() => import("@/pages/student/StudentResults"));
const StudentPerformance = lazy(() => import("@/pages/student/StudentPerformance"));
const StudentChangePassword = lazy(() => import("@/pages/student/StudentChangePassword"));
const StudentStudyMaterial = lazy(() => import("@/pages/student/StudentStudyMaterial"));
const MyNotes = lazy(() => import("@/pages/student/MyNotes"));
const ExamPage = lazy(() => import("@/pages/student/ExamPage"));
const ResultPage = lazy(() => import("@/pages/student/ResultPage"));

const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminAdmissions = lazy(() => import("@/pages/admin/AdminAdmissions"));
const AdminEnquiries = lazy(() => import("@/pages/admin/AdminEnquiries"));
const AdminQuestions = lazy(() => import("@/pages/admin/AdminQuestions"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminExams = lazy(() => import("@/pages/admin/AdminExams"));
const AdminTestBuilder = lazy(() => import("@/pages/admin/AdminTestBuilder"));
const AdminStudents = lazy(() => import("@/pages/admin/AdminStudents"));
const AdminStudentProfile = lazy(() => import("@/pages/admin/AdminStudentProfile"));
const AdminResults = lazy(() => import("@/pages/admin/AdminResults"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminAttemptLogs = lazy(() => import("@/pages/admin/AdminAttemptLogs"));
const AdminStudyMaterials = lazy(() => import("@/pages/admin/AdminStudyMaterials"));
const AdminStudyCourses = lazy(() => import("@/pages/admin/AdminStudyCourses"));
const AdminWebsite = lazy(() => import("@/pages/admin/AdminWebsite"));
const AdminAccountSettings = lazy(() => import("@/pages/admin/AdminAccountSettings"));
const PublicNotices = lazy(() => import("@/pages/PublicNotices"));
import { Link } from "react-router-dom";
import { useWebsite } from "@/context/WebsiteContext";

/** Wraps a public marketing-site page with the original Navbar/Footer/floating UI. */
const PublicSiteLayout = ({ children }: { children: ReactNode }) => {
  const { settings, notices } = useWebsite();
  const announcement = settings.homepage?.announcement;
  const visibleNotice = notices.find((notice) => notice.pinned) || notices[0];
  const showAnnouncement = announcement?.enabled && settings.websiteSettings?.showHomepageAnnouncement !== false;
  return <>
    {showAnnouncement && <div className="fixed inset-x-0 top-0 z-[60] bg-[var(--navy)] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm"><Link to={announcement.href || visibleNotice?.link || "/notices"} className="underline-offset-2 hover:underline">{announcement.label || "Notice"}: {announcement.text || visibleNotice?.title || "View institute updates"} →</Link></div>}
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
  </>;
};

const App = () => (
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <WebsiteProvider>
          <BrowserRouter>
          <Suspense fallback={<div className="min-h-[40vh] grid place-items-center text-sm text-[var(--ink-soft)]" role="status">Loading page…</div>}><Routes>
            {/* Public marketing site — unchanged design */}
            <Route path="/" element={<PublicSiteLayout><Home /></PublicSiteLayout>} />

            {/* Public Digital Library — Public-visibility notes, no login required */}
            <Route path="/library" element={<PublicSiteLayout><Library /></PublicSiteLayout>} />
            <Route path="/notices" element={<PublicSiteLayout><PublicNotices /></PublicSiteLayout>} />

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
              <Route path="/admin/website" element={<AdminWebsite />} />
              <Route path="/admin/settings" element={<AdminAccountSettings />} />
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
          </Routes></Suspense>
        </BrowserRouter>
          </WebsiteProvider>
        </AdminAuthProvider>
    </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
);

export default App;

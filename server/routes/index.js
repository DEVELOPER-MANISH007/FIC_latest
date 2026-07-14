import { Router } from "express";
import admissionRoutes from "./admission.routes.js";
import contactRoutes from "./contact.routes.js";
import courseRoutes from "./course.routes.js";
import facultyRoutes from "./faculty.routes.js";
import galleryRoutes from "./gallery.routes.js";
import instituteRoutes from "./institute.routes.js";

// Student Portal + Exam Engine
import studentAuthRoutes from "./studentAuth.routes.js";
import categoryRoutes from "./category.routes.js";
import examRoutes from "./exam.routes.js";
import attemptRoutes from "./attempt.routes.js";

// Admin Panel
import adminAuthRoutes from "./adminAuth.routes.js";
import questionRoutes from "./question.routes.js";
import adminExamRoutes from "./adminExam.routes.js";
import adminStudentRoutes from "./adminStudent.routes.js";
import adminResultRoutes from "./adminResult.routes.js";
import adminAttemptRoutes from "./adminAttempt.routes.js";
import adminDashboardRoutes from "./adminDashboard.routes.js";
import adminAdmissionRoutes from "./adminAdmission.routes.js";
import adminEnquiryRoutes from "./adminEnquiry.routes.js";

// Study Material Management
import studyCourseRoutes from "./studyCourse.routes.js";
import adminStudyCourseRoutes from "./adminStudyCourse.routes.js";
import studyMaterialRoutes from "./studyMaterial.routes.js";
import adminStudyMaterialRoutes from "./adminStudyMaterial.routes.js";
import publicMaterialRoutes from "./publicMaterial.routes.js";

const router = Router();

router.use("/admissions", admissionRoutes);
router.use("/contact", contactRoutes);
router.use("/courses", courseRoutes);
router.use("/faculty", facultyRoutes);
router.use("/gallery", galleryRoutes);
router.use("/institute", instituteRoutes);

// Public category list (students see category names on exam screens)
router.use("/categories", categoryRoutes);

// Study Material — public Course/Subject catalogue (used by both panels)
router.use("/study-courses", studyCourseRoutes);

// Study Material — public Notes Library (Home page, no login required).
// Hard-scoped to visibility:"public" inside the controller.
router.use("/public/materials", publicMaterialRoutes);

// Student Portal
router.use("/student/auth", studentAuthRoutes);
router.use("/exams", examRoutes);
router.use("/attempts", attemptRoutes);
router.use("/materials", studyMaterialRoutes);

// Admin Panel
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/questions", questionRoutes);
router.use("/admin/exams", adminExamRoutes);
router.use("/admin/students", adminStudentRoutes);
router.use("/admin/results", adminResultRoutes);
router.use("/admin/attempts", adminAttemptRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/admissions", adminAdmissionRoutes);
router.use("/admin/enquiries", adminEnquiryRoutes);
router.use("/admin/study-courses", adminStudyCourseRoutes);
router.use("/admin/materials", adminStudyMaterialRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy", timestamp: new Date().toISOString() });
});

export default router;

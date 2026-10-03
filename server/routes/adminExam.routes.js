import { Router } from "express";
import {
  getAllExams,
  getAdminExamById,
  createExam,
  updateExam,
  assignExam,
  deleteExam,
  addExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  duplicateExamQuestion,
  importExamQuestions,
} from "../controllers/exam.controller.js";
import { protectAdmin } from "../middleware/auth.js";
import uploadExcel from "../middleware/uploadExcel.js";

const router = Router();
router.use(protectAdmin);

// Tests
router.get("/", getAllExams);
router.post("/", createExam);
router.get("/:id", getAdminExamById);
router.put("/:id", updateExam);
// Student-wise / Batch-wise Test Assignment — activates the test and
// saves who it's visible to in one step (see Test Assignment popup).
router.patch("/:id/assign", assignExam);
router.delete("/:id", deleteExam);

// Test Builder — questions scoped to one test only
router.post("/:examId/questions", addExamQuestion);
router.post("/:examId/questions/import", uploadExcel.single("file"), importExamQuestions);
router.put("/:examId/questions/:questionId", updateExamQuestion);
router.delete("/:examId/questions/:questionId", deleteExamQuestion);
router.post("/:examId/questions/:questionId/duplicate", duplicateExamQuestion);

export default router;


import { Router } from "express";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  bulkDeleteQuestions,
  importQuestions,
  exportQuestions,
  getQuestionAnalytics,
} from "../controllers/question.controller.js";
import { questionValidationRules } from "../validators/question.validator.js";
import validate from "../middleware/validate.js";
import { protectAdmin } from "../middleware/auth.js";
import uploadExcel from "../middleware/uploadExcel.js";

const router = Router();

// All question bank management routes are admin-only.
router.use(protectAdmin);

router.get("/analytics", getQuestionAnalytics);
router.get("/export", exportQuestions);
router.post("/import", uploadExcel.single("file"), importQuestions);
router.post("/bulk-delete", bulkDeleteQuestions);
router.post("/:id/duplicate", duplicateQuestion);

router.get("/", getQuestions);
router.post("/", questionValidationRules, validate, createQuestion);
router.get("/:id", getQuestionById);
router.put("/:id", questionValidationRules, validate, updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;


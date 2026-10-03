import { Router } from "express";
import { getActiveExams, getExamById } from "../controllers/exam.controller.js";
import { startAttempt } from "../controllers/attempt.controller.js";
import { protectStudent } from "../middleware/auth.js";

const router = Router();

router.use(protectStudent);

router.get("/", getActiveExams);
router.get("/:id", getExamById);
router.post("/:examId/start", startAttempt);

export default router;


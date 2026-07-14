import { Router } from "express";
import { getAttempt, saveAnswer, submitAttempt, logViolation, getResultById, getMyResults } from "../controllers/attempt.controller.js";
import { protectStudent } from "../middleware/auth.js";

const router = Router();

router.use(protectStudent);

router.get("/results/mine", getMyResults);
router.get("/results/:resultId", getResultById);
router.get("/:attemptId", getAttempt);
router.patch("/:attemptId/answer", saveAnswer);
router.post("/:attemptId/violation", logViolation);
router.post("/:attemptId/submit", submitAttempt);

export default router;

import { Router } from "express";
import { getAttempts, getAttemptById } from "../controllers/adminAttempt.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protectAdmin);

router.get("/", getAttempts);
router.get("/:id", getAttemptById);

export default router;

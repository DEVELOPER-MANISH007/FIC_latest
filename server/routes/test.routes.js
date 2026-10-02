import { Router } from "express";
import { getActiveTests, getAllTests, createTest, updateTest, deleteTest } from "../controllers/test.controller.js";
import { testRules, testUpdateRules } from "../validators/test.validator.js";
import validate from "../middleware/validate.js";
import { protectStudent, protectAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", protectStudent, getActiveTests);
router.get("/admin/all", protectAdmin, getAllTests);
router.post("/admin", protectAdmin, testRules, validate, createTest);
router.put("/admin/:id", protectAdmin, testUpdateRules, validate, updateTest);
router.delete("/admin/:id", protectAdmin, deleteTest);

export default router;

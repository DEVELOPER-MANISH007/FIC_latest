import { Router } from "express";
import { getMyResults, getResultById, getAllResults, exportResults } from "../controllers/result.controller.js";
import { protectStudent, protectAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/my", protectStudent, getMyResults);
router.get("/admin/all", protectAdmin, getAllResults);
router.get("/admin/export", protectAdmin, exportResults);

// Detail view is for the student reviewing their own result.
router.get("/:id", protectStudent, getResultById);

export default router;


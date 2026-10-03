import { Router } from "express";
import { getDashboardStats, getAnalytics } from "../controllers/adminDashboard.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protectAdmin);

router.get("/", getDashboardStats);
router.get("/analytics", getAnalytics);

export default router;


import { Router } from "express";
import { getResults, exportResults } from "../controllers/adminResult.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protectAdmin);

router.get("/export", exportResults);
router.get("/", getResults);

export default router;


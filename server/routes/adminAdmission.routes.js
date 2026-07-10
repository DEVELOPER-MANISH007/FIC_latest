import { Router } from "express";
import {
  getAdmissions,
  exportAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission,
} from "../controllers/adminAdmission.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protectAdmin);

// NOTE: /export must be registered before /:id so it isn't swallowed by the param route.
router.get("/export", exportAdmissions);
router.get("/", getAdmissions);
router.get("/:id", getAdmissionById);
router.put("/:id", updateAdmissionStatus);
router.delete("/:id", deleteAdmission);

export default router;

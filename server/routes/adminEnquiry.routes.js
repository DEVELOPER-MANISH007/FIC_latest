import { Router } from "express";
import {
  getEnquiries,
  exportEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/adminEnquiry.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protectAdmin);

// NOTE: /export must be registered before /:id so it isn't swallowed by the param route.
router.get("/export", exportEnquiries);
router.get("/", getEnquiries);
router.get("/:id", getEnquiryById);
router.put("/:id", updateEnquiryStatus);
router.delete("/:id", deleteEnquiry);

export default router;

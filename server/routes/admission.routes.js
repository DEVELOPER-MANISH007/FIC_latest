import { Router } from "express";
import { createAdmission, getAdmissions } from "../controllers/admission.controller.js";
import { admissionValidationRules } from "../validators/admission.validator.js";
import validate from "../middleware/validate.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", admissionValidationRules, validate, createAdmission);
router.get("/", protectAdmin, getAdmissions);

export default router;

import { Router } from "express";
import { createContact, getContacts } from "../controllers/contact.controller.js";
import { contactValidationRules } from "../validators/contact.validator.js";
import validate from "../middleware/validate.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", contactValidationRules, validate, createContact);
router.get("/", protectAdmin, getContacts);

export default router;

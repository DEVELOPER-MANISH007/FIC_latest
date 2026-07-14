import { Router } from "express";
import {
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/studentAuth.controller.js";
import uploadImage from "../middleware/uploadImage.js";
import {
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
} from "../validators/studentAuth.validator.js";
import validate from "../middleware/validate.js";
import { protectStudent } from "../middleware/auth.js";

const router = Router();

// Public self-registration removed (#9 — Student Authentication Update).
// Student accounts are created exclusively by Admin via
// POST /api/admin/students (see adminStudent.routes.js).
router.post("/login", loginValidationRules, validate, login);
router.get("/me", protectStudent, getMe);
router.put("/profile", protectStudent, updateProfile);
router.post("/profile-photo", protectStudent, uploadImage.single("photo"), uploadProfilePhoto);
router.post("/change-password", protectStudent, changePassword);
router.post("/forgot-password", forgotPasswordValidationRules, validate, forgotPassword);
router.post("/reset-password", resetPasswordValidationRules, validate, resetPassword);

export default router;

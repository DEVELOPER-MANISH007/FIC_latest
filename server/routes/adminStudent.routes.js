import { Router } from "express";
import {
  getStudents,
  getStudentProfile,
  createStudent,
  updateStudent,
  toggleStudentStatus,
  resetStudentPassword,
  deleteStudent,
} from "../controllers/adminStudent.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();
// Only Admin can create student accounts, reset passwords, delete
// students, or change student status (#9 — Security) — enforced here for
// every route in this file, not just the mutating ones.
router.use(protectAdmin);

router.get("/", getStudents);
router.post("/", createStudent);
router.get("/:id", getStudentProfile);
router.put("/:id", updateStudent);
router.patch("/:id/disable", toggleStudentStatus);
router.patch("/:id/reset-password", resetStudentPassword);
router.delete("/:id", deleteStudent);

export default router;

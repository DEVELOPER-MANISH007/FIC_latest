import { Router } from "express";
import {
  getAdminStudyCourses,
  createStudyCourse,
  updateStudyCourse,
  deleteStudyCourse,
  addSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/adminStudyCourse.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = Router();

// Dynamic Course & Subject management is admin-only.
router.use(protectAdmin);

router.get("/", getAdminStudyCourses);
router.post("/", createStudyCourse);
router.put("/:id", updateStudyCourse);
router.delete("/:id", deleteStudyCourse);

router.post("/:id/subjects", addSubject);
router.put("/:id/subjects/:subjectId", updateSubject);
router.delete("/:id/subjects/:subjectId", deleteSubject);

export default router;

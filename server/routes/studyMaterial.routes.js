import { Router } from "express";
import { getMaterials, getMaterialSubjects, getMaterialById, registerDownload } from "../controllers/studyMaterial.controller.js";
import { protectStudent } from "../middleware/auth.js";

const router = Router();

// Study Material Management — student panel is login-only, like every
// other /dashboard feature in the Student Portal.
router.use(protectStudent);

router.get("/", getMaterials);
router.get("/subjects", getMaterialSubjects);
router.get("/:id", getMaterialById);
router.post("/:id/download", registerDownload);

export default router;

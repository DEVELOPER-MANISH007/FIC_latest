import { Router } from "express";
import {
  getAdminMaterials,
  getAdminMaterialSubjects,
  getAdminMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/adminStudyMaterial.controller.js";
import { protectAdmin } from "../middleware/auth.js";
import uploadMaterial from "../middleware/uploadMaterial.js";

const router = Router();

router.use(protectAdmin);

router.get("/", getAdminMaterials);
router.get("/subjects", getAdminMaterialSubjects);
router.post("/", uploadMaterial.single("file"), createMaterial);
router.get("/:id", getAdminMaterialById);
router.put("/:id", uploadMaterial.single("file"), updateMaterial);
router.delete("/:id", deleteMaterial);

export default router;

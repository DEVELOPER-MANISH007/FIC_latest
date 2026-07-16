import { Router } from "express";
import {
  getAdminMaterials,
  getAdminMaterialSubjects,
  getAdminMaterialById,
  getMaterialUploadSignature,
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
// Issues a Cloudinary signature for the browser-direct-upload path (large
// files bypass Vercel's function body-size limit entirely — see
// utils/materialUpload.js#buildMaterialUploadSignature).
router.post("/upload-signature", getMaterialUploadSignature);
// uploadMaterial.single("file") is a no-op for non-multipart requests (Multer
// skips straight to next() when Content-Type isn't multipart), so this same
// route transparently supports both the legacy multipart upload (small files,
// local dev) and the new JSON direct-upload metadata payload.
router.post("/", uploadMaterial.single("file"), createMaterial);
router.get("/:id", getAdminMaterialById);
router.put("/:id", uploadMaterial.single("file"), updateMaterial);
router.delete("/:id", deleteMaterial);

export default router;

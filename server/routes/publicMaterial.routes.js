import { Router } from "express";
import {
  getPublicMaterials,
  getPublicMaterialSubjects,
  getPublicMaterialById,
  registerPublicDownload,
} from "../controllers/publicMaterial.controller.js";

const router = Router();

// Home page "Notes Library" — intentionally unauthenticated. Every handler
// hard-scopes to visibility:"public" so Enrolled-Only material can never
// leak here, however this router is composed or mounted.
router.get("/", getPublicMaterials);
router.get("/subjects", getPublicMaterialSubjects);
router.get("/:id", getPublicMaterialById);
router.post("/:id/download", registerPublicDownload);

export default router;

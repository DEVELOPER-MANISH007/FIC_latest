import { Router } from "express";
import { protectAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  createWebsiteResource,
  deleteWebsiteMediaRecord,
  deleteWebsiteResource,
  getAdminWebsiteSettings,
  listWebsiteMedia,
  listWebsiteResources,
  updateWebsiteResource,
  updateWebsiteSettings,
  uploadWebsiteMedia,
} from "../controllers/adminWebsite.controller.js";

const router = Router();

router.use(protectAdmin);

router.get("/settings", getAdminWebsiteSettings);
router.put("/settings", updateWebsiteSettings);
router.post("/upload", upload.single("image"), uploadWebsiteMedia);
router.get("/media", listWebsiteMedia);
router.delete("/media/:id", deleteWebsiteMediaRecord);
router.get("/:resource", listWebsiteResources);
router.post("/:resource", createWebsiteResource);
router.put("/:resource/:id", updateWebsiteResource);
router.delete("/:resource/:id", deleteWebsiteResource);

export default router;

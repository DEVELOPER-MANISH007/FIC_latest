import { Router } from "express";
import { getPublicNotices, getPublicWebsite } from "../controllers/website.controller.js";

const router = Router();

router.get("/", getPublicWebsite);
router.get("/home", getPublicWebsite);
router.get("/notices", getPublicNotices);

export default router;

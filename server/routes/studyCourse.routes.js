import { Router } from "express";
import { getStudyCourses } from "../controllers/studyCourse.controller.js";

const router = Router();

router.get("/", getStudyCourses);

export default router;

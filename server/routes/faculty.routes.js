import { Router } from "express";
import { getFaculty } from "../controllers/faculty.controller.js";

const router = Router();

router.get("/", getFaculty);

export default router;


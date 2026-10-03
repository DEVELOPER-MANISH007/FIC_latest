import { Router } from "express";
import { getInstituteDetails } from "../controllers/institute.controller.js";

const router = Router();

router.get("/", getInstituteDetails);

export default router;


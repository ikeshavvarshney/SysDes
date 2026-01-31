import express from "express";
import { getTemplates } from "../controllers/templateController.js";
const router = express.Router();

router.get("/", getTemplates);

export default router;

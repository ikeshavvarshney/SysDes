import express from "express";
import { 
  getTemplates, 
  trackTemplateUsage, 
  getPopularTemplates 
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/", getTemplates);
router.post("/:templateId/track", trackTemplateUsage);
router.get("/popular", getPopularTemplates);

export default router;

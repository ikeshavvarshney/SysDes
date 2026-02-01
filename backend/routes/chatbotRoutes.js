import express from "express";
import {
  getChatbotSuggestion,
  getOptimizationTips,
} from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/suggest", getChatbotSuggestion);
router.get("/optimize/:designId", getOptimizationTips);

export default router;

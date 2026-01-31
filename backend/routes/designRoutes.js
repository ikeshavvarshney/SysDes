import express from "express";
import {
  createDesign,
  getUserDesigns,
  getDesignById,
  updateDesign,
  deleteDesign
} from "../controllers/designController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware); // all routes protected

router.post("/", createDesign);
router.get("/", getUserDesigns);
router.get("/:id", getDesignById);
router.put("/:id", updateDesign);
router.delete("/:id", deleteDesign);

export default router;

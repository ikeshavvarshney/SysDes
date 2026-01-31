import express from "express";
import {
  createDesign,
  getDesigns,
  getDesignById,
  updateDesign,
  deleteDesign,
  simulateDesignTraffic,
  addComponentToDesign,
  updateComponentInDesign
} from "../controllers/designController.js";

const router = express.Router();

// CRUD routes
router.post("/", createDesign);
router.get("/", getDesigns);
router.get("/:id", getDesignById);
router.put("/:id", updateDesign);
router.delete("/:id", deleteDesign);

// Traffic simulation
router.post("/:id/simulateTraffic", simulateDesignTraffic);

// Components
router.post("/:id/components", addComponentToDesign);
router.put("/components/:componentId", updateComponentInDesign);

export default router;


import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createDesign,
  getDesigns,
  getDesignById,
  updateDesign,
  deleteDesign,
  simulateDesignTraffic,
  addComponentToDesign,
  updateComponentInDesign,
  // NEW
  saveSimulationSnapshot,
  getSimulationHistory,
  replaySnapshot,
  getAutoScaleRecommendations,
  applyRecommendation
} from '../controllers/designController.js';

const router = express.Router();

// ==========================================
// DESIGN CRUD
// ==========================================

router.post('/create', authMiddleware, createDesign);
router.get('/', authMiddleware, getDesigns);
router.get('/:id', authMiddleware, getDesignById);
router.put('/:id', authMiddleware, updateDesign);
router.delete('/:id', authMiddleware, deleteDesign);

// ==========================================
// COMPONENT MANAGEMENT
// ==========================================

router.post('/:id/components/add', authMiddleware, addComponentToDesign);
router.put('/components/:componentId', authMiddleware, updateComponentInDesign);

// ==========================================
// SIMULATION
// ==========================================

router.post('/:id/simulate', authMiddleware, simulateDesignTraffic);

// ==========================================
// NEW: SNAPSHOT & HISTORY
// ==========================================

router.post('/:designId/snapshots', authMiddleware, saveSimulationSnapshot);
router.get('/:designId/history', authMiddleware, getSimulationHistory);
router.get('/:designId/snapshots/:snapshotIndex', authMiddleware, replaySnapshot);

// ==========================================
// NEW: AUTO-SCALE
// ==========================================

router.get('/:designId/recommendations', authMiddleware, getAutoScaleRecommendations);
router.post('/:designId/recommendations/apply', authMiddleware, applyRecommendation);

export default router;
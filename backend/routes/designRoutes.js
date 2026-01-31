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
  updateComponentInDesign
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

export default router;
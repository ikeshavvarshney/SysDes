import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getExecutionHistory
} from '../controllers/workflowController.js';

const router = express.Router();

router.post('/create', authMiddleware, createWorkflow);
router.get('/', authMiddleware, getWorkflows);
router.get('/:workflowId', authMiddleware, getWorkflowById);
router.put('/:workflowId', authMiddleware, updateWorkflow);
router.delete('/:workflowId', authMiddleware, deleteWorkflow);

// Execution
router.post('/:workflowId/execute', authMiddleware, executeWorkflow);
router.get('/:workflowId/history', authMiddleware, getExecutionHistory);

export default router;
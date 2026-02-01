import express from "express";
import { 
  updateSecurity, 
  getSecurity,
  // NEW: Simulation endpoints
  toggleSimulation,
  updateSimulationState,
  logAttack,
  calculateSecurityImpact
} from "../controllers/securityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

// ==========================================
// PAGE 2: Security Configuration
// ==========================================

router.post("/", updateSecurity);
router.get("/:designId", getSecurity);

// ==========================================
// NEW: Cyber Security Simulator
// ==========================================

router.post("/:designId/simulation/toggle", toggleSimulation);
router.put("/:designId/simulation/state", updateSimulationState);
router.post("/:designId/attacks/log", logAttack);
router.get("/:designId/impact", calculateSecurityImpact);

export default router;

import express from "express";
import { updateSecurity, getSecurity } from "../controllers/securityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", updateSecurity);
router.get("/:designId", getSecurity);

export default router;

import express from "express";
import { addComponent, getComponent, updateComponent, deleteComponent } from "../controllers/componentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addComponent);
router.get("/:id", getComponent);
router.put("/:id", updateComponent);
router.delete("/:id", deleteComponent);

export default router;

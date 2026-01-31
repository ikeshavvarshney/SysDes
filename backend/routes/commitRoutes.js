import express from "express";
import { pushCommit, getCommits } from "../controllers/commitController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", pushCommit);
router.get("/:designId", getCommits);

export default router;

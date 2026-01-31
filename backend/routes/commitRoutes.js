import express from "express";
import { pushCommit, getCommits, undoCommit } from "../controllers/commitController.js";

const router = express.Router();

router.post("/", pushCommit);
router.get("/:designId", getCommits);
router.post("/:designId/undo", undoCommit); // NEW

export default router;

import Commit from "../models/commit.js";
import Design from "../models/design.js";
import { calculateDesignCost } from "../services/costService.js";

// Push a commit
export const pushCommit = async (req, res) => {
  try {
    const { designId, message, snapshot } = req.body;
    const commit = new Commit({ designId, authorId: req.userId, message, snapshot });
    await commit.save();
    res.status(201).json(commit);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Get commits for a design
export const getCommits = async (req, res) => {
  try {
    const commits = await Commit.find({ designId: req.params.designId })
      .populate("authorId", "name")
      .sort({ createdAt: -1 }); // latest first
    res.status(200).json(commits);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// ------------------------
// UNDO / Rollback
// ------------------------
export const undoCommit = async (req, res) => {
  try {
    const designId = req.params.designId;

    // Get commits in descending order
    const commits = await Commit.find({ designId }).sort({ createdAt: -1 });

    if (commits.length < 2) {
      return res.status(400).json({ message: "No previous commit to rollback to" });
    }

    // Latest commit = current, previous commit = rollback target
    const previousCommit = commits[1]; // 0 = latest, 1 = previous

    // Update design with previous snapshot
    const design = await Design.findByIdAndUpdate(
      designId,
      { 
        components: previousCommit.snapshot.components,
        connections: previousCommit.snapshot.connections,
        trafficConfig: previousCommit.snapshot.trafficConfig,
        currentStatus: previousCommit.snapshot.currentStatus || "stable"
      },
      { new: true }
    );

    // Calculate updated cost
    const totalCost = await calculateDesignCost(designId);

    // Optionally push a new commit for rollback
    const rollbackCommit = new Commit({
      designId,
      authorId: req.userId,
      message: `Rollback to commit: ${previousCommit._id}`,
      snapshot: previousCommit.snapshot
    });
    await rollbackCommit.save();

    res.status(200).json({ design, totalCost, rollbackCommit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Undo failed", err });
  }
};

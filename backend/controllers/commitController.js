import Commit from "../models/commit.js";
import Design from "../models/design.js";

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
    const commits = await Commit.find({ designId: req.params.designId }).populate("authorId", "name");
    res.status(200).json(commits);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

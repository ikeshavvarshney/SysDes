import Design from "../models/design.js";
import Component from "../models/component.js";

// Create a new design
export const createDesign = async (req, res) => {
  try {
    const { name } = req.body;
    const design = new Design({
      ownerId: req.userId,
      name,
      collaborators: [],
      components: [],
      connections: [],
    });
    await design.save();
    res.status(201).json(design);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Get all designs for user
export const getUserDesigns = async (req, res) => {
  try {
    const designs = await Design.find({ ownerId: req.userId }).populate("components collaborators");
    res.status(200).json(designs);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Get a single design
export const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).populate("components collaborators");
    if (!design) return res.status(404).json({ message: "Design not found" });
    res.status(200).json(design);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Update design (add/remove components or connections)
export const updateDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    Object.assign(design, req.body); // merge request body fields
    await design.save();

    res.status(200).json(design);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Delete design
export const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });
    res.status(200).json({ message: "Design deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

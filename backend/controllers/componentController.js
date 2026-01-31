import Component from "../models/component.js";
import Design from "../models/design.js";

// Add component to a design
export const addComponent = async (req, res) => {
  try {
    const { designId, type, model } = req.body;
    const design = await Design.findById(designId);
    if (!design) return res.status(404).json({ message: "Design not found" });

    const component = new Component({ type, model });
    await component.save();

    design.components.push(component._id);
    await design.save();

    res.status(201).json(component);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Get component details
export const getComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ message: "Component not found" });
    res.status(200).json(component);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Update component metrics
export const updateComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ message: "Component not found" });

    Object.assign(component, req.body);
    await component.save();

    res.status(200).json(component);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Delete component
export const deleteComponent = async (req, res) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);
    if (!component) return res.status(404).json({ message: "Component not found" });

    // Optional: remove from design.components array
    await Design.updateMany(
      { components: component._id },
      { $pull: { components: component._id } }
    );

    res.status(200).json({ message: "Component deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

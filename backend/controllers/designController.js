import Design from "../models/design.js";
import Component from "../models/component.js";
import { calculateDesignCost } from "../services/costService.js";
import { simulateTraffic } from "../services/trafficService.js";

// ------------------------
// CRUD Operations for Designs
// ------------------------

export const createDesign = async (req, res) => {
  try {
    const { name, ownerId, collaborators = [], components = [], connections = [] } = req.body;

    const newDesign = await Design.create({
      name,
      ownerId,
      collaborators,
      components,
      connections,
      currentStatus: "stable"
    });

    const totalCost = await calculateDesignCost(newDesign._id);

    res.status(201).json({ design: newDesign, totalCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Design creation failed", error: error.message });
  }
};

export const getDesigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const designs = await Design.find({ ownerId: userId }).populate("components");
    res.status(200).json(designs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch designs", error: error.message });
  }
};

export const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate("components")
      .populate("collaborators");

    if (!design) return res.status(404).json({ message: "Design not found" });

    const totalCost = await calculateDesignCost(design._id);

    res.status(200).json({ design, totalCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch design", error: error.message });
  }
};

export const updateDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    const { name, collaborators, components, connections } = req.body;

    if (name) design.name = name;
    if (collaborators) design.collaborators = collaborators;
    if (components) design.components = components;
    if (connections) design.connections = connections;

    await design.save();

    const totalCost = await calculateDesignCost(design._id);

    res.status(200).json({ design, totalCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update design", error: error.message });
  }
};

export const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    res.status(200).json({ message: "Design deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete design", error: error.message });
  }
};

// ------------------------
// Traffic Simulation
// ------------------------
export const simulateDesignTraffic = async (req, res) => {
  try {
    const { trafficIncrease } = req.body;
    const designId = req.params.id;

    const result = await simulateTraffic(designId, trafficIncrease);

    const totalCost = await calculateDesignCost(designId);

    res.status(200).json({
      ...result,
      totalCost
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Traffic simulation failed", error: error.message });
  }
};

// ------------------------
// Add / Update Component in Design
// ------------------------

// Add a new component to design
export const addComponentToDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    const { componentId } = req.body;

    if (!componentId) return res.status(400).json({ message: "Component ID is required" });

    design.components.push(componentId);
    await design.save();

    const totalCost = await calculateDesignCost(design._id);

    res.status(200).json({ design, totalCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add component", error: error.message });
  }
};

// Update component metrics/details in design
export const updateComponentInDesign = async (req, res) => {
  try {
    const { componentId } = req.params;
    const updates = req.body; // frontend sends updated metrics, health, or other fields

    const component = await Component.findByIdAndUpdate(componentId, updates, { new: true });
    if (!component) return res.status(404).json({ message: "Component not found" });

    // Recalculate total cost for the parent design(s)
    const designs = await Design.find({ components: componentId });
    let results = [];
    for (let design of designs) {
      const totalCost = await calculateDesignCost(design._id);
      results.push({ designId: design._id, totalCost });
    }

    res.status(200).json({ component, designCosts: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update component", error: error.message });
  }
};

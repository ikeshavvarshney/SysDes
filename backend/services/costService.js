import Design from "../models/design.js";
import Component from "../models/component.js";

// Calculate total cost of a design
export const calculateDesignCost = async (designId) => {
  const design = await Design.findById(designId).populate('components');

  if (!design) throw new Error("Design not found");

  let totalCost = 0;
  design.components.forEach(comp => {
    totalCost += comp.costPerHour || 0;
  });

  return totalCost;
};

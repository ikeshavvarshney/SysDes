import Design from "../models/design.js";
import Component from "../models/component.js";

// Simulate traffic on a design
export const simulateTraffic = async (designId, trafficIncrease) => {
  const design = await Design.findById(designId).populate('components');

  if (!design) throw new Error("Design not found");

  const suggestions = [];
  let designCollapsed = false;

  // Update metrics for each component
  for (let comp of design.components) {
    // Simulate increase proportionally (simplified)
    comp.metrics.cpu += trafficIncrease * 0.5;
    comp.metrics.memory += trafficIncrease * 0.3;
    comp.metrics.requests += trafficIncrease;

    // Check collapse
    if (comp.metrics.cpu > comp.capacity.cpu ||
        comp.metrics.memory > comp.capacity.memory ||
        comp.metrics.requests > comp.capacity.requests) {
      designCollapsed = true;
      comp.health = Math.max(comp.health - 50, 0); // Reduce health

      // Suggest fix based on type
      switch(comp.type) {
        case 'SERVER':
          suggestions.push("Add one more SERVER");
          break;
        case 'DB':
          suggestions.push("Add more DB or CACHE");
          break;
        case 'LOAD_BALANCER':
          suggestions.push("Add one more LOAD_BALANCER");
          break;
        default:
          suggestions.push(`Check ${comp.type} capacity`);
      }
    }

    // Save component metrics
    await comp.save();
  }

  // Update design status
  design.currentStatus = designCollapsed ? "collapsed" : "stable";
  await design.save();

  return {
    designStatus: design.currentStatus,
    components: design.components,
    suggestions
  };
};

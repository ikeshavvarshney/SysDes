import Design from "../models/design.js";
import Component from "../models/component.js";
import { calculateDesignCost } from "../services/costService.js";
import { simulateTraffic } from "../services/trafficService.js";

// ==========================================
// EXISTING FUNCTIONS (Keep as-is)
// ==========================================

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
    const userId = req.userId;
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

export const updateComponentInDesign = async (req, res) => {
  try {
    const { componentId } = req.params;
    const updates = req.body;

    const component = await Component.findByIdAndUpdate(componentId, updates, { new: true });
    if (!component) return res.status(404).json({ message: "Component not found" });

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

// ==========================================
// NEW FUNCTIONS - SIMULATION SNAPSHOTS
// ==========================================

export const saveSimulationSnapshot = async (req, res) => {
  try {
    const { designId } = req.params;
    const { nodes, edges, metrics, trafficLevel, timestamp } = req.body;
    
    const design = await Design.findById(designId);
    if (!design) return res.status(404).json({ message: "Design not found" });
    
    // Initialize history array if doesn't exist
    if (!design.simulationHistory) {
      design.simulationHistory = [];
    }
    
    design.simulationHistory.push({
      timestamp: timestamp || new Date(),
      nodes,
      edges,
      metrics,
      trafficLevel
    });
    
    // Keep only last 50 snapshots to avoid bloat
    if (design.simulationHistory.length > 50) {
      design.simulationHistory = design.simulationHistory.slice(-50);
    }
    
    await design.save();
    
    res.status(200).json({ 
      message: "Snapshot saved", 
      snapshotCount: design.simulationHistory.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Snapshot save failed", error: error.message });
  }
};

export const getSimulationHistory = async (req, res) => {
  try {
    const { designId } = req.params;
    const design = await Design.findById(designId);
    
    if (!design) return res.status(404).json({ message: "Design not found" });
    
    res.status(200).json({
      history: design.simulationHistory || [],
      count: design.simulationHistory?.length || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};

export const replaySnapshot = async (req, res) => {
  try {
    const { designId, snapshotIndex } = req.params;
    const design = await Design.findById(designId);
    
    if (!design) return res.status(404).json({ message: "Design not found" });
    
    const index = parseInt(snapshotIndex);
    if (!design.simulationHistory || !design.simulationHistory[index]) {
      return res.status(404).json({ message: "Snapshot not found" });
    }
    
    const snapshot = design.simulationHistory[index];
    
    res.status(200).json({ snapshot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Replay failed", error: error.message });
  }
};

// ==========================================
// NEW FUNCTIONS - AUTO-SCALE RECOMMENDATIONS
// ==========================================

export const getAutoScaleRecommendations = async (req, res) => {
  try {
    const { designId } = req.params;
    const design = await Design.findById(designId).populate('components');
    
    if (!design) return res.status(404).json({ message: "Design not found" });
    
    const recommendations = [];
    
    // Analyze each component
    design.components.forEach(comp => {
      const load = comp.metrics?.cpu || 0;
      const currentMultiplier = comp.capacityMultiplier || 1;
      
      // High Load → Vertical Scale
      if (load > 85 && currentMultiplier < 3) {
        recommendations.push({
          componentId: comp._id,
          type: 'VERTICAL_SCALE',
          reason: `${comp.type} at ${Math.round(load)}% CPU load`,
          action: `Increase capacity to v${currentMultiplier + 1}`,
          priority: 'HIGH',
          costIncrease: 50 * (currentMultiplier + 1)
        });
      }
      
      // Very High Load → Horizontal Scale
      if (load > 90) {
        recommendations.push({
          componentId: comp._id,
          type: 'HORIZONTAL_SCALE',
          reason: `${comp.type} critically overloaded at ${Math.round(load)}%`,
          action: 'Add parallel instance',
          priority: 'CRITICAL',
          costIncrease: comp.costPerHour || 100
        });
      }
      
      // Database Overload → Add Cache
      if ((comp.type === 'DB' || comp.type === 'NOSQL') && load > 80) {
        const hasCache = design.components.some(c => c.type === 'CACHE');
        if (!hasCache) {
          recommendations.push({
            componentId: comp._id,
            type: 'ADD_CACHE',
            reason: 'Database experiencing high query load',
            action: 'Add Redis cache layer',
            priority: 'HIGH',
            costIncrease: 60
          });
        }
      }
      
      // Low Load → Scale Down
      if (load < 20 && currentMultiplier > 1) {
        recommendations.push({
          componentId: comp._id,
          type: 'SCALE_DOWN',
          reason: `${comp.type} underutilized at ${Math.round(load)}%`,
          action: `Reduce capacity to v${currentMultiplier - 1}`,
          priority: 'LOW',
          costSavings: 50 * currentMultiplier
        });
      }
    });
    
    res.status(200).json({ 
      recommendations,
      count: recommendations.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Analysis failed", error: error.message });
  }
};

export const applyRecommendation = async (req, res) => {
  try {
    const { designId } = req.params;
    const { componentId, action } = req.body;
    
    const design = await Design.findById(designId).populate('components');
    if (!design) return res.status(404).json({ message: "Design not found" });
    
    const component = await Component.findById(componentId);
    if (!component) return res.status(404).json({ message: "Component not found" });
    
    let result;
    
    switch (action) {
      case 'VERTICAL_SCALE':
        component.capacityMultiplier = (component.capacityMultiplier || 1) + 1;
        component.capacity.cpu = Math.round(component.capacity.cpu * 1.5);
        component.capacity.memory = Math.round(component.capacity.memory * 1.5);
        component.capacity.requests = Math.round(component.capacity.requests * 1.5);
        component.costPerHour = Math.round(component.costPerHour * 1.5);
        result = `Scaled ${component.type} to v${component.capacityMultiplier}`;
        break;
        
      case 'HORIZONTAL_SCALE':
        // Create duplicate component
        const newComp = new Component({
          type: component.type,
          model: component.model,
          position: { x: component.position.x + 80, y: component.position.y },
          metrics: { cpu: 0, memory: 0, requests: 0 },
          capacity: component.capacity,
          health: 100,
          costPerHour: component.costPerHour,
          capacityMultiplier: 1
        });
        await newComp.save();
        design.components.push(newComp._id);
        
        // Copy connections
        const incomingConns = design.connections.filter(c => 
          c.target && c.target.toString() === componentId.toString()
        );
        const outgoingConns = design.connections.filter(c => 
          c.source && c.source.toString() === componentId.toString()
        );
        
        incomingConns.forEach(conn => {
          design.connections.push({ source: conn.source, target: newComp._id });
        });
        outgoingConns.forEach(conn => {
          design.connections.push({ source: newComp._id, target: conn.target });
        });
        
        result = `Added parallel ${component.type} instance`;
        break;
        
      case 'ADD_CACHE':
        const cache = new Component({
          type: 'CACHE',
          model: 'REDIS',
          position: { x: component.position.x - 100, y: component.position.y },
          metrics: { cpu: 0, memory: 0, requests: 0 },
          capacity: { cpu: 50, memory: 8000, requests: 10000 },
          health: 100,
          costPerHour: 60,
          capacityMultiplier: 1
        });
        await cache.save();
        design.components.push(cache._id);
        
        // Reroute connections through cache
        const dbIncoming = design.connections.filter(c => 
          c.target && c.target.toString() === componentId.toString()
        );
        design.connections = design.connections.filter(c => 
          !c.target || c.target.toString() !== componentId.toString()
        );
        
        dbIncoming.forEach(conn => {
          design.connections.push({ source: conn.source, target: cache._id });
        });
        design.connections.push({ source: cache._id, target: componentId });
        
        result = 'Added Redis cache layer';
        break;
        
      case 'SCALE_DOWN':
        component.capacityMultiplier = Math.max(1, (component.capacityMultiplier || 1) - 1);
        component.costPerHour = Math.round(component.costPerHour * 0.67);
        result = `Scaled down ${component.type} to v${component.capacityMultiplier}`;
        break;
        
      default:
        return res.status(400).json({ message: "Unknown action" });
    }
    
    await component.save();
    await design.save();
    
    const totalCost = await calculateDesignCost(designId);
    
    res.status(200).json({ 
      message: result,
      component,
      design,
      totalCost
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to apply recommendation", error: error.message });
  }
};

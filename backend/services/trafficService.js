import Design from "../models/design.js";
import Component from "../models/component.js";

// ==========================================
// INTELLIGENT AUTO-REDESIGN ENGINE
// ==========================================

const REDESIGN_STRATEGIES = {
  // When server is overloaded
  SERVER_OVERLOAD: {
    detect: (comp) => comp.type === 'SERVER' && comp.metrics.cpu > 85,
    fixes: [
      {
        priority: 1,
        name: 'horizontal_scale',
        description: 'Add parallel server instance',
        action: async (design, failedComp) => {
          // Create a new server component
          const newServer = new Component({
            type: 'SERVER',
            model: failedComp.model,
            position: { x: failedComp.position.x + 150, y: failedComp.position.y },
            metrics: { cpu: 0, memory: 0, requests: 0 },
            capacity: failedComp.capacity,
            health: 100,
            costPerHour: failedComp.costPerHour
          });
          await newServer.save();

          // Add to design
          design.components.push(newServer._id);
          
          // Copy connections from failed component
          const incomingConns = design.connections.filter(c => c.target === failedComp._id.toString());
          const outgoingConns = design.connections.filter(c => c.source === failedComp._id.toString());
          
          incomingConns.forEach(conn => {
            design.connections.push({ source: conn.source, target: newServer._id });
          });
          outgoingConns.forEach(conn => {
            design.connections.push({ source: newServer._id, target: conn.target });
          });

          return {
            type: 'ADD_COMPONENT',
            component: newServer,
            connections: [...incomingConns, ...outgoingConns].map(c => ({ ...c, target: newServer._id }))
          };
        }
      },
      {
        priority: 2,
        name: 'add_load_balancer',
        description: 'Add load balancer before servers',
        action: async (design, failedComp) => {
          const lb = new Component({
            type: 'LOAD_BALANCER',
            model: 'BASIC',
            position: { x: failedComp.position.x - 200, y: failedComp.position.y },
            metrics: { cpu: 0, memory: 0, requests: 0 },
            capacity: { cpu: 80, memory: 16000, requests: 5000 },
            health: 100,
            costPerHour: 50
          });
          await lb.save();
          
          design.components.push(lb._id);
          
          // Redirect incoming traffic through LB
          const incomingConns = design.connections.filter(c => c.target === failedComp._id.toString());
          design.connections = design.connections.filter(c => c.target !== failedComp._id.toString());
          
          incomingConns.forEach(conn => {
            design.connections.push({ source: conn.source, target: lb._id });
          });
          design.connections.push({ source: lb._id, target: failedComp._id });

          return {
            type: 'ADD_COMPONENT',
            component: lb,
            connections: [{ source: lb._id, target: failedComp._id }]
          };
        }
      }
    ]
  },

  // When database is overloaded
  DB_OVERLOAD: {
    detect: (comp) => (comp.type === 'DB' || comp.type === 'NOSQL') && comp.metrics.requests > comp.capacity.requests * 0.8,
    fixes: [
      {
        priority: 1,
        name: 'add_cache',
        description: 'Add Redis cache layer',
        action: async (design, failedComp) => {
          const cache = new Component({
            type: 'CACHE',
            model: 'REDIS',
            position: { x: failedComp.position.x - 200, y: failedComp.position.y },
            metrics: { cpu: 0, memory: 0, requests: 0 },
            capacity: { cpu: 50, memory: 8000, requests: 10000 },
            health: 100,
            costPerHour: 60
          });
          await cache.save();
          
          design.components.push(cache._id);
          
          // Insert cache between servers and DB
          const incomingConns = design.connections.filter(c => c.target === failedComp._id.toString());
          design.connections = design.connections.filter(c => c.target !== failedComp._id.toString());
          
          incomingConns.forEach(conn => {
            design.connections.push({ source: conn.source, target: cache._id });
          });
          design.connections.push({ source: cache._id, target: failedComp._id });

          return {
            type: 'ADD_COMPONENT',
            component: cache,
            connections: [{ source: cache._id, target: failedComp._id }]
          };
        }
      },
      {
        priority: 2,
        name: 'add_read_replica',
        description: 'Add read-only database replica',
        action: async (design, failedComp) => {
          const replica = new Component({
            type: failedComp.type,
            model: failedComp.model + '_REPLICA',
            position: { x: failedComp.position.x, y: failedComp.position.y + 150 },
            metrics: { cpu: 0, memory: 0, requests: 0 },
            capacity: failedComp.capacity,
            health: 100,
            costPerHour: failedComp.costPerHour * 0.8
          });
          await replica.save();
          
          design.components.push(replica._id);
          
          // Share read traffic
          const incomingConns = design.connections.filter(c => c.target === failedComp._id.toString());
          incomingConns.slice(0, Math.ceil(incomingConns.length / 2)).forEach(conn => {
            design.connections.push({ source: conn.source, target: replica._id });
          });

          return {
            type: 'ADD_COMPONENT',
            component: replica,
            connections: incomingConns.map(c => ({ source: c.source, target: replica._id }))
          };
        }
      }
    ]
  },

  // When load balancer is overloaded
  LB_OVERLOAD: {
    detect: (comp) => comp.type === 'LOAD_BALANCER' && comp.metrics.requests > comp.capacity.requests * 0.9,
    fixes: [
      {
        priority: 1,
        name: 'upgrade_lb',
        description: 'Upgrade to premium load balancer',
        action: async (design, failedComp) => {
          failedComp.model = 'PREMIUM';
          failedComp.capacity.requests = 20000;
          failedComp.costPerHour = 200;
          await failedComp.save();

          return {
            type: 'UPGRADE_COMPONENT',
            component: failedComp
          };
        }
      }
    ]
  },

  // Network bottleneck
  NETWORK_BOTTLENECK: {
    detect: (comp) => comp.metrics.requests > 5000 && !design.components.some(c => c.type === 'CDN'),
    fixes: [
      {
        priority: 1,
        name: 'add_cdn',
        description: 'Add CDN for static assets',
        action: async (design, failedComp) => {
          const cdn = new Component({
            type: 'CDN',
            model: 'CLOUDFLARE',
            position: { x: 100, y: 300 },
            metrics: { cpu: 0, memory: 0, requests: 0 },
            capacity: { cpu: 100, memory: 32000, requests: 50000 },
            health: 100,
            costPerHour: 40
          });
          await cdn.save();
          
          design.components.push(cdn._id);

          return {
            type: 'ADD_COMPONENT',
            component: cdn,
            connections: []
          };
        }
      }
    ]
  }
};

// ==========================================
// IMPROVED SIMULATION ENGINE
// ==========================================

export const simulateTraffic = async (designId, trafficIncrease) => {
  const design = await Design.findById(designId).populate('components');

  if (!design) throw new Error("Design not found");

  const suggestions = [];
  const appliedFixes = [];
  let designCollapsed = false;

  // 1. Distribute traffic and detect failures
  for (let comp of design.components) {
    // Simulate traffic impact
    comp.metrics.cpu += trafficIncrease * 0.5;
    comp.metrics.memory += trafficIncrease * 0.3;
    comp.metrics.requests += trafficIncrease;

    // Check for collapse
    const isCpuOverload = comp.metrics.cpu > comp.capacity.cpu;
    const isMemoryOverload = comp.metrics.memory > comp.capacity.memory;
    const isRequestOverload = comp.metrics.requests > comp.capacity.requests;

    if (isCpuOverload || isMemoryOverload || isRequestOverload) {
      designCollapsed = true;
      comp.health = Math.max(comp.health - 30, 0);

      // Find applicable fix strategy
      for (let [strategyName, strategy] of Object.entries(REDESIGN_STRATEGIES)) {
        if (strategy.detect(comp)) {
          const bestFix = strategy.fixes[0]; // Take highest priority fix
          
          suggestions.push({
            type: bestFix.name,
            reason: `${comp.type} is overloaded (CPU: ${comp.metrics.cpu}%, Requests: ${comp.metrics.requests})`,
            description: bestFix.description,
            severity: comp.health < 50 ? 'CRITICAL' : 'WARNING',
            componentId: comp._id,
            autoFixAvailable: true
          });

          // Optionally auto-apply fix (for demo purposes)
          // const fixResult = await bestFix.action(design, comp);
          // appliedFixes.push(fixResult);
          
          break; // One fix per component
        }
      }
    }

    await comp.save();
  }

  // 2. Update design status
  design.currentStatus = designCollapsed ? "collapsed" : "stable";
  design.lastSimulation = {
    timestamp: new Date(),
    traffic: trafficIncrease,
    status: design.currentStatus
  };
  await design.save();

  return {
    designStatus: design.currentStatus,
    components: design.components,
    suggestions, // Array of actionable suggestions
    appliedFixes, // If auto-fix is enabled
    metrics: {
      totalTraffic: design.components.reduce((sum, c) => sum + c.metrics.requests, 0),
      avgCpu: design.components.reduce((sum, c) => sum + c.metrics.cpu, 0) / design.components.length,
      failedComponents: design.components.filter(c => c.health < 50).length
    }
  };
};

// ==========================================
// AUTO-APPLY SUGGESTED FIX
// ==========================================

export const applyAutoFix = async (designId, suggestionIndex) => {
  const design = await Design.findById(designId).populate('components');
  
  // Re-run simulation to get current suggestions
  const simResult = await simulateTraffic(designId, 0);
  const suggestion = simResult.suggestions[suggestionIndex];
  
  if (!suggestion) throw new Error("Invalid suggestion index");

  const failedComp = design.components.find(c => c._id.toString() === suggestion.componentId.toString());
  
  // Find and execute the fix
  for (let [strategyName, strategy] of Object.entries(REDESIGN_STRATEGIES)) {
    if (strategy.detect(failedComp)) {
      const fix = strategy.fixes.find(f => f.name === suggestion.type);
      if (fix) {
        const result = await fix.action(design, failedComp);
        await design.save();
        
        return {
          success: true,
          message: `Applied fix: ${suggestion.description}`,
          changes: result
        };
      }
    }
  }

  throw new Error("Could not apply fix");
};

// ==========================================
// RESET SIMULATION (FOR TESTING)
// ==========================================

export const resetSimulation = async (designId) => {
  const design = await Design.findById(designId).populate('components');
  
  for (let comp of design.components) {
    comp.metrics = { cpu: 0, memory: 0, requests: 0 };
    comp.health = 100;
    await comp.save();
  }
  
  design.currentStatus = "stable";
  await design.save();
  
  return { message: "Simulation reset" };
};


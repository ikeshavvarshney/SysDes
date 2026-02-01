import Security from "../models/security.js";

// ==========================================
// PAGE 2: Security as Stress (Configuration)
// ==========================================

export const updateSecurity = async (req, res) => {
  try {
    const { designId, activeProtections, detectedAttacks } = req.body;

    let security = await Security.findOne({ designId });
    if (!security) {
      security = new Security({ designId, activeProtections, detectedAttacks });
    } else {
      security.activeProtections = activeProtections;
      security.detectedAttacks = detectedAttacks;
    }

    await security.save();
    res.status(200).json(security);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

export const getSecurity = async (req, res) => {
  try {
    const security = await Security.findOne({ designId: req.params.designId });
    res.status(200).json(security);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// ==========================================
// CYBER SECURITY SIMULATOR (Live State)
// ==========================================

// Start/Stop Simulation
export const toggleSimulation = async (req, res) => {
  try {
    const { designId } = req.params;
    const { isRunning } = req.body;
    
    const security = await Security.findOne({ designId });
    if (!security) return res.status(404).json({ message: "Security config not found" });
    
    security.simulationState.isRunning = isRunning;
    
    if (!isRunning) {
      // Reset on stop
      security.simulationState.attacksInProgress = [];
    }
    
    await security.save();
    res.status(200).json(security);
  } catch (err) {
    res.status(500).json({ message: "Toggle failed", err });
  }
};

// Update Live Simulation State
export const updateSimulationState = async (req, res) => {
  try {
    const { designId } = req.params;
    const { attacksInProgress, nodeHealth, metrics } = req.body;
    
    const security = await Security.findOne({ designId });
    if (!security) return res.status(404).json({ message: "Security not found" });
    
    // Update state
    if (attacksInProgress !== undefined) security.simulationState.attacksInProgress = attacksInProgress;
    if (nodeHealth !== undefined) security.simulationState.nodeHealth = nodeHealth;
    if (metrics !== undefined) security.simulationState.metrics = metrics;
    
    security.simulationState.lastUpdated = Date.now();
    
    await security.save();
    res.status(200).json(security.simulationState);
  } catch (err) {
    res.status(500).json({ message: "State update failed", err });
  }
};

// Log Attack Event
export const logAttack = async (req, res) => {
  try {
    const { designId } = req.params;
    const { type, target, severity } = req.body;
    
    const security = await Security.findOne({ designId });
    if (!security) return res.status(404).json({ message: "Security not found" });
    
    // Add to attack history
    security.detectedAttacks.push({
      type,
      timestamp: new Date(),
      severity,
      mitigated: security.activeProtections.length > 0
    });
    
    await security.save();
    res.status(200).json({ message: "Attack logged", security });
  } catch (err) {
    res.status(500).json({ message: "Logging failed", err });
  }
};

// Calculate Security Impact on Performance
export const calculateSecurityImpact = async (req, res) => {
  try {
    const { designId } = req.params;
    const security = await Security.findOne({ designId });
    
    if (!security) return res.status(404).json({ message: "Security not found" });
    
    // Calculate overhead based on active protections
    const latencyImpact = {
      WAF: 5,
      RATE_LIMITER: 2,
      CAPTCHA: 50,
      ENCRYPTION: 10,
      AUTH_GATEWAY: 8,
      IDS: 3,
      FIREWALL: 4
    };
    
    let totalLatencyOverhead = 0;
    security.activeProtections.forEach(protection => {
      totalLatencyOverhead += latencyImpact[protection] || 0;
    });
    
    const impact = {
      latencyOverhead: totalLatencyOverhead,
      costIncrease: security.activeProtections.length * 15,
      attacksBlocked: security.detectedAttacks.filter(a => a.mitigated).length,
      securityScore: security.securityScore,
      protectionCount: security.activeProtections.length
    };
    
    res.status(200).json(impact);
  } catch (err) {
    res.status(500).json({ message: "Calculation failed", err });
  }
};
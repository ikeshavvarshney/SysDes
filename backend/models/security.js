import mongoose from 'mongoose';

const securitySchema = new mongoose.Schema({
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true
  },
  
  // --- Page 2: Security as Stress (Configuration) ---
  activeProtections: [{
    type: String,
    enum: ['WAF', 'RATE_LIMITER', 'CAPTCHA', 'ENCRYPTION', 'AUTH_GATEWAY', 'IDS', 'FIREWALL']
  }],
  
  detectedAttacks: [{
    type: {
      type: String,
      enum: ['DDOS', 'SQL_INJECTION', 'XSS', 'BRUTE_FORCE', 'MALWARE']
    },
    timestamp: Date,
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    mitigated: {
      type: Boolean,
      default: false
    }
  }],
  
  securityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  
  // --- NEW: Live Simulation State (for CyberSecuritySim.jsx) ---
  simulationState: {
    isRunning: { type: Boolean, default: false },
    
    attacksInProgress: [{
      id: String,
      type: String,
      target: String,
      startTime: Date,
      damage: Number
    }],
    
    nodeHealth: {
      internet: { type: Number, default: 100 },
      firewall: { type: Number, default: 100 },
      lb: { type: Number, default: 100 },
      web: { type: Number, default: 100 },
      app: { type: Number, default: 100 },
      db: { type: Number, default: 100 }
    },
    
    metrics: {
      systemIntegrity: { type: Number, default: 100 },
      latencyOverhead: { type: Number, default: 0 },  // Added by security layers
      throughput: { type: Number, default: 1000 },
      blockedAttacks: { type: Number, default: 0 }
    },
    
    lastUpdated: { type: Date, default: Date.now }
  }
  
}, { timestamps: true });

export default mongoose.model('Security', securitySchema);

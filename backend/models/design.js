import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  }],
  connections: [{
    source: mongoose.Schema.Types.ObjectId,
    target: mongoose.Schema.Types.ObjectId
  }],
  currentStatus: {
    type: String,
    enum: ['stable', 'warning', 'collapsed'],
    default: 'stable'
  },
  lastSimulation: {
    timestamp: Date,
    traffic: Number,
    status: String,
    suggestions: [mongoose.Schema.Types.Mixed]
  },
  
  // NEW: Simulation History for replay/analysis
  simulationHistory: [{
    timestamp: { type: Date, default: Date.now },
    nodes: [mongoose.Schema.Types.Mixed],
    edges: [mongoose.Schema.Types.Mixed],
    metrics: {
      throughput: Number,
      latency: Number,
      errorRate: Number,
      cost: Number,
      score: Number
    },
    trafficLevel: Number
  }],
  
  trafficConfig: {
    currentLevel: { type: Number, default: 100 },
    maxLevel: { type: Number, default: 10000 }
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Virtual for total cost
designSchema.virtual('totalCost').get(function() {
  return this.components.reduce((sum, comp) => sum + (comp.costPerHour || 0), 0);
});

export default mongoose.model('Design', designSchema);
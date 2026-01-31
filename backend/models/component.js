import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['LOAD_BALANCER', 'SERVER', 'DB', 'CACHE', 'WAF'],
    required: true
  },
  model: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  health: {
    type: Number,
    default: 100
  },
  costPerHour: {
    type: Number,
    default: 0
  },
  metrics: {
    cpu: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    latency: { type: Number, default: 0 },
    requests: { type: Number, default: 0 }
  },
  // NEW: capacity for traffic simulation
  capacity: {
    cpu: { type: Number, default: 100 },
    memory: { type: Number, default: 100 },
    requests: { type: Number, default: 1000 }
  }
}, { timestamps: true });

export default mongoose.model('Component', componentSchema);

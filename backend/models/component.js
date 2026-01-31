import mongoose from 'mongoose';

// ==========================================
// COMPONENT MODEL
// ==========================================

const componentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['CLIENT', 'LOAD_BALANCER', 'API_GATEWAY', 'SERVER', 'MICROSERVICE', 
           'DB', 'NOSQL', 'CACHE', 'CDN', 'QUEUE', 'SERVERLESS_FUNCTION', 'WAF', 
           'RATE_LIMITER', 'ENCRYPTION', 'AUTH_GATEWAY']
  },
  model: {
    type: String,
    default: 'BASIC'
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  metrics: {
    cpu: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    requests: { type: Number, default: 0 }
  },
  capacity: {
    cpu: { type: Number, default: 100 },
    memory: { type: Number, default: 8000 },
    requests: { type: Number, default: 1000 }
  },
  health: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  costPerHour: {
    type: Number,
    default: 50
  },
  customLabel: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });


export default mongoose.model('Component', componentSchema);

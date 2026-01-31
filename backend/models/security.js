// models/security.js
import mongoose from 'mongoose';

const securitySchema = new mongoose.Schema({
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true
  },
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
  }
}, { timestamps: true });


export default mongoose.model('Security', securitySchema);


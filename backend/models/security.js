// models/security.js
import mongoose from 'mongoose';

const securitySchema = new mongoose.Schema({
  designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true },
  activeProtections: [{ type: String, enum: ['WAF', 'RATE_LIMITER', 'AUTH_GATEWAY'] }],
  detectedAttacks: [{ type: String }]
}, { timestamps: true }); // adds createdAt and updatedAt automatically

export default mongoose.model('Security', securitySchema);


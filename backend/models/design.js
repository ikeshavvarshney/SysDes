// models/design.js
import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true },
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  connections: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' }
  }],
  trafficConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  currentStatus: { type: String, enum: ['stable', 'collapsed'], default: 'stable' }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

export default mongoose.model('Design', designSchema);

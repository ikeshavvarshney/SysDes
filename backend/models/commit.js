// models/commit.js
import mongoose from 'mongoose';
const commitSchema = new mongoose.Schema({
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    default: 'Design snapshot'
  },
  snapshot: {
    components: [mongoose.Schema.Types.Mixed],
    connections: [mongoose.Schema.Types.Mixed],
    trafficConfig: mongoose.Schema.Types.Mixed,
    currentStatus: String
  }
}, { timestamps: true });

export default mongoose.model('Commit', commitSchema);

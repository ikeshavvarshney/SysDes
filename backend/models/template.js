// models/template.js
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  trafficProfile: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true }); // automatically adds createdAt and updatedAt

export default mongoose.model('Template', templateSchema);

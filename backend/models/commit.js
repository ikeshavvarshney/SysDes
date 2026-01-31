// models/commit.js
import mongoose from 'mongoose';

const commitSchema = new mongoose.Schema({
  designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true } // Object is fine, Mixed is more flexible
}, { timestamps: true }); // automatically adds createdAt and updatedAt

export default mongoose.model('Commit', commitSchema);

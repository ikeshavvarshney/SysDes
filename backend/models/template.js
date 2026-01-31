// models/template.js
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    default: 'BEGINNER'
  },
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  }],
  connections: [{
    source: mongoose.Schema.Types.ObjectId,
    target: mongoose.Schema.Types.ObjectId
  }],
  estimatedCost: {
    type: Number,
    default: 0
  },
  thumbnail: String,
  usageCount: {
    type: Number,
    default: 0
  },
  tags: [String]
}, { timestamps: true });


export default mongoose.model('Template', templateSchema);

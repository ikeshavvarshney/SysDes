import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Untitled Workflow'
    },
    
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // ✅ FIX: Use Mixed type for flexibility
    nodes: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    edges: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    template: {
      type: String,
      default: "free-play"
    },
    
    status: {
      type: String,
      enum: ['idle', 'running', 'completed', 'failed'],
      default: 'idle'
    },
    
    // Execution History
    executionHistory: [{
      timestamp: { type: Date, default: Date.now },
      logs: [mongoose.Schema.Types.Mixed],
      status: String,
      chaosMode: Boolean
    }],
    
    // Last execution details
    lastExecution: {
      timestamp: Date,
      logs: [mongoose.Schema.Types.Mixed],
      status: String,
      duration: Number
    }
  },
  { 
    timestamps: true,
    strict: false // ✅ Allow flexible schema
  }
);

export default mongoose.model("Workflow", workflowSchema);
import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
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
  
  // Canvas Nodes (LLM, Agent, Tools, etc.)
  nodes: [{
    id: String,
    type: String,  // 'IN_USER', 'LLM_GPT', 'TOOL_WEB', etc.
    x: Number,
    y: Number,
    status: { 
      type: String, 
      enum: ['idle', 'running', 'success', 'error'],
      default: 'idle' 
    }
  }],
  
  // Connections between nodes
  edges: [{
    id: String,
    source: String,  // Node ID
    target: String   // Node ID
  }],
  
  // Template used (if any)
  template: {
    type: String,
    enum: ['free-play', 'rag-pipeline', 'research-agent', 'multi-agent-collab'],
    default: 'free-play'
  },
  
  // Workflow execution status
  status: {
    type: String,
    enum: ['idle', 'running', 'completed', 'failed'],
    default: 'idle'
  },
  
  // Execution History
  executionHistory: [{
    timestamp: { type: Date, default: Date.now },
    logs: [{
      nodeId: String,
      message: String,
      type: { type: String, enum: ['info', 'success', 'error', 'warning'] },
      timestamp: Number
    }],
    status: String,
    chaosMode: Boolean
  }],
  
  // Last execution details
  lastExecution: {
    timestamp: Date,
    logs: [mongoose.Schema.Types.Mixed],
    status: String,
    duration: Number  // milliseconds
  }
  
}, { timestamps: true });

export default mongoose.model('Workflow', workflowSchema);
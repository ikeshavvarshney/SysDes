import Workflow from "../models/workflow.js";

// ==========================================
// CREATE WORKFLOW
// ==========================================

export const createWorkflow = async (req, res) => {
  try {
    const { name, nodes, edges, template } = req.body;
    const ownerId = req.userId;
    
    const workflow = await Workflow.create({
      name: name || 'Untitled Workflow',
      ownerId,
      nodes: nodes || [],
      edges: edges || [],
      template: template || 'free-play',
      status: 'idle'
    });
    
    res.status(201).json(workflow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Workflow creation failed", error: error.message });
  }
};

// ==========================================
// GET ALL WORKFLOWS FOR USER
// ==========================================

export const getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find({ ownerId: req.userId });
    res.status(200).json(workflows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch workflows", error: error.message });
  }
};

// ==========================================
// GET WORKFLOW BY ID
// ==========================================

export const getWorkflowById = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const workflow = await Workflow.findById(workflowId);
    
    if (!workflow) return res.status(404).json({ message: "Workflow not found" });
    
    res.status(200).json(workflow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch workflow", error: error.message });
  }
};

// ==========================================
// UPDATE WORKFLOW (Nodes/Edges)
// ==========================================

export const updateWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { name, nodes, edges, template } = req.body;
    
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) return res.status(404).json({ message: "Workflow not found" });
    
    if (name !== undefined) workflow.name = name;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;
    if (template !== undefined) workflow.template = template;
    
    await workflow.save();
    
    res.status(200).json(workflow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update workflow", error: error.message });
  }
};

// ==========================================
// DELETE WORKFLOW
// ==========================================

export const deleteWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const workflow = await Workflow.findByIdAndDelete(workflowId);
    if (!workflow) return res.status(404).json({ message: "Workflow not found" });
    
    res.status(200).json({ message: "Workflow deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete workflow", error: error.message });
  }
};

// ==========================================
// EXECUTE WORKFLOW (Simulation)
// ==========================================

export const executeWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { chaosMode } = req.body;
    
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) return res.status(404).json({ message: "Workflow not found" });
    
    // Simulate workflow execution
    const executionLog = await simulateWorkflowExecution(
      workflow.nodes, 
      workflow.edges, 
      chaosMode || false
    );
    
    // Save to execution history
    workflow.executionHistory.push({
      timestamp: new Date(),
      logs: executionLog,
      status: 'completed',
      chaosMode: chaosMode || false
    });
    
    // Update last execution
    workflow.lastExecution = {
      timestamp: new Date(),
      logs: executionLog,
      status: 'completed',
      duration: executionLog.length * 500 // Approximate duration
    };
    
    workflow.status = 'completed';
    
    await workflow.save();
    
    res.status(200).json({ workflow, executionLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Workflow execution failed", error: error.message });
  }
};

// ==========================================
// HELPER: Simulate Workflow Execution
// ==========================================

const simulateWorkflowExecution = async (nodes, edges, chaosMode) => {
  const logs = [];
  
  // Success messages for each node type
  const successMessages = {
    'USER_PROMPT': '✓ User input captured',
    'LLM': '✓ LLM inference completed',
    'VECTOR_STORE': '✓ Context retrieved from vector DB',
    'WEB_SEARCH': '✓ Web search completed',
    'CHAT_HISTORY': '✓ Conversation history loaded',
    'PLANNER': '✓ Routing decision made',
    'REACT_AGENT': '✓ Agent reasoning complete',
    'PYTHON_INTERPRETER': '✓ Code executed successfully',
    'CHAT_INTERFACE': '✓ Response delivered to user',
    'SYSTEM_INSTRUCTIONS': '✓ System prompt loaded',
    'DOCUMENT_INPUT': '✓ Document processed'
  };
  
  // Failure messages for chaos mode
  const failureMessages = {
    'USER_PROMPT': '✗ Invalid input format detected',
    'LLM': '✗ LLM API timeout - rate limit exceeded',
    'VECTOR_STORE': '✗ Vector DB connection failed',
    'WEB_SEARCH': '✗ Network request timeout',
    'CHAT_HISTORY': '✗ Memory storage corrupted',
    'PLANNER': '✗ Routing logic error',
    'REACT_AGENT': '✗ Agent failed to converge',
    'PYTHON_INTERPRETER': '✗ Runtime error in code execution',
    'CHAT_INTERFACE': '✗ Output delivery failed',
    'SYSTEM_INSTRUCTIONS': '✗ Invalid system prompt',
    'DOCUMENT_INPUT': '✗ Document parsing failed'
  };
  
  // Find entry nodes (nodes with no incoming edges)
  const entryNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );
  
  // Simulate execution from entry nodes
  for (const node of entryNodes) {
    await processNode(node.id, nodes, edges, logs, chaosMode, successMessages, failureMessages);
  }
  
  return logs;
};

const processNode = async (nodeId, nodes, edges, logs, chaosMode, successMessages, failureMessages) => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  const timestamp = Date.now();
  
  // Chaos mode: 30% chance of failure
  if (chaosMode && Math.random() > 0.7) {
    logs.push({
      nodeId,
      message: failureMessages[node.type] || '✗ Operation failed',
      type: 'error',
      timestamp
    });
    
    // Recovery message
    setTimeout(() => {
      logs.push({
        nodeId,
        message: '🔧 Automatic recovery: System self-healed.',
        type: 'info',
        timestamp: timestamp + 500
      });
    }, 500);
  } else {
    logs.push({
      nodeId,
      message: successMessages[node.type] || '✓ Processing complete',
      type: 'success',
      timestamp
    });
  }
  
  // Find next nodes
  const outgoingEdges = edges.filter(edge => edge.source === nodeId);
  for (const edge of outgoingEdges) {
    await processNode(edge.target, nodes, edges, logs, chaosMode, successMessages, failureMessages);
  }
};

// ==========================================
// GET EXECUTION HISTORY
// ==========================================

export const getExecutionHistory = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const workflow = await Workflow.findById(workflowId);
    
    if (!workflow) return res.status(404).json({ message: "Workflow not found" });
    
    res.status(200).json({
      history: workflow.executionHistory || [],
      count: workflow.executionHistory?.length || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};
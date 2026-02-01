"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Cpu, 
  Database, 
  Server, 
  AlertTriangle, 
  MessageSquare, 
  Activity, 
  GitBranch, 
  Zap, 
  Sun,
  Moon,
  Trash2,
  Globe,
  Code,
  FileText,
  MessageCircle,
  Brain,
  Route,
  Search,
  Settings,
  ChevronDown,
  Circle,
  Play as PlayIcon,
  Pause,
  Link2,
  X
} from 'lucide-react';

// --- WORKFLOW TEMPLATES ---
const WORKFLOW_TEMPLATES = {
  'free-play': {
    name: 'Free Play',
    description: 'Experiment with different agent architectures',
    nodes: [
      { id: '1', type: 'USER_PROMPT', x: 150, y: 300, status: 'idle' },
      { id: '2', type: 'LLM', x: 450, y: 300, status: 'idle' },
      { id: '3', type: 'VECTOR_STORE', x: 450, y: 150, status: 'idle' },
      { id: '4', type: 'WEB_SEARCH', x: 450, y: 450, status: 'idle' },
    ],
    edges: []
  },
  'rag-pipeline': {
    name: 'RAG Pipeline',
    description: 'Retrieval-Augmented Generation workflow',
    nodes: [
      { id: '1', type: 'USER_PROMPT', x: 100, y: 250, status: 'idle' },
      { id: '2', type: 'VECTOR_STORE', x: 400, y: 150, status: 'idle' },
      { id: '3', type: 'LLM', x: 700, y: 250, status: 'idle' },
      { id: '4', type: 'CHAT_INTERFACE', x: 1000, y: 250, status: 'idle' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
    ]
  },
  'research-agent': {
    name: 'Research Agent',
    description: 'Multi-step research with web search',
    nodes: [
      { id: '1', type: 'USER_PROMPT', x: 100, y: 250, status: 'idle' },
      { id: '2', type: 'PLANNER', x: 350, y: 250, status: 'idle' },
      { id: '3', type: 'WEB_SEARCH', x: 600, y: 150, status: 'idle' },
      { id: '4', type: 'LLM', x: 850, y: 250, status: 'idle' },
      { id: '5', type: 'CHAT_INTERFACE', x: 1100, y: 250, status: 'idle' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e2-4', source: '2', target: '4' },
    ]
  },
  'multi-agent-collab': {
    name: 'Multi-Agent Collaboration',
    description: 'Multiple specialized agents working together',
    nodes: [
      { id: '1', type: 'USER_PROMPT', x: 100, y: 300, status: 'idle' },
      { id: '2', type: 'PLANNER', x: 350, y: 300, status: 'idle' },
      { id: '3', type: 'REACT_AGENT', x: 600, y: 150, status: 'idle' },
      { id: '4', type: 'WEB_SEARCH', x: 850, y: 100, status: 'idle' },
      { id: '5', type: 'PYTHON_INTERPRETER', x: 600, y: 350, status: 'idle' },
      { id: '6', type: 'LLM', x: 850, y: 300, status: 'idle' },
      { id: '7', type: 'VECTOR_STORE', x: 600, y: 500, status: 'idle' },
      { id: '8', type: 'CHAT_INTERFACE', x: 1100, y: 300, status: 'idle' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-6', source: '4', target: '6' },
      { id: 'e5-6', source: '5', target: '6' },
      { id: 'e2-7', source: '2', target: '7' },
      { id: 'e7-6', source: '7', target: '6' },
      { id: 'e6-8', source: '6', target: '8' },
    ]
  }
};

// --- NODE TYPE DEFINITIONS ---
const NODE_CATEGORIES = {
  MODELS: [
    { 
      id: 'LLM', 
      label: 'LLM (GPT-4)',
      icon: Cpu,
      color: '#ec4899',
      inputs: [{ name: 'text', type: 'text' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'Language Model'
    },
    { 
      id: 'REACT_AGENT',
      label: 'ReAct Agent',
      icon: Brain,
      color: '#a855f7',
      inputs: [{ name: 'text', type: 'text' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'Reasoning Agent'
    },
    { 
      id: 'PLANNER',
      label: 'Planner / Router',
      icon: Route,
      color: '#d946ef',
      inputs: [{ name: 'text', type: 'text' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'Decision Router'
    },
  ],
  TOOLS: [
    { 
      id: 'WEB_SEARCH',
      label: 'Web Search',
      icon: Globe,
      color: '#06b6d4',
      inputs: [{ name: 'text', type: 'text' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'Internet Search'
    },
    { 
      id: 'PYTHON_INTERPRETER',
      label: 'Python Interpreter',
      icon: Code,
      color: '#f59e0b',
      inputs: [{ name: 'text', type: 'text' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'Execute Code'
    },
  ],
  MEMORY: [
    { 
      id: 'CHAT_HISTORY',
      label: 'Chat History',
      icon: MessageCircle,
      color: '#f43f5e',
      inputs: [{ name: 'text', type: 'text' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'Conversation Memory'
    },
    { 
      id: 'VECTOR_STORE',
      label: 'Vector Store (RAG)',
      icon: Database,
      color: '#eab308',
      inputs: [{ name: 'doc', type: 'doc' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'Semantic Search'
    },
  ],
  OUTPUTS: [
    { 
      id: 'CHAT_INTERFACE',
      label: 'Chat Interface',
      icon: MessageSquare,
      color: '#c084fc',
      inputs: [{ name: 'text', type: 'text' }],
      outputs: [],
      description: 'User Output'
    },
  ],
  INPUTS: [
    { 
      id: 'USER_PROMPT',
      label: 'User Prompt',
      icon: MessageSquare,
      color: '#e879f9',
      inputs: [{ name: 'none', type: 'none' }],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'User Input'
    },
    {
      id: 'SYSTEM_INSTRUCTIONS',
      label: 'System Instructions',
      icon: Settings,
      color: '#9333ea',
      inputs: [],
      outputs: [{ name: 'text', type: 'text' }],
      description: 'System Prompt'
    },
    {
      id: 'DOCUMENT_INPUT',
      label: 'Document Input',
      icon: FileText,
      color: '#a78bfa',
      inputs: [],
      outputs: [{ name: 'doc', type: 'doc' }],
      description: 'File Upload'
    },
  ]
};

const NODE_TYPES = Object.values(NODE_CATEGORIES).flat().reduce((acc, node) => {
  acc[node.id] = node;
  return acc;
}, {});

// --- COMPONENTS ---

const ConnectionPort = ({ type, position, portData, onMouseDown, onMouseUp, isConnecting }) => {
  const isInput = type === 'target';
  const positionClass = position === 'left' ? '-left-2.5' : '-right-2.5';
  
  return (
    <div 
      className={`absolute ${positionClass} top-1/2 -translate-y-1/2 flex items-center gap-1 z-30 group`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {isInput && portData && (
        <span className="text-[9px] font-mono text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity pr-1 bg-black/50 px-1 rounded">
          {portData.name}
        </span>
      )}
      <div 
        className={`w-3.5 h-3.5 rounded-full border-2 cursor-crosshair transition-all ${
          isInput 
            ? `bg-gray-900 border-purple-500 hover:border-pink-400 hover:scale-125 ${isConnecting ? 'ring-2 ring-pink-500 scale-125 animate-pulse' : ''}` 
            : 'bg-linear-to-br from-pink-500 to-purple-500 border-pink-300 hover:scale-125 shadow-lg shadow-pink-500/50'
        }`}
        title={isInput ? 'Drop to connect' : 'Drag to connect'}
      />
      {!isInput && portData && (
        <span className="text-[9px] font-mono text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity pl-1 bg-black/50 px-1 rounded">
          {portData.name}
        </span>
      )}
    </div>
  );
};

const WorkflowNode = ({ node, nodeType, isDragging, onMouseDown, onDelete, onPortMouseDown, onPortMouseUp, isConnecting, logs }) => {
  if (!nodeType) return null;

  const recentLog = logs.find(l => l.nodeId === node.id && Date.now() - l.timestamp < 3000);
  
  return (
    <div
      className={`absolute w-64 rounded-xl border-2 bg-linear-to-br from-purple-950/90 via-gray-900/90 to-pink-950/90 backdrop-blur-sm transition-all duration-200 group ${
        isDragging ? 'cursor-grabbing scale-105 z-50 shadow-2xl shadow-purple-500/30' : 'cursor-grab hover:shadow-xl hover:shadow-purple-500/20'
      } ${node.status === 'running' ? 'ring-2 ring-pink-500 shadow-pink-500/50 scale-105' : ''} ${
        node.status === 'error' ? 'ring-2 ring-red-500 shadow-red-500/50 animate-shake' : ''
      }`}
      style={{ 
        left: node.x, 
        top: node.y,
        borderColor: nodeType.color + '80',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e, node.id);
      }}
    >
      {/* Input Port */}
      {nodeType.inputs && nodeType.inputs.length > 0 && nodeType.inputs[0].name !== 'none' && (
        <ConnectionPort 
          type="target"
          position="left"
          portData={nodeType.inputs[0]}
          isConnecting={isConnecting?.targetId === node.id}
          onMouseUp={(e) => {
            e.stopPropagation();
            onPortMouseUp(node.id);
          }}
        />
      )}

      {/* Output Port */}
      {nodeType.outputs && nodeType.outputs.length > 0 && (
        <ConnectionPort 
          type="source"
          position="right"
          portData={nodeType.outputs[0]}
          isConnecting={isConnecting?.sourceId === node.id}
          onMouseDown={(e) => {
            e.stopPropagation();
            onPortMouseDown(node.id);
          }}
        />
      )}

      {/* Status Indicator */}
      {node.status !== 'idle' && (
        <div className="absolute -top-1.5 -right-1.5 z-20">
          <div className={`w-4 h-4 rounded-full border-2 border-gray-900 ${
            node.status === 'running' ? 'bg-pink-500 animate-pulse shadow-lg shadow-pink-500/50' :
            node.status === 'success' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
            node.status === 'error' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
            'bg-gray-500'
          }`} />
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(node.id);
        }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-linear-to-br from-red-500 to-pink-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 shadow-lg"
      >
        <X size={12} />
      </button>

      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="p-2 rounded-lg shadow-lg"
            style={{ 
              backgroundColor: nodeType.color + '30',
              boxShadow: `0 0 20px ${nodeType.color}40`
            }}
          >
            <nodeType.icon size={16} style={{ color: nodeType.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-100 truncate">
              {nodeType.label}
            </div>
            <div className="text-[10px] text-purple-400 uppercase tracking-wide font-medium">
              {nodeType.description}
            </div>
          </div>
        </div>

        {/* Input/Output Labels */}
        <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-2 border-t border-purple-900/30 pt-2">
          <div>
            {nodeType.inputs && nodeType.inputs[0]?.type !== 'none' && (
              <div>IN: <span className="text-emerald-400 font-semibold">{nodeType.inputs[0]?.type}</span></div>
            )}
          </div>
          <div>
            {nodeType.outputs && nodeType.outputs.length > 0 && (
              <div>OUT: <span className="text-pink-400 font-semibold">{nodeType.outputs[0]?.type}</span></div>
            )}
          </div>
        </div>

        {/* Progress Bar for Running State */}
        {node.status === 'running' && (
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-linear-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg" style={{ width: '60%' }} />
          </div>
        )}
      </div>

      {/* Floating Log Message */}
      {recentLog && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap">
          <div className="px-3 py-1.5 rounded-lg bg-linear-to-r from-purple-900 to-pink-900 border border-pink-500/50 text-xs text-pink-100 shadow-xl shadow-pink-500/20">
            {recentLog.message}
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarSection = ({ title, items, onDragStart }) => (
  <div className="mb-4">
    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 px-2">
      {title}
    </div>
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => onDragStart(e, item.id)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-900/20 cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <div 
            className="p-1.5 rounded-md shadow-md"
            style={{ 
              backgroundColor: item.color + '30',
              boxShadow: `0 0 15px ${item.color}20`
            }}
          >
            <item.icon size={14} style={{ color: item.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-200 truncate font-medium">{item.label}</div>
            <div className="text-[10px] text-purple-500 font-mono">
              {item.inputs?.[0]?.type !== 'none' && `In: ${item.inputs?.[0]?.type || 'none'}`} • Out: {item.outputs?.[0]?.type || 'none'}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function AIWorkflowAutomation() {
  const [currentTemplate, setCurrentTemplate] = useState('free-play');
  const [nodes, setNodes] = useState(WORKFLOW_TEMPLATES['free-play'].nodes);
  const [edges, setEdges] = useState(WORKFLOW_TEMPLATES['free-play'].edges);
  const [logs, setLogs] = useState([]);
  const [simState, setSimState] = useState('idle');
  const [chaosMode, setChaosMode] = useState(false);
  
  // Interaction states
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [connectingDrag, setConnectingDrag] = useState(null); // { sourceId, startPos }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [activePackets, setActivePackets] = useState([]);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const cancelSimulation = useRef(false);

  // Load template
  const loadTemplate = (templateKey) => {
    const template = WORKFLOW_TEMPLATES[templateKey];
    if (template) {
      setCurrentTemplate(templateKey);
      setNodes(template.nodes.map(n => ({ ...n, status: 'idle' })));
      setEdges(template.edges);
      setLogs([]);
      setSimState('idle');
      setActivePackets([]);
      setConnectingDrag(null);
    }
  };

  // Helpers
  const getNodeCenter = (id) => {
    const n = nodes.find(node => node.id === id);
    if (!n) return { x: 0, y: 0 };
    return { x: n.x + 128, y: n.y + 40 };
  };

  const getClientOffset = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const addLog = (nodeId, message, type = 'info') => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      nodeId,
      message,
      type
    }]);
  };

  // Connection dragging logic
  const handlePortMouseDown = (nodeId) => {
    const center = getNodeCenter(nodeId);
    setConnectingDrag({ 
      sourceId: nodeId, 
      startPos: { x: center.x, y: center.y } 
    });
    addLog('system', 'Dragging connection to target input...', 'info');
  };

  const handlePortMouseUp = (nodeId) => {
    if (connectingDrag && connectingDrag.sourceId !== nodeId) {
      const exists = edges.find(e => e.source === connectingDrag.sourceId && e.target === nodeId);
      if (!exists) {
        setEdges(prev => [...prev, {
          id: `e-${Date.now()}`,
          source: connectingDrag.sourceId,
          target: nodeId
        }]);
        addLog('system', '✓ Neural link established via drag', 'success');
      } else {
        addLog('system', '⚠ Connection already exists', 'warning');
      }
    }
    setConnectingDrag(null);
  };

  // Event Handlers
  const handlePanStart = (e) => {
    if (e.target === e.currentTarget || e.target.tagName === 'svg') {
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY * 0.001;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
    } else {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleNodeDragStart = (e, id) => {
    if (e.button !== 0) return;
    const node = nodes.find(n => n.id === id);
    setDraggingId(id);
    const pos = getClientOffset(e);
    dragOffset.current = { x: pos.x - node.x, y: pos.y - node.y };
  };

  const handleMouseMove = (e) => {
    const pos = getClientOffset(e);
    setMousePos(pos);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      });
    } else if (draggingId) {
      setNodes(prev => prev.map(n => 
        n.id === draggingId 
          ? { ...n, x: pos.x - dragOffset.current.x, y: pos.y - dragOffset.current.y }
          : n
      ));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingId(null);
    setConnectingDrag(null);
  };

  const handleSidebarDragStart = (e, nodeTypeId) => {
    e.dataTransfer.setData('nodeType', nodeTypeId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const nodeTypeId = e.dataTransfer.getData('nodeType');
    
    if (nodeTypeId && NODE_TYPES[nodeTypeId]) {
      const pos = getClientOffset(e);
      const newNode = {
        id: `n-${Date.now()}`,
        type: nodeTypeId,
        x: pos.x - 128,
        y: pos.y - 40,
        status: 'idle'
      };
      setNodes(prev => [...prev, newNode]);
      addLog('system', `✓ Added ${NODE_TYPES[nodeTypeId].label}`, 'success');
    }
  };

  const handleDeleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    addLog('system', '✓ Node deleted', 'warning');
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
    addLog('system', '✓ Connection removed', 'warning');
  };

  // Simulation
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const movePacket = async (sourceId, targetId, duration = 800) => {
    const packetId = `packet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new Promise(resolve => {
      const startTime = performance.now();
      setActivePackets(prev => [...prev, { id: packetId, sourceId, targetId, progress: 0 }]);

      const animate = (time) => {
        if (cancelSimulation.current) {
          setActivePackets(prev => prev.filter(p => p.id !== packetId));
          resolve();
          return;
        }
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setActivePackets(prev => prev.map(p => p.id === packetId ? { ...p, progress } : p));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setActivePackets(prev => prev.filter(p => p.id !== packetId));
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  };

  const processNode = async (nodeId, depth = 0) => {
    if (depth > 20 || cancelSimulation.current) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'running' } : n));

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

    await sleep(800 + Math.random() * 400);
    
    if (!cancelSimulation.current) {
      if (chaosMode && Math.random() > 0.7) {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'error' } : n));
        addLog(nodeId, failureMessages[node.type] || '✗ Operation failed', 'error');
        await sleep(1500);
        addLog(nodeId, `🔧 Automatic recovery: System self-healed.`, 'info');
        await sleep(500);
        addLog(nodeId, `✓ Re-processing successful. Resuming workflow.`, 'success');
      } else {
        addLog(nodeId, successMessages[node.type] || '✓ Processing complete', 'success');
      }

      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'success' } : n));

      const outgoing = edges.filter(e => e.source === nodeId);
      await Promise.all(outgoing.map(async edge => {
        await movePacket(edge.source, edge.target);
        await processNode(edge.target, depth + 1);
      }));
    }
  };

  const runSimulation = async () => {
    if (simState === 'running') return;
    cancelSimulation.current = false;
    setSimState('running');
    setLogs([]);
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setActivePackets([]);
    const startNodes = nodes.filter(n => !edges.find(e => e.target === n.id));
    try {
      await Promise.all(startNodes.map(n => processNode(n.id)));
    } finally {
      if (!cancelSimulation.current) setSimState('idle');
    }
  };

  const stopSimulation = () => {
    cancelSimulation.current = true;
    setSimState('idle');
    setActivePackets([]);
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
  };

  const getEdgePath = (sourceId, targetId) => {
    const s = getNodeCenter(sourceId);
    const t = getNodeCenter(targetId);
    const dist = Math.abs(t.x - s.x);
    const controlOffset = Math.max(dist * 0.5, 50);
    return `M ${s.x} ${s.y} C ${s.x + controlOffset} ${s.y}, ${t.x - controlOffset} ${t.y}, ${t.x} ${t.y}`;
  };

  const getPacketPosition = (packet) => {
    const s = getNodeCenter(packet.sourceId);
    const t = getNodeCenter(packet.targetId);
    const dist = Math.abs(t.x - s.x);
    const controlOffset = Math.max(dist * 0.5, 50);
    const p0 = s, p3 = t;
    const p1 = { x: s.x + controlOffset, y: s.y };
    const p2 = { x: t.x - controlOffset, y: t.y };
    const tt = packet.progress;
    return {
      x: Math.pow(1-tt,3)*p0.x + 3*Math.pow(1-tt,2)*tt*p1.x + 3*(1-tt)*Math.pow(tt,2)*p2.x + Math.pow(tt,3)*p3.x,
      y: Math.pow(1-tt,3)*p0.y + 3*Math.pow(1-tt,2)*tt*p1.y + 3*(1-tt)*Math.pow(tt,2)*p2.y + Math.pow(tt,3)*p3.y
    };
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0118] text-gray-100 overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="h-14 bg-linear-to-r from-[#150528] to-[#1a0a2e] border-b border-purple-900/50 flex items-center justify-between px-4 z-20 shadow-xl shadow-purple-900/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-linear-to-br from-pink-600 to-purple-600 shadow-lg shadow-pink-500/30">
              <Zap className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Automation</span>
          </div>
          <div className="text-sm text-purple-400">Design your AI Agent logic.</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-purple-400">Current Task:</span>
            <select
              value={currentTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="bg-purple-950/50 border border-purple-700/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => (
                <option key={key} value={key}>{template.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-purple-500 italic">
            "{WORKFLOW_TEMPLATES[currentTemplate].description}"
          </div>

          <div className="h-6 w-px bg-purple-700/50" />

          <button
            onClick={() => setChaosMode(!chaosMode)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all shadow-lg ${
              chaosMode
                ? 'bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-orange-500/30 ring-2 ring-red-500'
                : 'bg-purple-950/50 border border-purple-700/50 hover:bg-purple-900/50 text-purple-300'
            }`}
          >
            <AlertTriangle size={16} />
            {chaosMode ? 'Chaos Mode ON' : 'Chaos Mode'}
          </button>

          <button onClick={() => loadTemplate(currentTemplate)} className="p-2 hover:bg-purple-900/30 rounded-lg transition-all">
            <RotateCcw size={16} className="text-purple-400" />
          </button>

          <button
            onClick={simState === 'running' ? stopSimulation : runSimulation}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all shadow-lg ${
              simState === 'running'
                ? 'bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-red-500/30'
                : 'bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-pink-500/30'
            }`}
          >
            {simState === 'running' ? <><Pause size={16} /> Stop</> : <><PlayIcon size={16} /> Run Agent</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-linear-to-b from-[#150528] to-[#0a0118] border-r border-purple-900/50 flex flex-col overflow-hidden shadow-xl shadow-purple-900/10">
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <SidebarSection title="INPUTS" items={NODE_CATEGORIES.INPUTS} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="MODELS" items={NODE_CATEGORIES.MODELS} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="TOOLS" items={NODE_CATEGORIES.TOOLS} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="MEMORY" items={NODE_CATEGORIES.MEMORY} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="OUTPUTS" items={NODE_CATEGORIES.OUTPUTS} onDragStart={handleSidebarDragStart} />
          </div>
          <div className="p-3 border-t border-purple-900/30 text-[10px] text-purple-400 space-y-1">
            <div className="flex items-center gap-2">
              <Circle size={6} className="text-pink-500" />
              <span>Drag from right port to left port to connect</span>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden"
            onMouseDown={handlePanStart}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* Dot Grid Background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
              <defs>
                <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse" x={pan.x % 30} y={pan.y % 30}>
                  <circle cx="1" cy="1" r="1" fill="#a855f7" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dotGrid)" />
            </svg>

            {/* Canvas Content */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'top-left'
              }}
            >
              {/* Edges */}
              <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-auto">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <polygon points="0 0, 10 5, 0 10" fill="#ec4899" />
                  </marker>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {edges.map(edge => {
                  const path = getEdgePath(edge.source, edge.target);
                  const isHovered = hoveredEdge === edge.id;
                  return (
                    <g key={edge.id} onMouseEnter={() => setHoveredEdge(edge.id)} onMouseLeave={() => setHoveredEdge(null)} onClick={() => handleDeleteEdge(edge.id)} className="cursor-pointer group">
                      <path d={path} stroke="transparent" strokeWidth="20" fill="none" />
                      <path d={path} stroke={isHovered ? '#ec4899' : '#9333ea'} strokeWidth={isHovered ? '3' : '2'} fill="none" markerEnd="url(#arrowhead)" className="transition-all" filter={isHovered ? "url(#glow)" : "none"} />
                    </g>
                  );
                })}

                {/* Drag Connection Preview */}
                {connectingDrag && (
                  <path 
                    d={`M ${connectingDrag.startPos.x} ${connectingDrag.startPos.y} C ${connectingDrag.startPos.x + 50} ${connectingDrag.startPos.y}, ${mousePos.x - 50} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`} 
                    stroke="#ec4899" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                    fill="none" 
                    markerEnd="url(#arrowhead)"
                  />
                )}

                {activePackets.map(packet => {
                  const pos = getPacketPosition(packet);
                  return (
                    <g key={packet.id}>
                      <circle cx={pos.x} cy={pos.y} r="6" fill="#ec4899" className="animate-pulse" filter="url(#glow)" />
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
                {nodes.map(node => (
                  <WorkflowNode
                    key={node.id}
                    node={node}
                    nodeType={NODE_TYPES[node.type]}
                    isDragging={draggingId === node.id}
                    onMouseDown={handleNodeDragStart}
                    onDelete={handleDeleteNode}
                    onPortMouseDown={handlePortMouseDown}
                    onPortMouseUp={handlePortMouseUp}
                    logs={logs}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Console */}
          <div className="h-40 bg-linear-to-b from-[#150528] to-[#0a0118] border-t border-purple-900/50 flex flex-col shadow-xl shadow-purple-900/10">
            <div className="h-8 border-b border-purple-900/30 flex items-center px-4 justify-between">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">System Console</span>
              <button onClick={() => setLogs([])} className="text-xs text-purple-500 hover:text-pink-400 transition-colors">Clear</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 scrollbar-thin">
              {logs.map(log => (
                <div key={log.id} className={`flex gap-2 transition-colors ${log.type === 'suggestion' ? 'bg-amber-950/30 border-l-2 border-amber-500 pl-2 py-1' : ''}`}>
                  <span className="text-purple-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={log.type === 'error' ? 'text-red-400 font-semibold' : log.type === 'success' ? 'text-emerald-400' : log.type === 'info' ? 'text-blue-400 font-medium' : 'text-purple-300'}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}
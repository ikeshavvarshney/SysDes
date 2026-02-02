"use client";

import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import IntroCarousel from '@/components/IntroCarousel';
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
  X,
  Save,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  LogOut
} from 'lucide-react';

// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE_URL = 'http://localhost:5001/api';

// ==========================================
// API HELPER FUNCTIONS
// ==========================================

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const isAuthenticated = () => {
  return !!getAuthToken();
};

const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// ✅ IMPROVED: Better error handling with detailed logging
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();

  try {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    console.log('🔵 API Call:', `${API_BASE_URL}${endpoint}`, config);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    console.log('🔵 API Response Status:', response.status);

    // Handle 401 without redirect
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        console.error('🔴 API Error Response:', errorData);
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        console.error('🔴 API Error (no JSON):', errorMessage);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('🔴 API Error:', error);
    throw error;
  }
};

// ==========================================
// WORKFLOW API METHODS
// ==========================================

const workflowAPI = {
  create: (data) => apiCall('/workflows/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getAll: () => apiCall('/workflows'),

  getById: (id) => apiCall(`/workflows/${id}`),

  update: (id, data) => apiCall(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiCall(`/workflows/${id}`, {
    method: 'DELETE',
  }),

  execute: (id, chaosMode) => apiCall(`/workflows/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify({ chaosMode }),
  }),

  getHistory: (id) => apiCall(`/workflows/${id}/history`),
};

// ==========================================
// WORKFLOW TEMPLATES
// ==========================================

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

// ==========================================
// NODE TYPE DEFINITIONS
// ==========================================

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
const toolSlides = [
  {
    title: "Web Search",
    description:
      "Fetches real-time or external information beyond the model’s training data. Used when answers require freshness, verification, or public knowledge lookup.",
  },
  {
    title: "Python Interpreter",
    description:
      "Executes code for calculations, data analysis, and logic-heavy tasks. Ensures deterministic outputs where pure language reasoning is unreliable.",
  },
  {
    title: "LLM (GPT-4)",
    description:
      "Core language model responsible for understanding input and generating responses. Handles reasoning, synthesis, and natural language generation but relies on external tools and memory for grounding.",
  },
  {
    title: "ReAct Agent",
    description:
      "Combines reasoning and action in an iterative loop. Decides when to think, when to call tools, and how to integrate results back into the reasoning process.",
  },
  {
    title: "Planner / Router",
    description:
      "Acts as a decision-making layer that routes requests to the correct model or tool. Breaks complex tasks into steps and determines execution order.",
  },
];
const inputOutputSlides = [
  {
    title: "User Prompt",
    description:
      "Primary entry point where the user expresses intent. Drives the entire execution flow of the system.",
  },
  {
    title: "System Instructions",
    description:
      "Defines global behavior, constraints, and tone. Overrides user intent when safety, policy, or structure must be enforced.",
  },
  {
    title: "Document Input",
    description:
      "Allows users to inject external files into the system. Commonly used as source material for retrieval, analysis, or summarization.",
  },
  {
    title: "Chat Interface",
    description:
      "Final presentation layer where responses are delivered to the user. Reflects the combined output of models, tools, and memory.",
  },
];


const NODE_TYPES = Object.values(NODE_CATEGORIES).flat().reduce((acc, node) => {
  acc[node.id] = node;
  return acc;
}, {});

// ==========================================
// TOAST NOTIFICATION COMPONENT
// ==========================================

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Activity size={18} />
  };

  const colors = {
    success: 'from-emerald-600 to-green-600',
    error: 'from-red-600 to-pink-600',
    warning: 'from-orange-600 to-yellow-600',
    info: 'from-blue-600 to-cyan-600'
  };

  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r ${colors[type]} text-white shadow-2xl animate-slide-in`}>
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
};

// ==========================================
// LOGIN MODAL COMPONENT
// ==========================================

const LoginModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] border-2 border-red-500 rounded-xl p-8 w-[400px] shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle size={32} className="text-red-400" />
          <h3 className="text-xl font-bold text-red-400">Session Expired</h3>
        </div>

        <p className="text-gray-300 mb-6">
          Your session has expired. Please log in again to continue.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => {
              window.location.href = '/auth';
            }}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition-all"
          >
            Go to Login
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg font-medium border border-purple-700 text-purple-300 hover:bg-purple-900/30 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CONNECTION PORT COMPONENT
// ==========================================

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
        className={`w-3.5 h-3.5 rounded-full border-2 cursor-crosshair transition-all ${isInput
            ? `bg-gray-900 border-purple-500 hover:border-pink-400 hover:scale-125 ${isConnecting ? 'ring-2 ring-pink-500 scale-125 animate-pulse' : ''}`
            : 'bg-gradient-to-br from-pink-500 to-purple-500 border-pink-300 hover:scale-125 shadow-lg shadow-pink-500/50'
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

// ==========================================
// WORKFLOW NODE COMPONENT
// ==========================================

const WorkflowNode = ({ node, nodeType, isDragging, onMouseDown, onDelete, onPortMouseDown, onPortMouseUp, isConnecting, logs }) => {
  if (!nodeType) return null;

  const recentLog = logs.find(l => l.nodeId === node.id && Date.now() - l.timestamp < 3000);

  return (
    <div
      className={`absolute w-64 rounded-xl border-2 bg-gradient-to-br from-purple-950/90 via-gray-900/90 to-pink-950/90 backdrop-blur-sm transition-all duration-200 group ${isDragging ? 'cursor-grabbing scale-105 z-50 shadow-2xl shadow-purple-500/30' : 'cursor-grab hover:shadow-xl hover:shadow-purple-500/20'
        } ${node.status === 'running' ? 'ring-2 ring-pink-500 shadow-pink-500/50 scale-105' : ''} ${node.status === 'error' ? 'ring-2 ring-red-500 shadow-red-500/50 animate-shake' : ''
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
          <div className={`w-4 h-4 rounded-full border-2 border-gray-900 ${node.status === 'running' ? 'bg-pink-500 animate-pulse shadow-lg shadow-pink-500/50' :
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
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 shadow-lg"
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
            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg" style={{ width: '60%' }} />
          </div>
        )}
      </div>

      {/* Floating Log Message */}
      {recentLog && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap">
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900 to-pink-900 border border-pink-500/50 text-xs text-pink-100 shadow-xl shadow-pink-500/20">
            {recentLog.message}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SIDEBAR SECTION COMPONENT
// ==========================================

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

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AIWorkflowAutomation() {
  // Workflow State
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [currentTemplate, setCurrentTemplate] = useState('free-play');
  const [nodes, setNodes] = useState(WORKFLOW_TEMPLATES['free-play'].nodes);
  const [edges, setEdges] = useState(WORKFLOW_TEMPLATES['free-play'].edges);
  const [logs, setLogs] = useState([]);
  const [simState, setSimState] = useState('idle');
  const [chaosMode, setChaosMode] = useState(false);

  // Backend State
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  // Auth UI State
  const [showLoginModal, setShowLoginModal] = useState(false);

  // UI State
  const [toast, setToast] = useState(null);

  // Interaction states
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [connectingDrag, setConnectingDrag] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [activePackets, setActivePackets] = useState([]);

  const dragOffset = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const cancelSimulation = useRef(false);

  // ==========================================
  // TOAST HELPER
  // ==========================================

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // ==========================================
  // AUTH ERROR HANDLER
  // ==========================================

  const handleAuthError = (error) => {
    if (error.message === 'UNAUTHORIZED') {
      logout();
      setShowLoginModal(true);
      showToast('Session expired. Please login again.', 'error');
      return true;
    }
    return false;
  };

  // ==========================================
  // ✅ CLIENT-SIDE SIMULATION (No backend needed)
  // ==========================================

  const runClientSideSimulation = async () => {
    if (simState === 'running') return;

    cancelSimulation.current = false;
    setSimState('running');
    setLogs([]);
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setActivePackets([]);

    try {
      addLog('system', '🚀 Running local simulation...', 'info');

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

      // Find entry nodes
      const entryNodes = nodes.filter(node =>
        !edges.some(edge => edge.target === node.id)
      );

      // Simulate execution
      for (const node of entryNodes) {
        await processNodeSimulation(node.id, successMessages, failureMessages);
      }

      if (!cancelSimulation.current) {
        addLog('system', '✅ Simulation completed successfully!', 'success');
        showToast('Simulation completed!', 'success');
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      addLog('system', `✗ Simulation failed: ${error.message}`, 'error');
      showToast(`Simulation failed: ${error.message}`, 'error');
    } finally {
      if (!cancelSimulation.current) setSimState('idle');
    }
  };

  const processNodeSimulation = async (nodeId, successMessages, failureMessages) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    await sleep(300);
    if (cancelSimulation.current) return;

    // Set running
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, status: 'running' } : n
    ));

    await sleep(500);
    if (cancelSimulation.current) return;

    // Chaos mode: 30% chance of failure
    if (chaosMode && Math.random() > 0.7) {
      setNodes(prev => prev.map(n =>
        n.id === nodeId ? { ...n, status: 'error' } : n
      ));
      addLog(nodeId, failureMessages[node.type] || '✗ Operation failed', 'error');

      await sleep(500);
      addLog(nodeId, '🔧 Automatic recovery: System self-healed.', 'info');
      setNodes(prev => prev.map(n =>
        n.id === nodeId ? { ...n, status: 'success' } : n
      ));
    } else {
      setNodes(prev => prev.map(n =>
        n.id === nodeId ? { ...n, status: 'success' } : n
      ));
      addLog(nodeId, successMessages[node.type] || '✓ Processing complete', 'success');
    }

    // Process connected nodes
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      if (cancelSimulation.current) break;
      await processNodeSimulation(edge.target, successMessages, failureMessages);
    }
  };

  // ==========================================
  // BACKEND INTEGRATION - SAVE/LOAD
  // ==========================================

  const saveWorkflow = async () => {
    setIsSaving(true);
    try {
      // ✅ FIX: Ensure nodes and edges are proper arrays, not strings
      const cleanNodes = nodes.map(n => ({
        id: String(n.id),
        type: String(n.type),
        x: Number(n.x) || 0,
        y: Number(n.y) || 0,
        status: 'idle'
      }));

      const cleanEdges = edges.map(e => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target)
      }));

      const workflowData = {
        name: workflowName || 'Untitled Workflow',
        nodes: cleanNodes,
        edges: cleanEdges,
        template: currentTemplate || 'free-play'
      };

      console.log('💾 Saving workflow:', workflowData);
      console.log('📊 Nodes type:', typeof cleanNodes, 'Length:', cleanNodes.length);
      console.log('📊 Edges type:', typeof cleanEdges, 'Length:', cleanEdges.length);

      if (currentWorkflowId) {
        const result = await workflowAPI.update(currentWorkflowId, workflowData);
        console.log('✅ Update result:', result);
        addLog('system', `✓ Workflow "${workflowName}" updated successfully`, 'success');
        showToast(`Workflow saved!`, 'success');
      } else {
        const result = await workflowAPI.create(workflowData);
        console.log('✅ Create result:', result);
        setCurrentWorkflowId(result._id);
        addLog('system', `✓ Workflow "${workflowName}" created successfully`, 'success');
        showToast(`Workflow created!`, 'success');
      }
    } catch (error) {
      console.error('💥 Save failed:', error);

      if (handleAuthError(error)) return;

      // Show detailed error
      const errorMsg = error.message || 'Unknown error';
      addLog('system', `✗ Save failed: ${errorMsg}`, 'error');
      showToast(`Save failed: ${errorMsg}`, 'error');

      // Show helpful message if backend is down
      if (errorMsg.includes('fetch') || errorMsg.includes('Network')) {
        showToast('Backend server may be offline. Check console for details.', 'warning');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedWorkflows = async () => {
    setIsLoading(true);
    try {
      const workflows = await workflowAPI.getAll();
      setSavedWorkflows(workflows);
      setShowLoadMenu(true);
      if (workflows.length === 0) {
        showToast('No saved workflows found', 'info');
      }
    } catch (error) {
      console.error('Load failed:', error);

      if (handleAuthError(error)) return;

      const errorMsg = error.message || 'Unknown error';
      addLog('system', `✗ Failed to load workflows: ${errorMsg}`, 'error');
      showToast(`Load failed: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflow = async (workflowId) => {
    setIsLoading(true);
    try {
      const workflow = await workflowAPI.getById(workflowId);
      setCurrentWorkflowId(workflow._id);
      setWorkflowName(workflow.name);
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
      setCurrentTemplate(workflow.template || 'free-play');
      setShowLoadMenu(false);
      addLog('system', `✓ Loaded workflow: ${workflow.name}`, 'success');
      showToast(`Loaded: ${workflow.name}`, 'success');
    } catch (error) {
      console.error('Load failed:', error);

      if (handleAuthError(error)) return;

      addLog('system', `✗ Failed to load workflow: ${error.message}`, 'error');
      showToast(`Failed to load: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkflow = async (workflowId) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await workflowAPI.delete(workflowId);
      setSavedWorkflows(prev => prev.filter(w => w._id !== workflowId));
      showToast('Workflow deleted', 'success');

      if (currentWorkflowId === workflowId) {
        loadTemplate('free-play');
        setCurrentWorkflowId(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);

      if (handleAuthError(error)) return;

      showToast(`Delete failed: ${error.message}`, 'error');
    }
  };

  // ==========================================
  // STOP SIMULATION
  // ==========================================

  const stopSimulation = () => {
    cancelSimulation.current = true;
    setSimState('idle');
    setActivePackets([]);
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    showToast('Simulation stopped', 'warning');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // ==========================================
  // TEMPLATE LOADING
  // ==========================================

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
      setCurrentWorkflowId(null);
      setWorkflowName(template.name);
      showToast(`Loaded template: ${template.name}`, 'info');
    }
  };

  // ==========================================
  // LOGOUT HANDLER
  // ==========================================

  const handleLogout = () => {
    logout();
    setShowLoginModal(true);
    showToast('Logged out successfully', 'info');
  };

  // ==========================================
  // CANVAS HELPERS
  // ==========================================

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

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handlePortMouseDown = (nodeId) => {
    const center = getNodeCenter(nodeId);
    setConnectingDrag({
      sourceId: nodeId,
      startPos: { x: center.x, y: center.y }
    });
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
        addLog('system', '✓ Neural link established', 'success');
      }
    }
    setConnectingDrag(null);
  };

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
      x: Math.pow(1 - tt, 3) * p0.x + 3 * Math.pow(1 - tt, 2) * tt * p1.x + 3 * (1 - tt) * Math.pow(tt, 2) * p2.x + Math.pow(tt, 3) * p3.x,
      y: Math.pow(1 - tt, 3) * p0.y + 3 * Math.pow(1 - tt, 2) * tt * p1.y + 3 * (1 - tt) * Math.pow(tt, 2) * p2.y + Math.pow(tt, 3) * p3.y
    };
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0118] text-gray-100 overflow-hidden font-sans">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      <Navbar py={2} />
      {/* Top Bar */}
      <div className="h-14 bg-gradient-to-r from-[#150528] to-[#1a0a2e] border-b border-purple-900/50 flex items-center justify-between px-4 z-20 shadow-xl shadow-purple-900/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-600 to-purple-600 shadow-lg shadow-pink-500/30">
              <Zap className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text ">Automation</span>
          </div>

          {/* Workflow Name Input */}
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-purple-950/50 border border-purple-700/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 w-48"
            placeholder="Workflow name..."
          />

          {/* Workflow Status Indicator */}
          {currentWorkflowId && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-900/30 border border-emerald-600/50">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Saved</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Template Selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-purple-400">Template:</span>
            <select
              value={currentTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="bg-purple-950/50 border border-purple-700/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
            >
              {Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => (
                <option key={key} value={key}>{template.name}</option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-purple-700/50" />

          {/* Save/Load Buttons */}
          <button
            onClick={saveWorkflow}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={loadSavedWorkflows}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <FolderOpen size={16} />}
            Load
          </button>

          <div className="h-6 w-px bg-purple-700/50" />

          {/* Chaos Mode */}
          <button
            onClick={() => setChaosMode(!chaosMode)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all shadow-lg ${chaosMode
                ? 'bg-gradient-to-r from-orange-600 to-red-600 ring-2 ring-red-500'
                : 'bg-purple-950/50 border border-purple-700/50 text-purple-300 hover:bg-purple-900/50'
              }`}
          >
            <AlertTriangle size={16} />
            {chaosMode ? 'Chaos ON' : 'Chaos Mode'}
          </button>

          {/* ✅ FIXED: Run button now works without saving */}
          <button
            onClick={simState === 'running' ? stopSimulation : runClientSideSimulation}
            disabled={nodes.length === 0}
            title={nodes.length === 0 ? 'Add nodes first' : 'Run simulation (client-side)'}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${simState === 'running'
                ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500'
              }`}
          >
            {simState === 'running' ? (
              <>
                <Pause size={16} /> Stop
              </>
            ) : (
              <>
                <PlayIcon size={16} /> Run
              </>
            )}
          </button>

          <div className="h-6 w-px bg-purple-700/50" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all text-gray-400 hover:text-red-400 hover:bg-red-900/20"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Load Menu Modal */}
      {showLoadMenu && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setShowLoadMenu(false)}>
          <div className="bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] border-2 border-purple-700 rounded-xl p-6 w-[500px] max-h-[600px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-pink-400">Load Workflow</h3>
              <button onClick={() => setShowLoadMenu(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {savedWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen size={48} className="mx-auto mb-4 text-purple-600" />
                <p className="text-purple-400 text-sm">No saved workflows found.</p>
                <p className="text-gray-500 text-xs mt-2">Create and save a workflow to see it here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {savedWorkflows.map(workflow => (
                  <div
                    key={workflow._id}
                    className="p-4 rounded-lg bg-purple-950/50 hover:bg-purple-900/50 border border-purple-700/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => loadWorkflow(workflow._id)}>
                        <div className="font-semibold text-white mb-1">{workflow.name}</div>
                        <div className="text-xs text-purple-400">
                          {workflow.nodes?.length || 0} nodes • {workflow.edges?.length || 0} connections
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkflow(workflow._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-600/20 text-red-400 transition-all"
                        title="Delete workflow"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-[#150528] to-[#0a0118] border-r border-purple-900/50 flex flex-col overflow-hidden shadow-xl">
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <SidebarSection title="INPUTS" items={NODE_CATEGORIES.INPUTS} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="MODELS" items={NODE_CATEGORIES.MODELS} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="TOOLS" items={NODE_CATEGORIES.TOOLS} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="MEMORY" items={NODE_CATEGORIES.MEMORY} onDragStart={handleSidebarDragStart} />
            <SidebarSection title="OUTPUTS" items={NODE_CATEGORIES.OUTPUTS} onDragStart={handleSidebarDragStart} />
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-purple-900/30 space-y-2">
            <div className="text-[10px] text-purple-400">
              <div className="flex items-center justify-between mb-1">
                <span>Status:</span>
                {currentWorkflowId ? (
                  <span className="text-emerald-400 font-semibold">✓ Saved</span>
                ) : (
                  <span className="text-yellow-400 font-semibold">⚠ Unsaved</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Nodes:</span>
                <span className="text-pink-400 font-semibold">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Connections:</span>
                <span className="text-pink-400 font-semibold">{edges.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden cursor-move"
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
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {edges.map(edge => {
                  const path = getEdgePath(edge.source, edge.target);
                  const isHovered = hoveredEdge === edge.id;
                  return (
                    <g key={edge.id} onMouseEnter={() => setHoveredEdge(edge.id)} onMouseLeave={() => setHoveredEdge(null)} onClick={() => handleDeleteEdge(edge.id)} className="cursor-pointer">
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
                    isConnecting={connectingDrag}
                    logs={logs}
                  />
                ))}
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-purple-950/90 border border-purple-700/50 rounded-lg p-2 backdrop-blur-sm">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
                className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded text-sm transition-all"
              >
                +
              </button>
              <div className="text-xs text-center text-purple-400">{Math.round(zoom * 100)}%</div>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded text-sm transition-all"
              >
                -
              </button>
            </div>
          </div>

          <Chatbot></Chatbot>
          <IntroCarousel
            storageKey="automation_sim_intro_seen1"
            heading="Different Tools for Automation"
            slides={toolSlides}
          />
          <IntroCarousel
            storageKey="automation_sim_intro_seen2"
            heading="Different Tools for Input/Output"
            slides={inputOutputSlides}
          />
          {/* Console */}
          <div className="h-40 bg-gradient-to-b from-[#150528] to-[#0a0118] border-t border-purple-900/50 flex flex-col shadow-xl">
            <div className="h-8 border-b border-purple-900/30 flex items-center px-4 justify-between">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">System Console</span>
              <button onClick={() => setLogs([])} className="text-xs text-purple-500 hover:text-pink-400 transition-colors">
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-purple-600 italic">Waiting for activity...</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex gap-2 items-start">
                    <span className="text-purple-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`${log.type === 'error' ? 'text-red-400 font-semibold' :
                        log.type === 'success' ? 'text-emerald-400' :
                          log.type === 'info' ? 'text-blue-400' :
                            log.type === 'warning' ? 'text-yellow-400' :
                              'text-purple-300'
                      }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
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
        
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
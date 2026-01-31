"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Brain, Database, FileText, User, 
  Settings, Play, CheckCircle, XCircle, ArrowRight, 
  Trash2, RotateCcw, AlertCircle, HelpCircle,
  Globe, Code, MessageSquare, Bot, BrainCircuit,
  History, Search
} from 'lucide-react';

// --- Configuration ---

const NODE_TYPES = {
  // Inputs
  'IN_USER': { label: 'User Prompt', type: 'source', category: 'inputs', icon: User, color: 'text-blue-400', bg: 'bg-blue-900/50', output: 'text' },
  'IN_DOC': { label: 'Knowledge Base (PDF)', type: 'source', category: 'inputs', icon: FileText, color: 'text-gray-400', bg: 'bg-slate-800', output: 'doc' },
  'IN_SYS': { label: 'System Instructions', type: 'source', category: 'inputs', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-800', output: 'text' },

  // Models / Agents
  'LLM_GPT': { label: 'LLM (GPT-4)', type: 'process', category: 'models', icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-900/50', input: 'text', output: 'text' },
  'AGENT_REACT': { label: 'ReAct Agent', type: 'process', category: 'models', icon: BrainCircuit, color: 'text-indigo-400', bg: 'bg-indigo-900/50', input: 'text', output: 'text' },
  'AGENT_PLAN': { label: 'Planner / Router', type: 'process', category: 'models', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-900/50', input: 'text', output: 'text' },

  // Memory / Data
  'MEM_CHAT': { label: 'Chat History', type: 'process', category: 'memory', icon: History, color: 'text-pink-400', bg: 'bg-pink-900/50', input: 'text', output: 'text' },
  'DB_VECTOR': { label: 'Vector Store (RAG)', type: 'process', category: 'memory', icon: Database, color: 'text-yellow-400', bg: 'bg-yellow-900/50', input: 'doc', output: 'text' },

  // Tools
  'TOOL_WEB': { label: 'Web Search', type: 'process', category: 'tools', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-900/50', input: 'text', output: 'text' },
  'TOOL_CODE': { label: 'Python Interpreter', type: 'process', category: 'tools', icon: Code, color: 'text-orange-400', bg: 'bg-orange-900/50', input: 'text', output: 'text' },

  // Outputs
  'OUT_UI': { label: 'Chat Interface', type: 'sink', category: 'outputs', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-900/50', input: 'text' },
};

const CHALLENGES = [
  { 
    id: 1, 
    title: 'Free Play', 
    desc: 'Experiment with different agent architectures.', 
    validate: () => true 
  },
  { 
    id: 2, 
    title: 'Simple Chatbot', 
    desc: 'Connect a User Prompt to an LLM, then to the Chat Interface.', 
    requiredNodes: ['IN_USER', 'LLM_GPT', 'OUT_UI']
  },
  { 
    id: 3, 
    title: 'RAG Pipeline', 
    desc: 'Build a Retrieval-Augmented Generation flow. Connect Documents to a Vector Store, then feed that context into an Agent along with the User Prompt.', 
    requiredNodes: ['IN_DOC', 'DB_VECTOR', 'IN_USER', 'AGENT_REACT', 'OUT_UI']
  },
  {
    id: 4,
    title: 'Tool-Using Agent',
    desc: 'Create an agent that can search the web and run code. Connect the ReAct Agent to both Web Search and Python tools.',
    requiredNodes: ['IN_USER', 'AGENT_REACT', 'TOOL_WEB', 'TOOL_CODE', 'OUT_UI']
  }
];

export default function AIWorkflowBuilder() {
  // --- State ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [packets, setPackets] = useState([]);
  const [validationMsg, setValidationMsg] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(CHALLENGES[0]);
  
  // Interaction State
  const [connectStart, setConnectStart] = useState(null); // Node ID we are dragging FROM
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState({ isDragging: false, nodeId: null, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  
  const canvasRef = useRef(null);
  const animationRef = useRef();

  // --- Animation Loop ---
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animatePackets);
    } else {
      setPackets([]);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning, edges]);

  const animatePackets = () => {
    setPackets(prev => {
        const nextPackets = [];
        
        // Spawn new packets from Source nodes
        if (Math.random() > 0.95) {
            nodes.filter(n => NODE_TYPES[n.type].category === 'inputs').forEach(source => {
                // Find edges from this source
                edges.filter(e => e.from === source.id).forEach(edge => {
                    nextPackets.push({
                        id: Math.random(),
                        edgeId: edge.id,
                        from: edge.from,
                        to: edge.to,
                        progress: 0,
                        speed: 0.02
                    });
                });
            });
        }

        // Move existing packets
        prev.forEach(p => {
            p.progress += p.speed;
            if (p.progress < 1) {
                nextPackets.push(p);
            } else {
                // Packet arrived at destination, spawn next step if exists
                const nextEdges = edges.filter(e => e.from === p.to);
                nextEdges.forEach(nextEdge => {
                     nextPackets.push({
                        id: Math.random(),
                        edgeId: nextEdge.id,
                        from: nextEdge.from,
                        to: nextEdge.to,
                        progress: 0,
                        speed: 0.02
                    });
                });
            }
        });
        
        return nextPackets;
    });
    animationRef.current = requestAnimationFrame(animatePackets);
  };

  // --- Actions ---

  const addNode = (type) => {
    const id = Date.now().toString();
    setNodes(prev => [...prev, {
      id,
      type,
      x: 300 + Math.random() * 100,
      y: 200 + Math.random() * 100,
    }]);
    setValidationMsg(null);
  };

  const deleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setSelectedNode(null);
    setIsRunning(false);
  };

  // --- Connection Logic ---

  const handleNodeMouseDown = (e, id) => {
      // If clicking the connector handle (right side), start connecting
      if (e.shiftKey) {
          e.stopPropagation();
          setConnectStart(id);
      } else {
          // Dragging
          e.stopPropagation();
          const node = nodes.find(n => n.id === id);
          setDragState({
              isDragging: true,
              nodeId: id,
              startX: e.clientX,
              startY: e.clientY,
              initialX: node.x,
              initialY: node.y
          });
          setSelectedNode(id);
      }
  };

  const handleNodeMouseUp = (e, targetId) => {
      if (connectStart && connectStart !== targetId) {
          tryConnect(connectStart, targetId);
      }
      setConnectStart(null);
  };

  const tryConnect = (sourceId, targetId) => {
      const sourceNode = nodes.find(n => n.id === sourceId);
      const targetNode = nodes.find(n => n.id === targetId);
      const sourceConf = NODE_TYPES[sourceNode.type];
      const targetConf = NODE_TYPES[targetNode.type];

      // Validation Rule 1: Output Type must match Input Type
      // Special Case: Agents can take 'text' from User OR 'text' from Vector DB (context)
      if (sourceConf.output !== targetConf.input) {
          setValidationMsg({ type: 'error', text: `Type Mismatch: Cannot connect ${sourceConf.output} to ${targetConf.input}` });
          return;
      }

      // Validation Rule 2: No duplicates
      if (edges.some(e => e.from === sourceId && e.to === targetId)) return;

      setEdges(prev => [...prev, { id: `${sourceId}-${targetId}`, from: sourceId, to: targetId }]);
      setValidationMsg({ type: 'success', text: 'Connection valid!' });
  };

  const validatePipeline = () => {
      // Check if current challenge is met
      if (currentChallenge.id === 1) {
          // Free play just needs a valid flow
          if (edges.length > 0) {
              setIsRunning(true);
              setValidationMsg({ type: 'success', text: 'Agent active...' });
          } else {
              setValidationMsg({ type: 'error', text: 'Workflow is empty.' });
          }
          return;
      }

      // Check Specific Challenges
      const currentTypes = nodes.map(n => n.type);
      const missing = currentChallenge.requiredNodes.filter(req => !currentTypes.includes(req));
      
      if (missing.length > 0) {
          setValidationMsg({ type: 'error', text: `Missing components: ${missing.map(m => NODE_TYPES[m].label).join(', ')}` });
          setIsRunning(false);
          return;
      }

      // Check connectivity (Simplified: do edges exist?)
      const hasConnections = edges.length >= currentChallenge.requiredNodes.length - 1;

      if (hasConnections) {
          setIsRunning(true);
          setValidationMsg({ type: 'success', text: `Success! ${currentChallenge.title} complete.` });
      } else {
          setValidationMsg({ type: 'error', text: 'Components present but not fully connected.' });
      }
  };

  const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      if (dragState.isDragging) {
          const dx = e.clientX - dragState.startX;
          const dy = e.clientY - dragState.startY;
          setNodes(prev => prev.map(n => 
              n.id === dragState.nodeId 
              ? { ...n, x: dragState.initialX + dx, y: dragState.initialY + dy }
              : n
          ));
      }
  };

  const handleMouseUp = () => {
      setDragState({ isDragging: false, nodeId: null, startX: 0, startY: 0, initialX: 0, initialY: 0 });
      setConnectStart(null);
  };

  const clearCanvas = () => {
      setNodes([]);
      setEdges([]);
      setIsRunning(false);
      setValidationMsg(null);
  };

  return (
    <div 
        className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
    >
      
      {/* --- Sidebar (Toolbox) --- */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-20">
        <div className="p-4 border-b border-slate-800">
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" /> Agent Lab
            </h1>
            <p className="text-xs text-slate-500 mt-1">Design your AI Agent logic.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {['inputs', 'models', 'tools', 'memory', 'outputs'].map(cat => (
                <div key={cat}>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{cat}</h3>
                    <div className="space-y-2">
                        {Object.entries(NODE_TYPES).filter(([_, conf]) => conf.category === cat).map(([type, conf]) => (
                            <button
                                key={type}
                                onClick={() => addNode(type)}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all group text-left`}
                            >
                                <div className={`p-1.5 rounded ${conf.bg}`}>
                                    <conf.icon className={`w-4 h-4 ${conf.color}`} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-300 group-hover:text-white">{conf.label}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                        {conf.input && `In: ${conf.input} • `}Out: {conf.output}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- Main Canvas Area --- */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]" ref={canvasRef}>
         
         {/* Top Bar */}
         <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 z-10">
             
             {/* Challenge Selector */}
             <div className="flex items-center gap-4">
                 <div className="text-sm font-bold text-slate-400">Current Task:</div>
                 <select 
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentChallenge.id}
                    onChange={(e) => {
                        setCurrentChallenge(CHALLENGES.find(c => c.id === parseInt(e.target.value)));
                        setValidationMsg(null);
                        setIsRunning(false);
                    }}
                 >
                     {CHALLENGES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                 </select>
                 <div className="text-xs text-slate-500 italic max-w-md hidden lg:block">
                     "{currentChallenge.desc}"
                 </div>
             </div>

             {/* Controls */}
             <div className="flex items-center gap-3">
                 <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors" title="Clear Canvas">
                     <Trash2 className="w-5 h-5" />
                 </button>
                 <button 
                    onClick={validatePipeline}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isRunning ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                 >
                     {isRunning ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                     {isRunning ? 'Restart' : 'Run Agent'}
                 </button>
             </div>
         </div>

         {/* Validation Message Toast */}
         {validationMsg && (
             <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${validationMsg.type === 'error' ? 'bg-red-900/90 border border-red-500 text-white' : 'bg-emerald-900/90 border border-emerald-500 text-white'}`}>
                 {validationMsg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                 <span className="text-sm font-medium">{validationMsg.text}</span>
                 <button onClick={() => setValidationMsg(null)} className="ml-2 hover:opacity-70"><XCircle className="w-4 h-4" /></button>
             </div>
         )}

         {/* Canvas Content */}
         <div className="flex-1 relative overflow-hidden">
             
             {/* Edges & Packets */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                 <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                 </defs>
                 
                 {/* Dragging Line */}
                 {connectStart && (
                     <line 
                        x1={nodes.find(n => n.id === connectStart).x + 120} 
                        y1={nodes.find(n => n.id === connectStart).y + 32}
                        x2={mousePos.x - 256} // Offset for sidebar width roughly
                        y2={mousePos.y - 64} // Offset for header height
                        stroke="#94a3b8" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" 
                    />
                 )}

                 {/* Existing Edges */}
                 {edges.map(edge => {
                     const start = nodes.find(n => n.id === edge.from);
                     const end = nodes.find(n => n.id === edge.to);
                     if (!start || !end) return null;
                     return (
                         <g key={edge.id}>
                             <path 
                                d={`M ${start.x + 190} ${start.y + 32} C ${start.x + 250} ${start.y + 32}, ${end.x - 50} ${end.y + 32}, ${end.x} ${end.y + 32}`}
                                fill="none"
                                stroke="#475569"
                                strokeWidth="3"
                                markerEnd="url(#arrow)"
                             />
                         </g>
                     );
                 })}

                 {/* Packets */}
                 {packets.map(p => {
                     const start = nodes.find(n => n.id === p.from);
                     const end = nodes.find(n => n.id === p.to);
                     if (!start || !end) return null;

                     // Bezier curve interpolation
                     const sx = start.x + 190;
                     const sy = start.y + 32;
                     const ex = end.x;
                     const ey = end.y + 32;
                     
                     // Control points
                     const cp1x = sx + 60;
                     const cp1y = sy;
                     const cp2x = ex - 60;
                     const cp2y = ey;

                     // Calculate point on curve
                     const t = p.progress;
                     const cx = Math.pow(1-t,3)*sx + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*Math.pow(t,2)*cp2x + Math.pow(t,3)*ex;
                     const cy = Math.pow(1-t,3)*sy + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*Math.pow(t,2)*cp2y + Math.pow(t,3)*ey;

                     return (
                         <circle key={p.id} cx={cx} cy={cy} r="4" fill="#fbbf24" className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                     );
                 })}
             </svg>

             {/* Nodes */}
             {nodes.map(node => {
                 const conf = NODE_TYPES[node.type];
                 const Icon = conf.icon;
                 return (
                     <div
                        key={node.id}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                        style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                        className={`absolute w-48 bg-slate-900 border-2 rounded-xl shadow-xl flex flex-col z-10 hover:ring-2 hover:ring-indigo-500 transition-shadow
                            ${selectedNode === node.id ? 'border-indigo-500 shadow-indigo-900/20' : 'border-slate-700'}
                        `}
                     >
                         {/* Header */}
                         <div className={`p-2 border-b border-slate-800 flex items-center justify-between rounded-t-xl bg-slate-950/50`}>
                             <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${conf.bg}`}>
                                    <Icon className={`w-3 h-3 ${conf.color}`} />
                                </div>
                                <span className="text-xs font-bold text-slate-300">{conf.label}</span>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} className="text-slate-600 hover:text-red-400">
                                 <XCircle className="w-3 h-3" />
                             </button>
                         </div>
                         
                         {/* Body */}
                         <div className="p-2 space-y-2">
                             <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                                 <span>IN: <span className={conf.input ? 'text-slate-300' : 'text-slate-700'}>{conf.input || 'None'}</span></span>
                                 <span>OUT: <span className="text-emerald-400">{conf.output}</span></span>
                             </div>
                         </div>

                         {/* Output Handle */}
                         <div 
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-slate-400 rounded-full border-2 border-slate-950 cursor-crosshair hover:bg-indigo-400 hover:scale-125 transition-all z-20"
                            title="Drag to Connect (Shift+Click)"
                         />
                         
                         {/* Input Handle (Visual Only) */}
                         {conf.input && (
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rounded-full border border-slate-600 z-0" />
                         )}
                     </div>
                 );
             })}
         </div>

         {/* Info Footer */}
         <div className="absolute bottom-4 left-6 pointer-events-none z-0 text-xs text-slate-600">
             <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">⇧</div>
                 <span>Hold Shift to Drag Connections</span>
             </div>
         </div>

      </div>
    </div>
  );
}
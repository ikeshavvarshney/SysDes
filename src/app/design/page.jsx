"use client";
import Chatbot from '@/components/Chatbot';
import Navbar from '@/components/Navbar';
import IntroCarousel from '@/components/IntroCarousel';
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
    Server, Database, Globe, Layers, Shield, Activity, DownloadCloud,
    ArrowRight, Play, Pause, RefreshCw, AlertTriangle,
    Cpu, HardDrive, Zap, Search, Plus, Trash2,
    HelpCircle, Settings, CheckCircle, XCircle, Share2,
    CloudLightning, Lock, Box, ZoomIn, ZoomOut, Scale,
    ChevronsUp, Move, Save, FolderOpen, X, Clock, Edit2, Check
} from 'lucide-react';

// --- Constants & Config ---

// Use Environment variable or default to localhost:5000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const GRID_SIZE = 20;

const COMPONENT_TYPES = {
    CLIENT: { type: 'CLIENT', label: 'User Traffic', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-900/50', cost: 0, capacity: 1000000 },
    LB: { type: 'LB', label: 'Load Balancer', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-900/50', cost: 20, capacity: 5000 },
    API: { type: 'API', label: 'API Gateway', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-900/50', cost: 30, capacity: 4000 },
    SERVER: { type: 'SERVER', label: 'App Server', icon: Server, color: 'text-green-400', bg: 'bg-green-900/50', cost: 50, capacity: 1000 },
    MICROSERVICE: { type: 'MICROSERVICE', label: 'Microservice', icon: Box, color: 'text-teal-400', bg: 'bg-teal-900/50', cost: 40, capacity: 1200 },
    CACHE: { type: 'CACHE', label: 'Redis Cache', icon: Zap, color: 'text-red-400', bg: 'bg-red-900/50', cost: 60, capacity: 10000 },
    DB: { type: 'DB', label: 'SQL Database', icon: Database, color: 'text-yellow-400', bg: 'bg-yellow-900/50', cost: 100, capacity: 2000 },
    NOSQL: { type: 'NOSQL', label: 'NoSQL DB', icon: HardDrive, color: 'text-orange-400', bg: 'bg-orange-900/50', cost: 90, capacity: 5000 },
    QUEUE: { type: 'QUEUE', label: 'Message Queue', icon: ArrowRight, color: 'text-pink-400', bg: 'bg-pink-900/50', cost: 40, capacity: 8000 },
    CDN: { type: 'CDN', label: 'CDN', icon: CloudLightning, color: 'text-cyan-400', bg: 'bg-cyan-900/50', cost: 40, capacity: 20000 },
};

const componentSlides = [
    {
        title: "User Traffic",
        description:
            "Represents real users generating requests against the system. Traffic volume defines baseline and peak load, forcing architectural decisions around scalability, throttling, and fault tolerance.",
    },
    {
        title: "Load Balancer",
        description:
            "Evenly distributes incoming traffic across multiple servers to avoid hotspots. Critical for high availability, horizontal scaling, and graceful handling of sudden traffic spikes.",
    },
    {
        title: "API Gateway",
        description:
            "Central entry point that controls how clients access backend services. Handles authentication, request routing, rate limiting, and shields internal services from direct exposure.",
    },
    {
        title: "App Server",
        description:
            "Processes application logic and orchestrates interactions between services and databases. Poor scaling here directly increases latency and becomes a system-wide bottleneck.",
    },
    {
        title: "Microservice",
        description:
            "Independently deployable service focused on a single business capability. Enables team autonomy, isolated failures, and targeted scaling without affecting the entire system.",
    },
    {
        title: "Redis Cache",
        description:
            "In-memory data store used to serve hot data with minimal latency. Reduces repeated database queries and dramatically improves read-heavy workloads under high traffic.",
    },
    {
        title: "SQL Database",
        description:
            "Relational data store optimized for consistency and structured queries. Serves as the system's source of truth for transactional and strongly related data.",
    },
    {
        title: "NoSQL DB",
        description:
            "Schema-flexible database designed for massive scale and high throughput. Ideal for large datasets, event data, and scenarios where availability matters more than strict consistency.",
    },
];

const TEMPLATES = {
    EMPTY: [],
    WEB_APP: [
        { id: '1', type: 'CLIENT', x: 60, y: 300 },
        { id: '2', type: 'LB', x: 260, y: 300 },
        { id: '3', type: 'SERVER', x: 460, y: 200 },
        { id: '4', type: 'SERVER', x: 460, y: 400 },
        { id: '5', type: 'DB', x: 700, y: 300 },
    ],
    NETFLIX: [
        { id: '1', type: 'CLIENT', x: 60, y: 300 },
        { id: '2', type: 'CDN', x: 260, y: 160 },
        { id: '3', type: 'API', x: 260, y: 400 },
        { id: '4', type: 'MICROSERVICE', x: 500, y: 300, label: 'Auth Svc' },
        { id: '5', type: 'MICROSERVICE', x: 500, y: 500, label: 'Video Svc' },
        { id: '6', type: 'CACHE', x: 700, y: 400 },
        { id: '7', type: 'NOSQL', x: 900, y: 500 },
    ]
};

const INITIAL_EDGES_WEB_APP = [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '2', to: '4' },
    { from: '3', to: '5' },
    { from: '4', to: '5' },
];

const INITIAL_EDGES_NETFLIX = [
    { from: '1', to: '2' },
    { from: '1', to: '3' },
    { from: '3', to: '4' },
    { from: '3', to: '5' },
    { from: '5', to: '6' },
    { from: '5', to: '7' },
    { from: '6', to: '7' },
];

// --- Memoized Child Components (Performance Fix) ---

const SimulatorNode = memo(({ node, isSelected, onDragStart, onConnectionStart, onConnectionComplete, isSimulating }) => {
    const config = COMPONENT_TYPES[node.type];
    const Icon = config.icon;
    const isOverloaded = node.load > 90;
    const isCrashed = node.status === 'crashed';
    const capacityMult = node.capacityMultiplier || 1;

    return (
        <div
            onMouseDown={(e) => onDragStart(e, node.id)}
            onMouseUp={(e) => onConnectionComplete(e, node.id)}
            onClick={(e) => e.stopPropagation()}
            style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                position: 'absolute',
                width: '64px',
                height: '64px'
            }}
            className={`
                group rounded-xl flex flex-col items-center justify-center 
                shadow-lg border-2 transition-transform z-10 cursor-move relative
                ${isSelected ? 'border-white shadow-purple-500/50' : isCrashed ? 'border-red-500 bg-red-900/20' : isOverloaded ? 'border-orange-500' : 'border-slate-700 hover:border-slate-500'}
                ${config.bg}
            `}
        >
            <Icon className={`w-8 h-8 ${isCrashed ? 'text-red-500' : config.color}`} />

            {/* Status Dot */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-slate-900 ${isCrashed ? 'bg-red-500' : isOverloaded ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>

            {/* Vertical Scale Badge */}
            {capacityMult > 1 && (
                <div className="absolute -top-2 -left-2 bg-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-indigo-400 shadow flex items-center">
                    <ChevronsUp className="w-3 h-3 mr-0.5" />
                    v{capacityMult}
                </div>
            )}

            <div
                onMouseDown={(e) => onConnectionStart(e, node.id)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-400 hover:bg-white rounded-full cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity border-2 border-slate-900 z-20"
                title="Drag to connect"
            ></div>

            <div className="absolute top-full mt-2 text-[10px] font-medium text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
                {node.label || config.label}
            </div>

            {isSimulating && node.type !== 'CLIENT' && (
                <div className="absolute -bottom-3 w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${node.load > 90 ? 'bg-red-500' : node.load > 70 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(100, node.load)}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
});

const SimulatorEdge = memo(({ start, end, isSimulating }) => {
    if (!start || !end) return null;
    const x1 = start.x + 32;
    const y1 = start.y + 32;
    const x2 = end.x + 32;
    const y2 = end.y + 32;

    return (
        <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isSimulating ? "#a855f7" : "#475569"}
            strokeWidth="2"
            markerEnd={isSimulating ? "url(#arrowhead-active)" : "url(#arrowhead)"}
            strokeDasharray={isSimulating ? "5,5" : "0"}
            className={isSimulating ? "animate-pulse" : ""}
        />
    );
});

// --- Save Dialog Component ---
const SaveDialog = ({ isOpen, onClose, onSave, isSaving, currentName }) => {
    const [workflowName, setWorkflowName] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Pre-fill with current name if editing, or suggest a new name
            if (currentName && currentName !== 'Untitled') {
                setWorkflowName(currentName);
            } else {
                setWorkflowName(`My Workflow - ${new Date().toLocaleDateString()}`);
            }
        }
    }, [isOpen, currentName]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (workflowName.trim()) {
            onSave(workflowName.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && workflowName.trim()) {
            handleSave();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" 
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-120 animate-in zoom-in-95 fade-in duration-200" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                        <Save className="w-5 h-5 text-purple-400" />
                        Save Workflow
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Workflow Name
                        </label>
                        <input
                            type="text"
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., E-commerce Architecture, Microservices Setup..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Give your workflow a descriptive name so you can find it easily later
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !workflowName.trim()}
                            className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Workflow
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Load Dialog Component ---
const LoadDialog = ({ isOpen, onClose, onLoad, onDelete }) => {
    const [layouts, setLayouts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchLayouts();
        }
    }, [isOpen]);

    const fetchLayouts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/layouts`);
            const data = await response.json();
            if (data.success) {
                setLayouts(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch layouts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${API_URL}/api/layouts/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setLayouts(layouts.filter(l => l._id !== id));
                onDelete && onDelete(id);
            }
        } catch (error) {
            console.error("Failed to delete layout:", error);
            alert('Failed to delete workflow. Please try again.');
        }
    };

    const startEditing = (layout, e) => {
        e.stopPropagation();
        setEditingId(layout._id);
        setEditName(layout.name);
    };

    const cancelEditing = (e) => {
        e.stopPropagation();
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = async (id, e) => {
        e.stopPropagation();
        if (!editName.trim()) {
            cancelEditing(e);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/layouts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim() })
            });
            
            const data = await response.json();
            if (data.success) {
                setLayouts(layouts.map(l => 
                    l._id === id ? { ...l, name: editName.trim() } : l
                ));
                setEditingId(null);
                setEditName('');
            }
        } catch (error) {
            console.error("Failed to rename layout:", error);
            alert('Failed to rename workflow. Please try again.');
        }
    };

    // Filter layouts based on search
    const filteredLayouts = layouts.filter(layout =>
        layout.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" 
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-175 max-h-[85vh] flex flex-col animate-in zoom-in-95 fade-in duration-200" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-purple-400" />
                        Load Workflow
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search workflows..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* Layouts List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                        </div>
                    ) : filteredLayouts.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            {searchQuery ? (
                                <>
                                    <p className="text-lg font-medium">No workflows found</p>
                                    <p className="text-sm mt-1">Try a different search term</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-medium">No saved workflows yet</p>
                                    <p className="text-sm mt-1">Create your first design and save it!</p>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredLayouts.map((layout) => (
                            <div
                                key={layout._id}
                                onClick={() => onLoad(layout._id)}
                                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-lg p-4 cursor-pointer transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0 pr-3">
                                        {editingId === layout._id ? (
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') saveEdit(layout._id, e);
                                                        if (e.key === 'Escape') cancelEditing(e);
                                                    }}
                                                    className="flex-1 bg-slate-900 border border-purple-500 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={(e) => saveEdit(layout._id, e)}
                                                    className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded transition-all"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="font-semibold text-slate-200 truncate group-hover:text-purple-300 transition-colors text-base">
                                                    {layout.name}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(layout.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span>
                                                        {new Date(layout.createdAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => startEditing(layout, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded transition-all"
                                            title="Rename workflow"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(layout._id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-all"
                                            title="Delete workflow"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 mt-4 border-t border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {filteredLayouts.length} {filteredLayouts.length === 1 ? 'workflow' : 'workflows'} available
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Application ---

export default function SystemDesignSimulator() {
    // State
    const [nodes, setNodes] = useState(TEMPLATES.WEB_APP.map(n => ({ ...n, status: 'healthy', load: 0, rps: 0 })));
    const [edges, setEdges] = useState(INITIAL_EDGES_WEB_APP);
    const [selectedId, setSelectedId] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isAutoScale, setIsAutoScale] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentLayoutId, setCurrentLayoutId] = useState(null);
    const [currentLayoutName, setCurrentLayoutName] = useState('Untitled');

    // Dialog States
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadDialog, setShowLoadDialog] = useState(false);

    // Viewport State
    const [zoom, setZoom] = useState(0.8);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    const [trafficLevel, setTrafficLevel] = useState(500);
    const [metrics, setMetrics] = useState({ latency: 0, errorRate: 0, throughput: 0, cost: 0, score: 100 });
    const [alerts, setAlerts] = useState([]);
    const [packets, setPackets] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Interaction State
    const [dragState, setDragState] = useState({
        isDragging: false,
        isPanning: false,
        nodeId: null,
        startX: 0,
        startY: 0,
        initialNodeX: 0,
        initialNodeY: 0,
        initialPanX: 0,
        initialPanY: 0
    });
    const [connectState, setConnectState] = useState({ isConnecting: false, startNodeId: null });
    const canvasRef = useRef(null);

    // Refs for Animation Loop
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    const trafficRef = useRef(trafficLevel);
    const isAutoScaleRef = useRef(isAutoScale);

    // Sync Refs
    useEffect(() => { nodesRef.current = nodes; }, [nodes]);
    useEffect(() => { edgesRef.current = edges; }, [edges]);
    useEffect(() => { trafficRef.current = trafficLevel; }, [trafficLevel]);
    useEffect(() => { isAutoScaleRef.current = isAutoScale; }, [isAutoScale]);

    // Derived Values
    const selectedNode = useMemo(() => nodes.find(n => n.id === selectedId), [nodes, selectedId]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedId(null);
                setConnectState({ isConnecting: false, startNodeId: null });
                setDragState(prev => ({ ...prev, isDragging: false, isPanning: false }));
                setShowSaveDialog(false);
                setShowLoadDialog(false);
            }
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                setShowSaveDialog(true);
            }
            // Ctrl+O to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                setShowLoadDialog(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- Backend API Interaction ---

    const loadLatestLayout = async () => {
        try {
            const response = await fetch(`${API_URL}/api/layouts`);
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                // Load the most recent layout (first one, since they're sorted by createdAt desc)
                const layout = data.data[0];
                
                setNodes(layout.nodes || []);
                setEdges(layout.edges || []);
                
                if (layout.viewport) {
                    setPan({ x: layout.viewport.x || 0, y: layout.viewport.y || 0 });
                    setZoom(layout.viewport.zoom || 0.8);
                }

                if (layout.config) {
                    setTrafficLevel(layout.config.trafficLevel || 500);
                }

                setCurrentLayoutId(layout._id);
                setCurrentLayoutName(layout.name);
                setAlerts([`✅ Loaded: ${layout.name}`]);
            }
        } catch (error) {
            console.error("Failed to load layout:", error);
        }
    };

    useEffect(() => {
        loadLatestLayout();
    }, []);

    const saveLayout = async (name) => {
        setIsSaving(true);
        const payload = {
            name: name,
            nodes,
            edges,
            viewport: {
                x: pan.x,
                y: pan.y,
                zoom: zoom
            },
            config: {
                trafficLevel
            }
        };

        try {
            const response = await fetch(`${API_URL}/api/layouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setCurrentLayoutId(data.data._id);
                setCurrentLayoutName(name);
                setAlerts(prev => [`✅ Saved: ${name}`, ...prev]);
                setShowSaveDialog(false);
            } else {
                throw new Error(data.error || "Failed to save");
            }
        } catch (error) {
            setAlerts(prev => [`❌ Save Failed: ${error.message}`, ...prev]);
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const loadLayout = async (layoutId) => {
        try {
            const response = await fetch(`${API_URL}/api/layouts/${layoutId}`);
            const data = await response.json();

            if (data.success && data.data) {
                const layout = data.data;
                
                setNodes(layout.nodes || []);
                setEdges(layout.edges || []);
                
                if (layout.viewport) {
                    setPan({ x: layout.viewport.x || 0, y: layout.viewport.y || 0 });
                    setZoom(layout.viewport.zoom || 0.8);
                }

                if (layout.config) {
                    setTrafficLevel(layout.config.trafficLevel || 500);
                }

                setCurrentLayoutId(layout._id);
                setCurrentLayoutName(layout.name);
                setIsSimulating(false);
                setAlerts([`✅ Loaded: ${layout.name}`]);
                setShowLoadDialog(false);
            }
        } catch (error) {
            setAlerts(prev => [`❌ Load Failed: ${error.message}`, ...prev]);
            console.error("Load error:", error);
        }
    };

    const handleDeleteLayout = (layoutId) => {
        // If deleted layout is the current one, reset to default
        if (layoutId === currentLayoutId) {
            setCurrentLayoutId(null);
            setCurrentLayoutName('Untitled');
        }
    };

    // --- Simulation Logic ---

    useEffect(() => {
        if (!isSimulating) {
            setPackets([]);
            return;
        }

        const interval = setInterval(() => {
            runSimulationTick();
        }, 1000);

        const packetInterval = setInterval(() => {
            updatePackets();
        }, 50);

        return () => {
            clearInterval(interval);
            clearInterval(packetInterval);
        };
    }, [isSimulating]);

    const runSimulationTick = () => {
        const currentTraffic = trafficRef.current;
        let currentNodes = [...nodesRef.current];
        let currentEdges = [...edgesRef.current];
        const autoScaleEnabled = isAutoScaleRef.current;

        let totalLatency = 0;
        let totalErrors = 0;
        let processedRps = 0;
        let newAlerts = [];

        if (autoScaleEnabled) {
            const { scaledNodes, scaledEdges, scaleAlerts } = performAutoScaling(currentNodes, currentEdges);
            if (scaleAlerts.length > 0) {
                currentNodes = scaledNodes;
                currentEdges = scaledEdges;
                newAlerts.push(...scaleAlerts);
            }
        }

        currentNodes = currentNodes.map(n => ({ ...n, load: 0, rps: 0 }));

        const entryNodes = currentNodes.filter(n => n.type === 'CLIENT');
        entryNodes.forEach(client => {
            client.rps = currentTraffic;
            distributeTraffic(client.id, currentTraffic, currentNodes, currentEdges, new Set());
        });

        currentNodes.forEach(node => {
            if (node.type === 'CLIENT') return;

            const config = COMPONENT_TYPES[node.type];
            const capacityMultiplier = node.capacityMultiplier || 1;
            const capacity = config.capacity * capacityMultiplier;

            node.load = (node.rps / capacity) * 100;

            if (Math.random() > 0.995 && node.status !== 'crashed') {
                node.status = 'crashed';
                newAlerts.push(`${node.type} crashed!`);
            }

            if (node.status === 'crashed' && Math.random() > 0.8) {
                node.status = 'healthy';
            }

            if (node.status === 'crashed') {
                totalErrors += node.rps;
                node.load = 0;
            } else if (node.load > 100) {
                node.status = 'overloaded';
                const excess = node.load - 100;
                totalErrors += (excess / 200) * node.rps;
                totalLatency += 500 + (excess * 10);
                if (!autoScaleEnabled) newAlerts.push(`Overload: ${node.type}`);
            } else {
                node.status = 'healthy';
                totalLatency += 20 + (node.load * 0.5);
            }

            processedRps += (node.rps - (node.status === 'crashed' ? node.rps : 0));
        });

        const totalCost = currentNodes.reduce((acc, node) => acc + (COMPONENT_TYPES[node.type].cost * (node.capacityMultiplier || 1)), 0);
        const avgLatency = processedRps > 0 ? totalLatency / currentNodes.length : 0;
        const errorRate = currentTraffic > 0 ? (totalErrors / (currentTraffic * entryNodes.length)) * 100 : 0;

        const reliabilityScore = Math.max(0, 100 - errorRate - (avgLatency / 10));
        const costPenalty = Math.max(0, (totalCost - 500) / 10);
        const finalScore = Math.round(reliabilityScore - costPenalty);

        setNodes(currentNodes);
        if (currentEdges.length !== edgesRef.current.length) setEdges(currentEdges);

        setMetrics({
            throughput: processedRps,
            latency: Math.round(avgLatency),
            errorRate: Math.min(100, errorRate.toFixed(2)),
            cost: totalCost,
            score: Math.max(0, finalScore)
        });

        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts.slice(-4), ...prev].slice(0, 5));
        }
    };

    const performAutoScaling = (currentNodes, currentEdges) => {
        let scaledNodes = [...currentNodes];
        let scaledEdges = [...currentEdges];
        const scaleAlerts = [];

        for (let i = 0; i < currentNodes.length; i++) {
            const node = currentNodes[i];
            if (node.type === 'CLIENT') continue;

            if (node.load > 85) {
                if (['SERVER', 'MICROSERVICE', 'API', 'LB'].includes(node.type)) {
                    if ((node.capacityMultiplier || 1) < 3) {
                        node.capacityMultiplier = (node.capacityMultiplier || 1) + 1;
                        scaleAlerts.push(`Auto-Scale: Vertically Scaled ${node.type} to v${node.capacityMultiplier}`);
                    } else {
                        const similarNodes = scaledNodes.filter(n => n.type === node.type);
                        if (similarNodes.length < 12) {
                            const newId = Date.now().toString() + Math.random().toString().substr(2, 4);
                            const newNode = {
                                ...node, id: newId,
                                x: node.x + 80,
                                y: node.y,
                                load: 0, status: 'healthy', capacityMultiplier: 1
                            };

                            const incoming = currentEdges.filter(e => e.to === node.id);
                            const outgoing = currentEdges.filter(e => e.from === node.id);
                            incoming.forEach(e => scaledEdges.push({ from: e.from, to: newId }));
                            outgoing.forEach(e => scaledEdges.push({ from: newId, to: e.to }));

                            scaledNodes.push(newNode);
                            scaleAlerts.push(`Auto-Scale: Added new ${node.type} instance`);
                        }
                    }
                }

                if (['DB', 'NOSQL'].includes(node.type)) {
                    const parents = currentEdges.filter(e => e.to === node.id).map(e => e.from);
                    const fedByCache = parents.some(pid => {
                        const parent = scaledNodes.find(n => n.id === pid);
                        return parent && parent.type === 'CACHE';
                    });

                    if (!fedByCache) {
                        const newCacheId = Date.now().toString() + "_cache";
                        const newCache = {
                            id: newCacheId, type: 'CACHE',
                            x: node.x - 100, y: node.y,
                            load: 0, status: 'healthy', capacityMultiplier: 1
                        };

                        const edgesToRemove = currentEdges.filter(e => e.to === node.id);
                        scaledEdges = scaledEdges.filter(e => e.to !== node.id);
                        edgesToRemove.forEach(e => scaledEdges.push({ from: e.from, to: newCacheId }));
                        scaledEdges.push({ from: newCacheId, to: node.id });

                        scaledNodes.push(newCache);
                        scaleAlerts.push(`Auto-Scale: Injected Redis Cache before ${node.type}`);
                    } else {
                        const newId = Date.now().toString() + "_replica";
                        const newNode = {
                            ...node, id: newId,
                            x: node.x,
                            y: node.y + 80,
                            load: 0, status: 'healthy', label: `${node.label} (Replica)`
                        };

                        const incoming = currentEdges.filter(e => e.to === node.id);
                        incoming.forEach(e => scaledEdges.push({ from: e.from, to: newId }));

                        scaledNodes.push(newNode);
                        scaleAlerts.push(`Auto-Scale: Added ${node.type} Read Replica`);
                    }
                }
            }
        }

        if (scaleAlerts.length === 0) {
            const candidates = scaledNodes.filter(n => ['SERVER', 'MICROSERVICE'].includes(n.type) && n.load < 20);
            for (let node of candidates) {
                const parents = scaledEdges.filter(e => e.to === node.id).map(e => e.from);
                if (parents.length === 0) continue;

                const siblings = scaledNodes.filter(n =>
                    n.id !== node.id && n.type === node.type && n.status === 'healthy' &&
                    scaledEdges.some(e => e.to === n.id && parents.includes(e.from))
                );

                if (siblings.length > 0) {
                    scaledNodes = scaledNodes.filter(n => n.id !== node.id);
                    scaledEdges = scaledEdges.filter(e => e.from !== node.id && e.to !== node.id);
                    scaleAlerts.push(`Auto-Scale: Decommissioned idle ${node.type}`);
                    break;
                }
            }
        }

        return { scaledNodes, scaledEdges, scaleAlerts };
    };

    const distributeTraffic = (sourceId, rps, currentNodes, currentEdges, visited) => {
        if (visited.has(sourceId)) return;
        visited.add(sourceId);

        const outgoing = currentEdges.filter(e => e.from === sourceId);
        if (outgoing.length === 0) return;
        const rpsPerChild = rps / outgoing.length;

        outgoing.forEach(edge => {
            const targetNode = currentNodes.find(n => n.id === edge.to);
            if (targetNode) {
                targetNode.rps += rpsPerChild;
                if (Math.random() > 0.8) spawnPacket(sourceId, edge.to);

                let nextRps = rpsPerChild;

                if (targetNode.type === 'CACHE') {
                    nextRps = rpsPerChild * 0.15;
                }

                distributeTraffic(targetNode.id, nextRps, currentNodes, currentEdges, new Set(visited));
            }
        });
    };

    const spawnPacket = (from, to) => {
        if (packets.length > 30) return;

        const startNode = nodesRef.current.find(n => n.id === from);
        const endNode = nodesRef.current.find(n => n.id === to);
        if (!startNode || !endNode) return;

        setPackets(prev => [...prev, {
            id: Math.random(),
            x: startNode.x + 30,
            y: startNode.y + 30,
            targetX: endNode.x + 30,
            targetY: endNode.y + 30,
            progress: 0,
            speed: 0.05
        }]);
    };

    const updatePackets = () => {
        setPackets(prev => prev.map(p => ({
            ...p,
            progress: p.progress + p.speed,
            x: p.x + (p.targetX - p.x) * p.speed,
            y: p.y + (p.targetY - p.y) * p.speed
        })).filter(p => p.progress < 1));
    };

    // --- Action Handlers ---

    const handleDragStart = (e, nodeId) => {
        e.stopPropagation();
        const node = nodes.find(n => n.id === nodeId);
        setDragState({
            isDragging: true,
            isPanning: false,
            nodeId,
            startX: e.clientX,
            startY: e.clientY,
            initialNodeX: node.x,
            initialNodeY: node.y,
            initialPanX: 0,
            initialPanY: 0
        });
        setSelectedId(nodeId);
    };

    const handleCanvasMouseDown = (e) => {
        if (connectState.isConnecting) return;

        setDragState({
            isDragging: false,
            isPanning: true,
            nodeId: null,
            startX: e.clientX,
            startY: e.clientY,
            initialNodeX: 0,
            initialNodeY: 0,
            initialPanX: pan.x,
            initialPanY: pan.y
        });
    };

    const handleDragMove = (e) => {
        if (dragState.isPanning) {
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            setPan({
                x: dragState.initialPanX + dx,
                y: dragState.initialPanY + dy
            });
        }
        else if (dragState.isDragging && dragState.nodeId) {
            const dx = (e.clientX - dragState.startX) / zoom;
            const dy = (e.clientY - dragState.startY) / zoom;

            const rawX = dragState.initialNodeX + dx;
            const rawY = dragState.initialNodeY + dy;

            const snappedX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
            const snappedY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;

            setNodes(prev => prev.map(n =>
                n.id === dragState.nodeId
                    ? { ...n, x: snappedX, y: snappedY }
                    : n
            ));
        }

        if (connectState.isConnecting) {
            setMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleDragEnd = () => {
        setDragState({
            isDragging: false,
            isPanning: false,
            nodeId: null,
            startX: 0, startY: 0,
            initialNodeX: 0, initialNodeY: 0,
            initialPanX: 0, initialPanY: 0
        });
        setSelectedId(null);
    };

    const addNode = (type) => {
        const id = Date.now().toString();
        const centerX = (400 - pan.x) / zoom;
        const centerY = (300 - pan.y) / zoom;

        const newNode = {
            id,
            type,
            x: Math.round(centerX / GRID_SIZE) * GRID_SIZE,
            y: Math.round(centerY / GRID_SIZE) * GRID_SIZE,
            status: 'healthy',
            load: 0,
            rps: 0,
            capacityMultiplier: 1,
            label: COMPONENT_TYPES[type].label
        };
        setNodes([...nodes, newNode]);
    };

    const deleteNode = (id) => {
        setNodes(nodes.filter(n => n.id !== id));
        setEdges(edges.filter(e => e.from !== id && e.to !== id));
        setSelectedId(null);
    };

    const startConnection = (e, id) => {
        e.stopPropagation();
        setConnectState({ isConnecting: true, startNodeId: id });
    };

    const completeConnection = (e, targetId) => {
        e.stopPropagation();
        if (connectState.isConnecting && connectState.startNodeId !== targetId) {
            const exists = edges.some(edge =>
                (edge.from === connectState.startNodeId && edge.to === targetId)
            );
            if (!exists) setEdges([...edges, { from: connectState.startNodeId, to: targetId }]);
        }
        setConnectState({ isConnecting: false, startNodeId: null });
        handleDragEnd();
    };

    const handleCanvasClick = () => {
        setSelectedId(null);
        setConnectState({ isConnecting: false, startNodeId: null });
    };

    const loadTemplate = (templateName) => {
        setPan({ x: 0, y: 0 });
        setZoom(1);

        if (templateName === 'NETFLIX') {
            setNodes(TEMPLATES.NETFLIX.map(n => ({ ...n, status: 'healthy', load: 0, rps: 0, capacityMultiplier: 1 })));
            setEdges(INITIAL_EDGES_NETFLIX);
        } else if (templateName === 'WEB_APP') {
            setNodes(TEMPLATES.WEB_APP.map(n => ({ ...n, status: 'healthy', load: 0, rps: 0, capacityMultiplier: 1 })));
            setEdges(INITIAL_EDGES_WEB_APP);
        } else {
            setNodes([]);
            setEdges([]);
        }
        setIsSimulating(false);
        setAlerts([]);
        setCurrentLayoutId(null);
        setCurrentLayoutName('Untitled');
    };

    const adjustZoom = (delta) => {
        setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
    };

    const suggestFixes = () => {
        const suggestions = [];
        const overloadedNodes = nodes.filter(n => n.load > 80);

        overloadedNodes.forEach(node => {
            if (node.type === 'DB') {
                suggestions.push({
                    msg: `Database ${node.id} is overloaded. Add a Cache?`,
                    action: () => {
                        const newCacheId = Date.now().toString();
                        const newCache = {
                            id: newCacheId, type: 'CACHE',
                            x: node.x - 100, y: node.y,
                            status: 'healthy', load: 0, rps: 0
                        };
                        const parents = edges.filter(e => e.to === node.id);
                        const newEdges = edges.filter(e => e.to !== node.id);
                        parents.forEach(p => newEdges.push({ from: p.from, to: newCacheId }));
                        newEdges.push({ from: newCacheId, to: node.id });

                        setNodes([...nodes, newCache]);
                        setEdges(newEdges);
                        setAlerts(prev => ["Fixed: Added Redis Cache", ...prev]);
                    }
                });
            }
        });
        if (suggestions.length === 0) setAlerts(prev => ["System looks healthy.", ...prev]);
        return suggestions;
    };

    const [activeSuggestions, setActiveSuggestions] = useState([]);

    // --- Rendering ---

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30">

            {/* Save & Load Dialogs */}
            <SaveDialog 
                isOpen={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                onSave={saveLayout}
                isSaving={isSaving}
                currentName={currentLayoutName}
            />

            <LoadDialog 
                isOpen={showLoadDialog}
                onClose={() => setShowLoadDialog(false)}
                onLoad={loadLayout}
                onDelete={handleDeleteLayout}
            />

            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-20">
                <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
                    <CloudLightning className="w-6 h-6 text-purple-400" />
                    <h1 className="font-bold text-lg tracking-tight">Design</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Compute</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <ToolBtn type="SERVER" onClick={() => addNode('SERVER')} />
                            <ToolBtn type="MICROSERVICE" onClick={() => addNode('MICROSERVICE')} />
                            <ToolBtn type="LB" onClick={() => addNode('LB')} />
                            <ToolBtn type="API" onClick={() => addNode('API')} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data Store</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <ToolBtn type="DB" onClick={() => addNode('DB')} />
                            <ToolBtn type="NOSQL" onClick={() => addNode('NOSQL')} />
                            <ToolBtn type="CACHE" onClick={() => addNode('CACHE')} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Networking</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <ToolBtn type="CLIENT" onClick={() => addNode('CLIENT')} />
                            <ToolBtn type="CDN" onClick={() => addNode('CDN')} />
                            <ToolBtn type="QUEUE" onClick={() => addNode('QUEUE')} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Templates</h3>
                        <div className="space-y-2">
                            <button onClick={() => loadTemplate('WEB_APP')} className="w-full text-left px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors">
                                Basic Web App
                            </button>
                            <button onClick={() => loadTemplate('NETFLIX')} className="w-full text-left px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors">
                                Netflix (Streaming)
                            </button>
                            <button onClick={() => loadTemplate('EMPTY')} className="w-full text-left px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors">
                                Clear Canvas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col relative">
                <div className="relative">
                    <Navbar py={2} />
                    <IntroCarousel
                        heading='Different Designing Components'
                        storageKey="design_sim_intro_seen"
                        slides={componentSlides}
                    />
                    
                    {/* Top Control Bar */}
                    <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 shrink-0 z-40">

                        {/* LEFT CONTROLS */}
                        <div className="flex items-center gap-3">

                            {/* Current Workflow Name */}
                            <div className="flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-800 rounded-md border border-slate-700">
                                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                <span className="font-medium text-slate-300">{currentLayoutName}</span>
                            </div>

                            {/* Run / Stop */}
                            <button
                                onClick={() => setIsSimulating(!isSimulating)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors
                                    ${isSimulating
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    }`}
                            >
                                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span>{isSimulating ? 'Stop' : 'Run'}</span>
                            </button>

                            {/* Save Button */}
                            <button
                                onClick={() => setShowSaveDialog(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors bg-purple-600 hover:bg-purple-500 text-white"
                                title="Save Workflow (Ctrl+S)"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                            </button>

                            {/* Load Button */}
                            <button
                                onClick={() => setShowLoadDialog(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                                title="Load Workflow (Ctrl+O)"
                            >
                                <FolderOpen className="w-4 h-4" />
                                <span>Load</span>
                            </button>

                            {/* Divider */}
                            <div className="h-6 w-px bg-slate-700" />

                            {/* Traffic Slider */}
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
                                <span className="text-[11px] uppercase font-semibold text-slate-400">
                                    Traffic
                                </span>

                                <input
                                    type="range"
                                    min="100"
                                    max="20000"
                                    step="100"
                                    value={trafficLevel}
                                    onChange={(e) => setTrafficLevel(+e.target.value)}
                                    className="w-28 accent-purple-500"
                                />

                                <span className="text-xs font-mono text-slate-300 w-16 text-right">
                                    {trafficLevel} rps
                                </span>
                            </div>

                            {/* Auto-Scale */}
                            <button
                                onClick={() => setIsAutoScale(!isAutoScale)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold border transition-colors
                                    ${isAutoScale
                                        ? 'bg-blue-600/90 border-blue-500 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <Scale className="w-4 h-4" />
                                <span>{isAutoScale ? 'Auto ON' : 'Auto OFF'}</span>
                            </button>

                            {/* Manual Diagnose */}
                            {!isAutoScale && (
                                <button
                                    onClick={() => setActiveSuggestions(suggestFixes())}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                                >
                                    <Activity className="w-4 h-4" />
                                    Diagnose
                                </button>
                            )}
                        </div>

                        {/* RIGHT METRICS */}
                        <div className="flex items-center gap-6 text-sm">

                            <MetricItem
                                label="Throughput"
                                value={formatNumber(metrics.throughput)}
                            />

                            <MetricItem
                                label="Cost"
                                value={`$${metrics.cost}/mo`}
                            />

                            <div className="flex flex-col items-end leading-tight">
                                <span className="text-[11px] text-slate-500 uppercase font-bold">
                                    Health
                                </span>
                                <span
                                    className={`font-mono font-bold
                                        ${metrics.score > 80
                                            ? 'text-emerald-400'
                                            : metrics.score > 50
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                        }`}
                                >
                                    {metrics.score}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ZOOM CONTROLS */}
                    <div className="absolute top-15 right-4 z-50">
                        <div className="flex flex-col space-y-2 bg-slate-900 p-1 rounded-lg border border-slate-700 shadow-xl">
                            <button
                                onClick={() => adjustZoom(0.1)}
                                className="p-2 hover:bg-slate-700 rounded-md text-slate-300"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>

                            <div className="text-center text-xs font-mono text-slate-500">
                                {Math.round(zoom * 100)}%
                            </div>

                            <button
                                onClick={() => adjustZoom(-0.1)}
                                className="p-2 hover:bg-slate-700 rounded-md text-slate-300"
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>

                            <div className="h-px bg-slate-700" />

                            <button
                                onClick={() => setPan({ x: 0, y: 0 })}
                                className="p-2 hover:bg-slate-700 rounded-md text-slate-300"
                                title="Reset view"
                            >
                                <Move className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Canvas Wrapper */}
                <div
                    className={`flex-1 bg-slate-950 relative overflow-hidden ${dragState.isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onClick={handleCanvasClick}
                    ref={canvasRef}
                    style={{
                        backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                        backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
                        backgroundPosition: `${pan.x}px ${pan.y}px`
                    }}
                >
                    {/* Simulation Overlay */}
                    {activeSuggestions.length > 0 && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col space-y-2"
                        >
                            {activeSuggestions.map((sug, i) => (
                                <div key={i} className="bg-indigo-900/90 text-white px-4 py-3 rounded-lg border border-indigo-500 shadow-2xl flex items-center space-x-4 backdrop-blur-sm animate-in slide-in-from-top-4 fade-in duration-300">
                                    <span className="text-sm">{sug.msg}</span>
                                    <button
                                        onClick={() => { sug.action(); setActiveSuggestions([]); }}
                                        className="bg-white text-indigo-900 px-3 py-1 rounded text-xs font-bold hover:bg-indigo-100"
                                    >
                                        Apply Fix
                                    </button>
                                    <button onClick={() => setActiveSuggestions([])}><XCircle className="w-4 h-4 text-indigo-300" /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Chatbot></Chatbot>

                    {/* Scalable Content Layer with Pan and Zoom */}
                    <div
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                        }}
                    >
                        <div className="w-full h-full relative" style={{ pointerEvents: 'auto' }}>
                            {/* SVG Layer for Edges */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                                    </marker>
                                    <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
                                    </marker>
                                </defs>
                                {edges.map((edge, i) => {
                                    const start = nodes.find(n => n.id === edge.from);
                                    const end = nodes.find(n => n.id === edge.to);
                                    return <SimulatorEdge key={i} start={start} end={end} isSimulating={isSimulating} />;
                                })}
                                {connectState.isConnecting && (() => {
                                    const start = nodes.find(n => n.id === connectState.startNodeId);
                                    if (!start || !canvasRef.current) return null;
                                    const rect = canvasRef.current.getBoundingClientRect();
                                    return (
                                        <line
                                            x1={start.x + 32}
                                            y1={start.y + 32}
                                            x2={(mousePos.x - rect.left - pan.x) / zoom}
                                            y2={(mousePos.y - rect.top - pan.y) / zoom}
                                            stroke="#cbd5e1"
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                        />
                                    );
                                })()}

                                {packets.map(p => (
                                    <circle
                                        key={p.id}
                                        cx={p.x}
                                        cy={p.y}
                                        r="3"
                                        fill="#fbbf24"
                                        className="filter drop-shadow-[0_0_2px_rgba(251,191,36,0.8)]"
                                    />
                                ))}
                            </svg>

                            {/* Nodes Layer */}
                            {nodes.map(node => (
                                <SimulatorNode
                                    key={node.id}
                                    node={node}
                                    isSelected={selectedId === node.id}
                                    onDragStart={handleDragStart}
                                    onConnectionStart={startConnection}
                                    onConnectionComplete={completeConnection}
                                    isSimulating={isSimulating}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Info Panel */}
                {selectedNode && (
                    <div className="absolute top-20 right-4 w-64 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl shadow-2xl p-4 animate-in slide-in-from-right-4 z-40">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-slate-200">{COMPONENT_TYPES[selectedNode.type].label}</h3>
                            <button onClick={() => deleteNode(selectedNode.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-500 block mb-1">Component Type</label>
                                <div className="text-slate-300 font-mono bg-slate-800 p-2 rounded">{selectedNode.type}</div>
                            </div>

                            {isSimulating && (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Current Load</span>
                                        <span className={selectedNode.load > 90 ? 'text-red-400 font-bold' : 'text-slate-300'}>{Math.round(selectedNode.load)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${selectedNode.load > 90 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(100, selectedNode.load)}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {selectedNode.capacityMultiplier > 1 && (
                                <div className="pt-2 border-t border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-indigo-400 font-bold">Vertically Scaled</span>
                                        <span className="bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded text-[10px] border border-indigo-700">
                                            {selectedNode.capacityMultiplier}x Capacity
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Alerts */}
                <div className="absolute bottom-4 left-4 z-10 w-80 pointer-events-none">
                    <div className="space-y-2">
                        {alerts.map((alert, i) => (
                            <div key={i} className={`backdrop-blur text-slate-200 text-xs px-3 py-2 rounded-md border-l-2 animate-in slide-in-from-left-2 fade-in ${alert.includes('Auto-Scale') ? 'bg-blue-900/60 border-blue-500' : 'bg-black/60 border-yellow-500'}`}>
                                {alert}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- Subcomponents & Utils ---

function ToolBtn({ type, onClick }) {
    const config = COMPONENT_TYPES[type];
    const Icon = config.icon;
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 transition-all group`}
        >
            <Icon className={`w-6 h-6 mb-2 ${config.color} group-hover:scale-110 transition-transform`} />
            <span className="text-[10px] text-slate-400">{config.label}</span>
        </button>
    );
}

function MetricItem({ label, value, color = 'text-slate-200' }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-bold">{label}</span>
            <span className={`font-mono font-bold ${color}`}>{value}</span>
        </div>
    );
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.round(num).toString();
}
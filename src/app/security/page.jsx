"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Lock, Unlock, Terminal, AlertTriangle, 
  Server, Database, Globe, Wifi, Activity, 
  Cpu, Skull, Zap, Eye, Code, RefreshCw, Hexagon,
  Router, Cloud, Move, Bot, Play, Pause, FastForward,
  MousePointer2, FileWarning, Search, XCircle, CheckCircle,
  Power, ZoomIn, ZoomOut, Plus, ShieldCheck, Crosshair
} from 'lucide-react';

// --- Configuration ---
const MAX_HEALTH = 100;
const BASE_ATTACK_INTERVAL = 2000;
const GRID_SIZE = 40;

// Initial Pixel Layout (Infinite Canvas style)
const INITIAL_NODES = [
  { id: 'internet', label: 'Public Internet', type: 'cloud', x: 100, y: 400, icon: Globe, detail: 'Gateway' },
  { id: 'firewall', label: 'WAF / Firewall', type: 'shield', x: 350, y: 400, icon: Shield, detail: 'Packet Filtering' },
  { id: 'lb', label: 'Load Balancer', type: 'router', x: 600, y: 400, icon: Router, detail: 'Traffic Distribution' },
  { id: 'web', label: 'Web Cluster', type: 'server', x: 850, y: 250, icon: Server, detail: 'Frontend Services' },
  { id: 'app', label: 'App Logic', type: 'server', x: 850, y: 550, icon: Cpu, detail: 'Backend API' },
  { id: 'db', label: 'Primary DB', type: 'data', x: 1100, y: 400, icon: Database, detail: 'Encrypted Storage' },
];

const INITIAL_CONNECTIONS = [
  { from: 'internet', to: 'firewall' },
  { from: 'firewall', to: 'lb' },
  { from: 'lb', to: 'web' },
  { from: 'lb', to: 'app' },
  { from: 'web', to: 'db' },
  { from: 'app', to: 'db' },
];

const ATTACK_TYPES = {
  'DDOS': { name: 'DDoS Flood', damage: 0.8, target: 'firewall', color: '#ef4444', protocol: 'HTTP', cost: 10 },
  'SQLI': { name: 'SQL Injection', damage: 15, target: 'db', color: '#a855f7', protocol: 'SQL', cost: 20 },
  'BRUTE': { name: 'Brute Force SSH', damage: 5, target: 'web', color: '#f97316', protocol: 'SSH', cost: 15 },
  'MALWARE': { name: 'RCE / Malware', damage: 20, target: 'app', color: '#22c55e', protocol: 'TCP', cost: 30 } 
};

const COUNTERMEASURES = {
  'TRAFFIC_FILTER': { label: 'Scrub Traffic', icon: Wifi, cost: 15, cooldown: 4000, desc: 'Mitigates Volumetric Attacks' },
  'SANITIZE_INPUT': { label: 'Deploy WAF Rule', icon: Code, cost: 25, cooldown: 6000, desc: 'Blocks Malformed Queries' },
  'BAN_IP': { label: 'Blacklist IP', icon: Lock, cost: 5, cooldown: 2000, desc: 'Stops Brute Force Sources' },
  'ISOLATE_NODE': { label: 'Air Gap System', icon: Unlock, cost: 40, cooldown: 10000, desc: 'Emergency Containment' },
};

export default function CyberSecuritySim() {
  // --- State ---
  // Core
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [systemIntegrity, setSystemIntegrity] = useState(100);
  const [resources, setResources] = useState(60); 
  const [gameOver, setGameOver] = useState(false);
  
  // Gameplay
  const [gameMode, setGameMode] = useState('DEFENSE'); // 'DEFENSE' | 'RED_TEAM'
  const [speed, setSpeed] = useState(1); // 0 (paused), 1, 2, 4
  const [activeAttacks, setActiveAttacks] = useState([]);
  const [nodeStatus, setNodeStatus] = useState(INITIAL_NODES.reduce((acc, node) => ({ ...acc, [node.id]: 100 }), {}));
  const [hackerProgress, setHackerProgress] = useState(0);
  const [firewallRules, setFirewallRules] = useState({ 'HTTP': true, 'SSH': true, 'SQL': true, 'TCP': true });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  // Auto Defense
  const [isAutoDefense, setIsAutoDefense] = useState(false);
  const mitigatedAttacksRef = useRef(new Set()); // Track which attacks are being handled by AI

  // Viewport State (Infinite Canvas)
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Effects & Feedback
  const [logs, setLogs] = useState([]);
  const [packets, setPackets] = useState([]);
  const [cooldowns, setCooldowns] = useState({});
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Interaction
  const [dragState, setDragState] = useState({ 
      isDragging: false, 
      isPanning: false, 
      nodeId: null, 
      startX: 0, startY: 0, 
      initialX: 0, initialY: 0, 
      initialPanX: 0, initialPanY: 0
  });

  // Refs
  const logEndRef = useRef(null);
  const gameLoopRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Refs for loop access
  const stateRef = useRef({
    nodes, activeAttacks, speed, firewallRules, gameOver, isAutoFixing, nodeStatus, isAutoDefense, resources
  });

  // Keep refs synced
  useEffect(() => {
    stateRef.current = { nodes, activeAttacks, speed, firewallRules, gameOver, isAutoFixing, nodeStatus, isAutoDefense, resources };
  }, [nodes, activeAttacks, speed, firewallRules, gameOver, isAutoFixing, nodeStatus, isAutoDefense, resources]);


  // --- AUTO-DEFENSE LOGIC (The "Fight Back" Feature) ---
  useEffect(() => {
      if (!isAutoDefense || gameOver || isAutoFixing) return;

      const defenseInterval = setInterval(() => {
          const { activeAttacks, resources, nodes } = stateRef.current;
          
          activeAttacks.forEach(attack => {
              // If already being handled, skip
              if (mitigatedAttacksRef.current.has(attack.id)) return;

              const cmKey = ATTACK_TYPES[attack.type].counter;
              const cm = COUNTERMEASURES[cmKey];

              // Check if we can afford to fight back
              if (resources >= cm.cost) {
                  // Commit to fixing this attack
                  mitigatedAttacksRef.current.add(attack.id);
                  
                  // Simulate AI reaction delay (faster than human)
                  setTimeout(() => {
                      // Re-check state in case game ended
                      if (stateRef.current.gameOver) return;

                      // Deduct Cost
                      setResources(prev => Math.max(0, prev - cm.cost));
                      
                      // 1. Visual: Spawn Hunter-Killer Packet
                      const fwNode = nodes.find(n => n.id === 'firewall');
                      setPackets(prev => [...prev, {
                          id: Math.random(),
                          sourceId: 'firewall',
                          targetId: attack.target,
                          x: fwNode.x, y: fwNode.y,
                          color: '#3b82f6', // Defense Blue
                          progress: 0,
                          speed: 3, // Very fast
                          type: 'hunter_killer' // New Visual Type
                      }]);

                      // 2. Logic: Remove Attack & Heal
                      // We delay the actual removal slightly to match the packet travel time visually
                      setTimeout(() => {
                          setActiveAttacks(prev => prev.filter(a => a.id !== attack.id));
                          setNodeStatus(prev => ({ 
                              ...prev, 
                              [attack.target]: Math.min(100, prev[attack.target] + 20) 
                          }));
                          addLog(`AI DEFENSE: Neutralized ${attack.name}`, "SUCCESS");
                          
                          // Cleanup ref
                          mitigatedAttacksRef.current.delete(attack.id);
                      }, 500);

                  }, 500); // 500ms reaction time
              }
          });

      }, 500); // Check for threats every 0.5s

      return () => clearInterval(defenseInterval);
  }, [isAutoDefense, gameOver, isAutoFixing]);


  // --- AUTO-FIX PROTOCOL (Omega - Post Crash) ---
  useEffect(() => {
    if (gameOver && !isAutoFixing) {
        setIsAutoFixing(true);
        setGlitchIntensity(1);
        addLog("CRITICAL SYSTEM FAILURE.", "CRITICAL");
        addLog("INITIATING OMEGA PROTOCOL...", "CRITICAL");
        
        // 1. Red Alert Phase
        setTimeout(() => {
            setGlitchIntensity(0.5);
            addLog("DEPLOYING AI SENTINEL...", "INFO");
            
            // 2. Spawn AI Sentinel Node (Center of canvas approx)
            const aiNode = { 
                id: 'ai_sentinel', label: 'AI Sentinel', type: 'ai', 
                x: 600, y: 100, icon: Bot, detail: 'Auto-Remediation Unit' 
            };
            setNodes(prev => [...prev, aiNode]);
            
            // 3. Connect AI to everything
            const newConns = INITIAL_NODES.filter(n => n.id !== 'internet').map(n => ({ from: 'ai_sentinel', to: n.id, type: 'heal' }));
            setConnections(prev => [...prev, ...newConns]);
            
            // 4. Fast Healing Loop
            let healTicks = 0;
            const healInterval = setInterval(() => {
                healTicks++;
                
                // Heal Nodes
                setNodeStatus(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(key => { if (next[key] < 100) next[key] += 10; });
                    return next;
                });
                
                // Purge Hacker
                setHackerProgress(prev => Math.max(0, prev - 5));
                setSystemIntegrity(prev => Math.min(100, prev + 5));
                setActiveAttacks(prev => []); // Purge attacks

                if (healTicks > 20) {
                    clearInterval(healInterval);
                    finishAutoFix();
                }
            }, 100);

        }, 3000);
    }
  }, [gameOver]);

  const finishAutoFix = () => {
      setGameOver(false);
      setIsAutoFixing(false);
      setHackerProgress(0);
      setSystemIntegrity(100);
      setResources(100);
      setGlitchIntensity(0);
      addLog("SYSTEM RESTORED. THREATS PURGED.", "SUCCESS");
      
      setTimeout(() => {
          setNodes(prev => prev.filter(n => n.id !== 'ai_sentinel'));
          setConnections(INITIAL_CONNECTIONS);
      }, 1500);
  };


  // --- SIMULATION LOOP ---
  useEffect(() => {
    if (gameOver || isAutoFixing) return;

    gameLoopRef.current = setInterval(() => {
        if (stateRef.current.speed === 0) return;
        tick();
    }, 100 / (speed || 1)); 

    // Attack Spawner
    const attackLoop = setInterval(() => {
        if (stateRef.current.speed > 0 && gameMode === 'DEFENSE') {
            launchRandomAttack();
        }
    }, BASE_ATTACK_INTERVAL / (speed || 1));

    return () => {
        clearInterval(gameLoopRef.current);
        clearInterval(attackLoop);
    };
  }, [gameOver, isAutoFixing, speed, gameMode]);

  const tick = () => {
      const { activeAttacks, firewallRules, nodeStatus } = stateRef.current;
      
      // 1. Resources
      setResources(prev => Math.min(100, prev + (0.1 * speed)));

      // 2. Process Attacks
      let damageTaken = 0;
      const nextNodeStatus = { ...nodeStatus };
      
      activeAttacks.forEach(attack => {
          const protocol = ATTACK_TYPES[attack.type].protocol;
          if (firewallRules[protocol] === false) return; 

          const damageTick = ATTACK_TYPES[attack.type].damage / 10;
          if (nextNodeStatus[attack.target] !== undefined) {
              nextNodeStatus[attack.target] = Math.max(0, nextNodeStatus[attack.target] - damageTick);
              damageTaken += damageTick;
          }
      });

      setNodeStatus(nextNodeStatus);

      // 3. Integrity & Progress
      const internalNodes = INITIAL_NODES.filter(n => n.id !== 'internet');
      const totalHealth = internalNodes.reduce((acc, n) => acc + (nextNodeStatus[n.id] || 0), 0);
      const avgHealth = totalHealth / internalNodes.length;
      
      setSystemIntegrity(avgHealth);

      const unblockedAttacks = activeAttacks.filter(a => firewallRules[ATTACK_TYPES[a.type].protocol] !== false);
      const progressDelta = unblockedAttacks.length > 0 ? 0.1 : -0.05;
      setHackerProgress(prev => Math.max(0, Math.min(100, prev + progressDelta)));

      if (avgHealth <= 0 || hackerProgress >= 100) {
          setGameOver(true);
      }
  };

  // --- ACTIONS ---

  const launchRandomAttack = () => {
      if (Math.random() > 0.6) {
          const keys = Object.keys(ATTACK_TYPES);
          const type = keys[Math.floor(Math.random() * keys.length)];
          triggerAttack(type);
      }
  };

  const triggerAttack = (type) => {
      const attackDef = ATTACK_TYPES[type];
      const newAttack = { ...attackDef, id: Date.now() + Math.random(), type };
      
      setActiveAttacks(prev => [...prev, newAttack]);
      addLog(`INTRUSION: ${attackDef.name} -> ${attackDef.target.toUpperCase()}`, "ALERT");
  };

  const toggleFirewallRule = (protocol) => {
      setFirewallRules(prev => {
          const newState = { ...prev, [protocol]: !prev[protocol] };
          addLog(`FIREWALL: ${protocol} traffic ${newState[protocol] ? 'ALLOWED' : 'BLOCKED'}`, "INFO");
          return newState;
      });
  };

  const deployCountermeasure = (key) => {
      const cm = COUNTERMEASURES[key];
      if (resources < cm.cost || cooldowns[key]) return;

      setResources(prev => prev - cm.cost);
      setCooldowns(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setCooldowns(prev => ({ ...prev, [key]: false })), cm.cooldown);

      const removed = activeAttacks.filter(a => ATTACK_TYPES[a.type].counter === key);
      if (removed.length > 0) {
          setActiveAttacks(prev => prev.filter(a => ATTACK_TYPES[a.type].counter !== key));
          setNodeStatus(prev => {
              const next = { ...prev };
              removed.forEach(a => next[a.target] = Math.min(100, next[a.target] + 30));
              return next;
          });
          addLog(`DEFENSE: ${cm.label} successful.`, "SUCCESS");
      } else {
          addLog(`DEFENSE: ${cm.label} deployed. No effect.`, "WARN");
      }
  };

  // --- VISUALS & ANIMATION ---
  useEffect(() => {
      const animate = () => {
          setPackets(prev => {
              const next = [];
              const { nodes, activeAttacks, firewallRules, isAutoFixing, speed, gameOver } = stateRef.current;
              
              if (speed === 0 && !isAutoFixing) {
                  return prev; // Pause animation if game paused
              }

              // 1. Update Existing
              prev.forEach(p => {
                  p.progress += p.speed * (isAutoFixing ? 1 : speed);
                  if (p.progress < 100) {
                      const src = nodes.find(n => n.id === p.sourceId);
                      const dst = nodes.find(n => n.id === p.targetId);
                      if (src && dst) {
                          p.x = src.x + (dst.x - src.x) * (p.progress / 100);
                          p.y = src.y + (dst.y - src.y) * (p.progress / 100);
                          next.push(p);
                      }
                  }
              });

              // 2. Spawn Attack Packets
              if (!isAutoFixing && !gameOver) {
                  activeAttacks.forEach(att => {
                      if (firewallRules[ATTACK_TYPES[att.type].protocol] === false) return; // Blocked

                      if (Math.random() > 0.985) {
                          const internet = nodes.find(n => n.id === 'internet');
                          next.push({
                              id: Math.random(), sourceId: 'internet', targetId: att.target,
                              x: internet.x, y: internet.y, color: ATTACK_TYPES[att.type].color,
                              progress: 0, speed: 0.5 + Math.random(), type: 'attack',
                              subtype: att.type
                          });
                      }
                  });
              }

              // 3. Spawn Healing Packets
              if (isAutoFixing) {
                  const sentinel = nodes.find(n => n.id === 'ai_sentinel');
                  if (sentinel && Math.random() > 0.7) {
                      const targets = nodes.filter(n => n.id !== 'ai_sentinel' && n.id !== 'internet');
                      const target = targets[Math.floor(Math.random() * targets.length)];
                      next.push({
                          id: Math.random(), sourceId: 'ai_sentinel', targetId: target.id,
                          x: sentinel.x, y: sentinel.y, color: '#3b82f6', progress: 0, speed: 2, type: 'heal'
                      });
                  }
              }

              return next;
          });
          animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // --- CANVAS HANDLERS ---
  const handleCanvasMouseDown = (e) => {
      setDragState({
          isPanning: true,
          isDragging: false,
          nodeId: null,
          startX: e.clientX,
          startY: e.clientY,
          initialPanX: pan.x,
          initialPanY: pan.y
      });
  };

  const handleNodeMouseDown = (e, id) => {
      e.stopPropagation(); 
      const node = nodes.find(n => n.id === id);
      setDragState({
          isDragging: true,
          isPanning: false,
          nodeId: id,
          startX: e.clientX,
          startY: e.clientY,
          initialX: node.x,
          initialY: node.y
      });
      setSelectedNodeId(id);
  };

  const handleMouseMove = (e) => {
      if (dragState.isPanning) {
          const dx = e.clientX - dragState.startX;
          const dy = e.clientY - dragState.startY;
          setPan({ x: dragState.initialPanX + dx, y: dragState.initialPanY + dy });
      } 
      else if (dragState.isDragging) {
          const dx = (e.clientX - dragState.startX) / zoom;
          const dy = (e.clientY - dragState.startY) / zoom;
          
          setNodes(prev => prev.map(n => 
              n.id === dragState.nodeId 
              ? { 
                  ...n, 
                  x: Math.round((dragState.initialX + dx) / 20) * 20, 
                  y: Math.round((dragState.initialY + dy) / 20) * 20 
                } 
              : n
          ));
      }
  };

  const handleMouseUp = () => {
      setDragState({ isDragging: false, isPanning: false, nodeId: null, startX: 0, startY: 0, initialX: 0, initialY: 0, initialPanX: 0, initialPanY: 0 });
  };

  const addLog = (msg, type = "INFO") => {
      setLogs(prev => [{ id: Date.now() + Math.random(), msg, type, time: new Date().toLocaleTimeString().split(' ')[0] }, ...prev].slice(0, 30));
  };

  const renderPacketVisual = (p) => {
      if (p.type === 'hunter_killer') {
          return (
              <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-md rounded-full opacity-75 animate-pulse"></div>
                  <Crosshair className="w-6 h-6 text-white relative z-10 animate-spin" />
              </div>
          );
      }

      if (p.type === 'heal') {
          return (
              <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-sm rounded-full opacity-75"></div>
                  <Plus className="w-5 h-5 text-white relative z-10" />
              </div>
          );
      }
      
      if (p.type === 'blocked') {
          return <XCircle className="w-4 h-4 text-slate-500 opacity-50" />;
      }

      if (p.type === 'attack') {
          const style = "w-5 h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]";
          switch (p.subtype) {
              case 'DDOS': return <Zap className={`${style} text-red-500 fill-red-900`} />;
              case 'SQLI': return <Code className={`${style} text-purple-500`} />;
              case 'BRUTE': return <Unlock className={`${style} text-orange-500`} />;
              case 'MALWARE': return <Skull className={`${style} text-green-500`} />;
              default: return <FileWarning className={`${style} text-white`} />;
          }
      }
      
      return <div className="w-3 h-3 bg-white rounded-full"></div>;
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-green-500 font-sans overflow-hidden">
      
      {/* --- SIDEBAR (Controls) --- */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-20">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-500 animate-pulse" />
              <div>
                  <h1 className="font-black text-xl text-white tracking-tight">CYBER<span className="text-green-500">SENTINEL</span></h1>
                  <div className="text-[10px] text-slate-500 font-mono tracking-widest">SOC SIMULATOR v9.0</div>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* 1. Game Mode */}
              <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Operation Mode</h3>
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setGameMode('DEFENSE')} className={`py-2 text-xs font-bold rounded flex items-center justify-center gap-2 border transition-all ${gameMode === 'DEFENSE' ? 'bg-green-900/30 text-green-400 border-green-500' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                          <Shield className="w-3 h-3" /> DEFENSE
                      </button>
                      <button onClick={() => setGameMode('RED_TEAM')} className={`py-2 text-xs font-bold rounded flex items-center justify-center gap-2 border transition-all ${gameMode === 'RED_TEAM' ? 'bg-red-900/30 text-red-400 border-red-500' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                          <MousePointer2 className="w-3 h-3" /> RED TEAM
                      </button>
                  </div>
              </div>

              {/* 2. Red Team Tools (Conditional) */}
              {gameMode === 'RED_TEAM' && (
                 <div className="bg-red-950/20 border border-red-900/50 p-3 rounded animate-in slide-in-from-left-4">
                     <h3 className="text-red-500 text-xs font-bold mb-2 uppercase flex items-center gap-2">
                         <Skull className="w-3 h-3" /> Attack Vectors
                     </h3>
                     <div className="grid grid-cols-2 gap-2">
                         {Object.entries(ATTACK_TYPES).map(([key, att]) => (
                             <button 
                                key={key}
                                onClick={() => triggerAttack(key)}
                                className="px-2 py-1.5 border border-red-900/30 bg-red-900/10 hover:bg-red-900/30 text-red-400 text-[10px] font-bold rounded text-left transition-all"
                             >
                                 {att.name}
                             </button>
                         ))}
                     </div>
                 </div>
              )}

              {/* 3. Auto-Defense Toggle */}
              <div className={`p-3 rounded border transition-all ${isAutoDefense ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-950/50 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-xs font-bold uppercase flex items-center gap-2 ${isAutoDefense ? 'text-blue-400' : 'text-slate-400'}`}>
                          <ShieldCheck className="w-3 h-3" /> AI Auto-Defense
                      </h3>
                      <button 
                        onClick={() => setIsAutoDefense(!isAutoDefense)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isAutoDefense ? 'bg-blue-500' : 'bg-slate-700'}`}
                      >
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isAutoDefense ? 'left-6' : 'left-1'}`}></div>
                      </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                      {isAutoDefense ? "Autonomous Hunter-Killer Drones Active. Draining Resources." : "Manual Control Only. Enable for autonomous threat neutralization."}
                  </p>
              </div>

              {/* 4. Firewall */}
              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded">
                  <h3 className="text-slate-400 text-xs font-bold mb-2 uppercase flex items-center gap-2">
                      <Router className="w-3 h-3 text-blue-400"/> Firewall Rules
                  </h3>
                  <div className="space-y-1">
                      {Object.keys(firewallRules).map(proto => (
                          <div key={proto} className="flex items-center justify-between py-1">
                              <span className="text-[10px] font-mono font-bold text-slate-300">{proto}</span>
                              <button 
                                  onClick={() => toggleFirewallRule(proto)}
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-all ${firewallRules[proto] ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                              >
                                  {firewallRules[proto] ? 'ALLOW' : 'BLOCK'}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* 5. Threat Monitor */}
              <div className="flex-1 min-h-[150px]">
                  <h3 className="text-slate-400 text-xs font-bold mb-2 uppercase flex items-center gap-2">
                      <Activity className="w-3 h-3 text-yellow-500"/> Live Threats
                  </h3>
                  <div className="space-y-2">
                      {activeAttacks.length === 0 && <div className="text-center py-4 text-slate-700 text-xs italic">System Secure</div>}
                      {activeAttacks.map(att => (
                          <div key={att.id} className="border-l-2 border-red-500 bg-slate-950 p-2 text-[10px] relative animate-in slide-in-from-left-2">
                              <div className="flex justify-between font-bold text-red-400">
                                  <span>{ATTACK_TYPES[att.type].name}</span>
                                  <span className="text-slate-600 font-mono">{ATTACK_TYPES[att.type].protocol}</span>
                              </div>
                              <div className="text-slate-500 mt-0.5 flex justify-between">
                                  <span>Target: {nodes.find(n=>n.id===att.target)?.label}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col relative">
          
          {/* Top Bar */}
          <div className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10">
              {/* Playback */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded border border-slate-800">
                  <button onClick={() => setSpeed(0)} className={`p-1.5 rounded hover:bg-slate-800 ${speed === 0 ? 'text-yellow-400' : 'text-slate-600'}`}><Pause className="w-4 h-4"/></button>
                  <button onClick={() => setSpeed(1)} className={`p-1.5 rounded hover:bg-slate-800 ${speed === 1 ? 'text-green-400' : 'text-slate-600'}`}><Play className="w-4 h-4"/></button>
                  <button onClick={() => setSpeed(4)} className={`p-1.5 rounded hover:bg-slate-800 ${speed === 4 ? 'text-green-400' : 'text-slate-600'}`}><FastForward className="w-4 h-4"/></button>
              </div>

              {/* Central Status */}
              {gameOver && !isAutoFixing ? (
                  <div className="flex items-center gap-2 text-red-500 font-bold animate-pulse">
                      <AlertTriangle className="w-5 h-5" /> CRITICAL SYSTEM FAILURE
                  </div>
              ) : (
                  <div className="flex items-center gap-6 text-sm">
                      <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-500 font-bold">RESOURCES</span>
                          <span className="font-mono font-bold text-white">{Math.floor(resources)}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-800"></div>
                      <div className="flex flex-col items-start">
                          <span className="text-[10px] text-slate-500 font-bold">INTEGRITY</span>
                          <span className={`font-mono font-bold ${systemIntegrity < 40 ? 'text-red-500' : 'text-green-400'}`}>
                              {Math.round(systemIntegrity)}%
                          </span>
                      </div>
                  </div>
              )}

              {/* View Controls */}
              <div className="flex items-center gap-2">
                  <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 text-slate-500 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                  <div className="text-xs font-mono text-slate-600">{Math.round(zoom * 100)}%</div>
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 text-slate-500 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={() => { setPan({x:0,y:0}); setZoom(0.8); }} className="p-2 text-slate-500 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
              </div>
          </div>

          {/* Canvas */}
          <div 
              className={`flex-1 relative overflow-hidden bg-slate-950 ${dragState.isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={canvasRef}
          >
              {/* Dynamic Background */}
              <div 
                  className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
                  style={{ 
                      backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                      backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                      backgroundPosition: `${pan.x}px ${pan.y}px`
                  }}
              />

              {/* Content Container (Zoom/Pan) */}
              <div 
                  style={{ 
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                      transformOrigin: '0 0',
                      width: '100%', height: '100%',
                      pointerEvents: 'none'
                  }}
              >
                  {/* SVG Layer */}
                  <svg className="absolute top-0 left-0 overflow-visible w-full h-full z-0">
                      {connections.map((conn, i) => {
                          const start = nodes.find(n => n.id === conn.from);
                          const end = nodes.find(n => n.id === conn.to);
                          if (!start || !end) return null;
                          
                          const x1 = start.x + 60; // Center of node width (roughly)
                          const y1 = start.y + 40; // Center of node height
                          const x2 = end.x + 60;
                          const y2 = end.y + 40;
                          
                          const dist = Math.abs(x1 - x2);
                          const cpOffset = dist * 0.5;

                          const isHealLine = conn.type === 'heal';

                          return (
                              <g key={i}>
                                  <path 
                                      d={`M ${x1} ${y1} C ${x1 + cpOffset} ${y1}, ${x2 - cpOffset} ${y2}, ${x2} ${y2}`}
                                      fill="none"
                                      stroke={isHealLine ? '#3b82f6' : '#334155'}
                                      strokeWidth={isHealLine ? 4 : 2}
                                      strokeOpacity={0.5}
                                      strokeDasharray={isHealLine ? "10,10" : "0"}
                                      className={isHealLine ? "animate-flow" : ""}
                                  />
                              </g>
                          );
                      })}
                  </svg>

                  {/* Packets */}
                  {packets.map(p => (
                      <div 
                          key={p.id}
                          className="absolute w-6 h-6 z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ left: p.x + 60, top: p.y + 40 }} // Offset to match center line logic
                      >
                          {renderPacketVisual(p)}
                      </div>
                  ))}

                  {/* Nodes */}
                  <div className="relative w-full h-full pointer-events-auto">
                      {nodes.map(node => {
                          const health = nodeStatus[node.id] || 100;
                          const isUnderAttack = activeAttacks.some(a => a.target === node.id);
                          const isSentinel = node.id === 'ai_sentinel';
                          const isSelected = selectedNodeId === node.id;
                          const isDead = health === 0;
                          
                          return (
                              <div 
                                  key={node.id}
                                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                  onClick={() => setSelectedNodeId(node.id)}
                                  className={`absolute w-32 cursor-move bg-slate-900 border-2 transition-all duration-200 rounded-lg p-3 shadow-xl z-10 flex flex-col items-center gap-2 group
                                      ${isDead ? 'border-red-600 shadow-[0_0_30px_red] animate-shake-glitch bg-red-950/20' : 
                                        isUnderAttack ? 'border-yellow-500 shadow-[0_0_15px_yellow] scale-105' : 
                                        isSentinel ? 'border-blue-500 shadow-[0_0_30px_blue] animate-pulse' : 
                                        isSelected ? 'border-white shadow-lg' : 'border-slate-700 hover:border-slate-500'}
                                  `}
                                  style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                              >
                                  <div className={`p-2 rounded ${isSentinel ? 'bg-blue-900/50' : isDead ? 'bg-red-900/50' : 'bg-slate-800'}`}>
                                      {isDead ? (
                                          <XCircle className="w-6 h-6 text-red-500" />
                                      ) : (
                                          <node.icon className={`w-6 h-6 ${isSentinel ? 'text-blue-400' : isDead ? 'text-red-500' : 'text-slate-300'}`} />
                                      )}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide text-center leading-tight">
                                      {node.label}
                                  </div>
                                  
                                  {/* Status Overlay for Dead Node */}
                                  {isDead && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg pointer-events-none">
                                          <span className="text-red-500 font-black text-xs tracking-widest bg-black px-1 border border-red-500">OFFLINE</span>
                                      </div>
                                  )}
                                  
                                  {!isSentinel && node.id !== 'internet' && !isDead && (
                                      <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 mt-1">
                                          <div 
                                              className={`h-full transition-all duration-300 ${health < 40 ? 'bg-red-500' : 'bg-green-500'}`} 
                                              style={{width: `${health}%`}}
                                          />
                                      </div>
                                  )}

                                  {/* Connectors */}
                                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full border border-slate-900"></div>
                                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full border border-slate-900"></div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>

          {/* Right Floating Panels */}
          <div className="absolute top-20 right-6 w-72 flex flex-col gap-4 pointer-events-none">
              
              {/* Node Inspector */}
              <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl pointer-events-auto">
                  <h3 className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                      <Search className="w-4 h-4 text-purple-400"/> Node Inspector
                  </h3>
                  {selectedNodeId ? (
                      (() => {
                          const n = nodes.find(x => x.id === selectedNodeId);
                          const h = nodeStatus[selectedNodeId] || 100;
                          return (
                              <div className="space-y-3 animate-in fade-in">
                                  <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                                      <n.icon className="w-8 h-8 text-slate-500" />
                                      <div>
                                          <div className="font-bold text-white">{n.label}</div>
                                          <div className="text-[10px] text-slate-500 font-mono">{n.detail}</div>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="bg-slate-950 p-2 rounded">
                                          <div className="text-slate-600 font-bold">STATUS</div>
                                          <div className={h > 80 ? 'text-green-400' : h > 30 ? 'text-yellow-400' : 'text-red-500'}>
                                              {h === 0 ? 'OFFLINE' : h < 100 ? 'UNSTABLE' : 'OPERATIONAL'}
                                          </div>
                                      </div>
                                      <div className="bg-slate-950 p-2 rounded">
                                          <div className="text-slate-600 font-bold">LOAD</div>
                                          <div className="text-blue-400">{activeAttacks.filter(a => a.target === n.id).length > 0 ? 'HIGH' : 'NORMAL'}</div>
                                      </div>
                                  </div>
                              </div>
                          );
                      })()
                  ) : (
                      <div className="h-12 flex items-center justify-center text-slate-600 text-xs italic">Select a node to inspect</div>
                  )}
              </div>

              {/* Countermeasures */}
              <div className="bg-slate-900/90 backdrop-blur border border-green-900/30 p-4 rounded-xl shadow-2xl pointer-events-auto max-h-[400px] overflow-y-auto">
                  <h3 className="text-green-500 text-xs font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4"/> Defense Toolkit
                  </h3>
                  <div className="space-y-2">
                      {Object.entries(COUNTERMEASURES).map(([key, cm]) => (
                          <button
                            key={key}
                            onClick={() => deployCountermeasure(key)}
                            disabled={cooldowns[key] || resources < cm.cost || gameOver}
                            className={`
                                w-full group relative overflow-hidden flex flex-col items-start p-3 rounded-lg border transition-all
                                ${cooldowns[key] 
                                    ? 'border-slate-800 bg-slate-950 opacity-50 cursor-not-allowed' 
                                    : resources < cm.cost 
                                        ? 'border-red-900/30 text-slate-600 cursor-not-allowed' 
                                        : 'border-green-800/50 bg-slate-900 hover:bg-green-900/20 hover:border-green-500 cursor-pointer'}
                            `}
                          >
                              {cooldowns[key] && (
                                  <div className="absolute inset-0 bg-slate-800/80 z-20 flex items-center justify-center font-bold text-xs text-slate-500">
                                      RECHARGING
                                  </div>
                              )}
                              <div className="flex justify-between w-full mb-1">
                                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                                      <cm.icon className="w-3 h-3 text-green-500" /> {cm.label}
                                  </div>
                                  <span className="font-mono text-green-600 text-xs">-{cm.cost}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 text-left">{cm.desc}</div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          {/* Bottom Logs (Overlay) */}
          <div className="absolute bottom-6 right-6 w-96 z-30 pointer-events-none">
              <div className="bg-black/80 backdrop-blur border border-slate-800 rounded-lg p-3 h-32 overflow-hidden font-mono text-[9px] shadow-2xl pointer-events-auto flex flex-col">
                  <div className="text-slate-500 border-b border-slate-800 mb-1 pb-1 flex justify-between">
                      <span>TERMINAL_OUTPUT</span>
                      <span className="animate-pulse text-green-500">●</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide pr-1">
                      {logs.map(log => (
                          <div key={log.id} className="flex gap-2 animate-in slide-in-from-left-2">
                              <span className="text-slate-600 shrink-0">[{log.time}]</span>
                              <span className={
                                  log.type === 'ALERT' || log.type === 'CRITICAL' ? 'text-red-400 font-bold' : 
                                  log.type === 'SUCCESS' ? 'text-blue-400' : 
                                  log.type === 'WARN' ? 'text-yellow-600' : 'text-green-600'
                              }>
                                  {log.msg}
                              </span>
                          </div>
                      ))}
                      <div ref={logEndRef} />
                  </div>
              </div>
          </div>

      </div>

      <style>{`
        @keyframes flow {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
        }
        .animate-flow {
            animation: flow 0.5s linear infinite;
        }
        .glitch-text {
            text-shadow: 2px 0 #00ffff, -2px 0 #ff00ff;
        }
        @keyframes shake-glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }
        .animate-shake-glitch {
            animation: shake-glitch 0.2s cubic-bezier(.36,.07,.19,.97) both infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
}
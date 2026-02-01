"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Lock, Unlock, Terminal, AlertTriangle,
  Server, Database, Globe, Wifi, Activity,
  Cpu, Skull, Zap, Eye, Code, RefreshCw, Hexagon,
  Router, Cloud, Move, Bot, Play, Pause, FastForward,
  MousePointer2, FileWarning, Search, XCircle, CheckCircle,
  Power, ZoomIn, ZoomOut, Plus, ShieldCheck, Crosshair,
  Flame, ArrowUp, Sparkles, TrendingUp
} from 'lucide-react';

// ─── CONFIG ──────────────────────────────────────────────────
const MAX_HEALTH = 100;
const BASE_ATTACK_INTERVAL = 2000;

// ─── PHOENIX EVOLUTION TIERS ─────────────────────────────────
// Each collapse upgrades the system. This is the CORE hackathon mechanic.
const PHOENIX_TIERS = {
  0: {
    label: "BASELINE",
    color: "#22c55e",
    badge: "v1.0 — Standard Infrastructure",
    firewall: { hp: 100, regen: 0 },
    autoDefense: false,
    packetSpeed: 1,
    healPower: 0,
    description: "Vanilla network. No self-healing. No learning.",
  },
  1: {
    label: "TIER I — ADAPTIVE",
    color: "#3b82f6",
    badge: "v2.0 — Adaptive Mesh",
    firewall: { hp: 130, regen: 0.05 },
    autoDefense: true,
    packetSpeed: 1.5,
    healPower: 15,
    description: "System survived a breach. Firewall now self-repairs. AI defense wakes up.",
  },
  2: {
    label: "TIER II — PREDICTIVE",
    color: "#a855f7",
    badge: "v3.0 — Predictive Grid",
    firewall: { hp: 160, regen: 0.12 },
    autoDefense: true,
    packetSpeed: 2,
    healPower: 25,
    description: "Two collapses survived. System now predicts attacks 2s before they land.",
  },
  3: {
    label: "TIER III — PHOENIX",
    color: "#f59e0b",
    badge: "v4.0 — Phoenix Core",
    firewall: { hp: 200, regen: 0.2 },
    autoDefense: true,
    packetSpeed: 3,
    healPower: 40,
    description: "Maximum evolution. Immune burst on collapse. Near-invincible.",
  },
};

const INITIAL_NODES = [
  { id: 'internet', label: 'Public Internet', type: 'cloud', x: 80, y: 380, icon: Globe, detail: 'Gateway' },
  { id: 'firewall', label: 'WAF / Firewall', type: 'shield', x: 320, y: 380, icon: Shield, detail: 'Packet Filtering' },
  { id: 'lb', label: 'Load Balancer', type: 'router', x: 560, y: 380, icon: Router, detail: 'Traffic Distribution' },
  { id: 'web', label: 'Web Cluster', type: 'server', x: 800, y: 230, icon: Server, detail: 'Frontend Services' },
  { id: 'app', label: 'App Logic', type: 'server', x: 800, y: 530, icon: Cpu, detail: 'Backend API' },
  { id: 'db', label: 'Primary DB', type: 'data', x: 1050, y: 380, icon: Database, detail: 'Encrypted Storage' },
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
  'DDOS': { name: 'DDoS Flood', damage: 0.8, target: 'firewall', color: '#ef4444', protocol: 'HTTP', cost: 10, counter: 'TRAFFIC_FILTER' },
  'SQLI': { name: 'SQL Injection', damage: 15, target: 'db', color: '#a855f7', protocol: 'SQL', cost: 20, counter: 'SANITIZE_INPUT' },
  'BRUTE': { name: 'Brute Force SSH', damage: 5, target: 'web', color: '#f97316', protocol: 'SSH', cost: 15, counter: 'BAN_IP' },
  'MALWARE': { name: 'RCE / Malware', damage: 20, target: 'app', color: '#22c55e', protocol: 'TCP', cost: 30, counter: 'ISOLATE_NODE' },
};

const COUNTERMEASURES = {
  'TRAFFIC_FILTER': { label: 'Scrub Traffic', icon: Wifi, cost: 15, cooldown: 4000, desc: 'Mitigates Volumetric Attacks' },
  'SANITIZE_INPUT': { label: 'Deploy WAF Rule', icon: Code, cost: 25, cooldown: 6000, desc: 'Blocks Malformed Queries' },
  'BAN_IP': { label: 'Blacklist IP', icon: Lock, cost: 5, cooldown: 2000, desc: 'Stops Brute Force Sources' },
  'ISOLATE_NODE': { label: 'Air Gap System', icon: Unlock, cost: 40, cooldown: 10000, desc: 'Emergency Containment' },
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function CyberSecuritySim() {
  // ── Core State
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [systemIntegrity, setSystemIntegrity] = useState(100);
  const [resources, setResources] = useState(70);
  const [gameOver, setGameOver] = useState(false);

  // ── Gameplay
  const [gameMode, setGameMode] = useState('DEFENSE');
  const [speed, setSpeed] = useState(1);
  const [activeAttacks, setActiveAttacks] = useState([]);
  const [nodeStatus, setNodeStatus] = useState(
    INITIAL_NODES.reduce((acc, n) => ({ ...acc, [n.id]: 100 }), {})
  );
  const [hackerProgress, setHackerProgress] = useState(0);
  const [firewallRules, setFirewallRules] = useState({ HTTP: true, SSH: true, SQL: true, TCP: true });
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // ── Phoenix Evolution
  const [phoenixTier, setPhoenixTier] = useState(0);
  const [isPhoenixCrash, setIsPhoenixCrash] = useState(false); // full crash animation phase
  const [phoenixPhase, setPhoenixPhase] = useState(''); // 'CRASHING','REBUILDING','UPGRADING','AWAKENING',''
  const [collapseCount, setCollapseCount] = useState(0);
  const [showTierUpBanner, setShowTierUpBanner] = useState(false);

  // ── Auto Defense
  const [isAutoDefense, setIsAutoDefense] = useState(false);
  const mitigatedAttacksRef = useRef(new Set());

  // ── Predictive (Tier 2+)
  const [predictedAttacks, setPredictedAttacks] = useState([]); // { type, target, eta }

  // ── Viewport
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 30, y: 20 });

  // ── Effects
  const [logs, setLogs] = useState([]);
  const [packets, setPackets] = useState([]);
  const [cooldowns, setCooldowns] = useState({});
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [shockwaveActive, setShockwaveActive] = useState(false);
  const [particleBurst, setParticleBurst] = useState(false);

  // ── Interaction
  const [dragState, setDragState] = useState({
    isDragging: false, isPanning: false, nodeId: null,
    startX: 0, startY: 0, initialX: 0, initialY: 0, initialPanX: 0, initialPanY: 0
  });

  // ── Refs
  const logEndRef = useRef(null);
  const gameLoopRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({});

  const addLog = useCallback((msg, type = "INFO") => {
    setLogs(prev => [{ id: Date.now() + Math.random(), msg, type, time: new Date().toLocaleTimeString().split(' ')[0] }, ...prev].slice(0, 40));
  }, []);

  // ── Sync refs
  useEffect(() => {
    stateRef.current = {
      nodes, activeAttacks, speed, firewallRules, gameOver,
      nodeStatus, isAutoDefense, resources, phoenixTier, isPhoenixCrash, predictedAttacks
    };
  }, [nodes, activeAttacks, speed, firewallRules, gameOver, nodeStatus, isAutoDefense, resources, phoenixTier, isPhoenixCrash, predictedAttacks]);

  // ── Sync auto-defense toggle with phoenix tier
  useEffect(() => {
    const tier = PHOENIX_TIERS[phoenixTier];
    if (tier.autoDefense) setIsAutoDefense(true);
  }, [phoenixTier]);

  // ═══════════════════════════════════════════════════════════
  //  PHOENIX PROTOCOL — THE HACKATHON CORE MECHANIC
  //  When the system collapses, instead of a simple "game over",
  //  the system CRASHES → REBUILDS → UPGRADES → AWAKENS
  //  Each cycle the network becomes strictly better than before.
  // ═══════════════════════════════════════════════════════════
  const triggerPhoenixCrash = useCallback(() => {
    setIsPhoenixCrash(true);
    setGameOver(true);
    setPhoenixPhase('CRASHING');
    setGlitchIntensity(1);
    setShockwaveActive(true);

    const nextTier = Math.min(phoenixTier + 1, 3);
    const newCollapses = collapseCount + 1;
    setCollapseCount(newCollapses);

    addLog("═══════════════════════════════════════", "CRITICAL");
    addLog("  CATASTROPHIC SYSTEM FAILURE DETECTED", "CRITICAL");
    addLog("  PHOENIX PROTOCOL INITIATED ...", "CRITICAL");
    addLog("═══════════════════════════════════════", "CRITICAL");

    // Phase 1: CRASHING (2.5s) — everything visually disintegrates
    setTimeout(() => {
      setNodeStatus(prev => {
        const dead = {};
        Object.keys(prev).forEach(k => { dead[k] = 0; });
        return dead;
      });
      setActiveAttacks([]);
      setHackerProgress(100);
      setGlitchIntensity(1);
      addLog("  All subsystems offline.", "CRITICAL");
    }, 1200);

    // Phase 2: REBUILDING (4.5s total) — dark, then nodes flicker back
    setTimeout(() => {
      setPhoenixPhase('REBUILDING');
      setGlitchIntensity(0.6);
      addLog("  Initiating memory reformation ...", "INFO");
      addLog("  Reconstructing topology from backup ...", "INFO");

      // Stagger node revival
      const order = ['firewall', 'lb', 'web', 'app', 'db'];
      order.forEach((id, i) => {
        setTimeout(() => {
          setNodeStatus(prev => ({ ...prev, [id]: 40 }));
          addLog(`  Node [${id.toUpperCase()}] — online (degraded)`, "WARN");
        }, 400 * (i + 1));
      });
    }, 2500);

    // Phase 3: UPGRADING (6.5s total) — tier banner, stats improve
    setTimeout(() => {
      setPhoenixPhase('UPGRADING');
      setPhoenixTier(nextTier);
      setShowTierUpBanner(true);
      setParticleBurst(true);
      const tier = PHOENIX_TIERS[nextTier];
      addLog(`  ▲ EVOLUTION: Upgraded to ${tier.label}`, "SUCCESS");
      addLog(`  ▲ ${tier.description}`, "SUCCESS");
      setTimeout(() => setParticleBurst(false), 1800);
      setTimeout(() => setShowTierUpBanner(false), 3500);
    }, 4500);

    // Phase 4: AWAKENING (8s total) — full heal, resume
    setTimeout(() => {
      setPhoenixPhase('AWAKENING');
      setGlitchIntensity(0.2);

      // Full restore with tier bonuses
      setNodeStatus(prev => {
        const healed = {};
        Object.keys(prev).forEach(k => { healed[k] = 100; });
        return healed;
      });
      setHackerProgress(0);
      setSystemIntegrity(100);
      setResources(80);
      setActiveAttacks([]);
      setPredictedAttacks([]);
      setFirewallRules({ HTTP: true, SSH: true, SQL: true, TCP: true });
      setCooldowns({});
      mitigatedAttacksRef.current.clear();

      addLog("  All systems restored at ENHANCED specification.", "SUCCESS");
      addLog(`  Running on ${PHOENIX_TIERS[nextTier].badge}`, "SUCCESS");
      addLog("═══════════════════════════════════════", "SUCCESS");
    }, 6500);

    // Phase 5: RESUME (8.5s)
    setTimeout(() => {
      setPhoenixPhase('');
      setGlitchIntensity(0);
      setShockwaveActive(false);
      setGameOver(false);
      setIsPhoenixCrash(false);
      addLog("  PHOENIX PROTOCOL COMPLETE. System live.", "SUCCESS");
    }, 8000);

  }, [phoenixTier, collapseCount, addLog]);

  // ── Watch for collapse condition
  useEffect(() => {
    if (gameOver || isPhoenixCrash) return;
    if (systemIntegrity <= 0 || hackerProgress >= 100) {
      triggerPhoenixCrash();
    }
  }, [systemIntegrity, hackerProgress, gameOver, isPhoenixCrash, triggerPhoenixCrash]);

  // ═══════════════════════════════════════════════════════════
  //  AUTO-DEFENSE (activates at Tier 1+)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isAutoDefense || gameOver || isPhoenixCrash) return;
    const interval = setInterval(() => {
      const { activeAttacks, resources, nodes, phoenixTier } = stateRef.current;
      const tier = PHOENIX_TIERS[phoenixTier];
      activeAttacks.forEach(attack => {
        if (mitigatedAttacksRef.current.has(attack.id)) return;
        const cmKey = ATTACK_TYPES[attack.type].counter;
        const cm = COUNTERMEASURES[cmKey];
        if (resources >= cm.cost) {
          mitigatedAttacksRef.current.add(attack.id);
          const reactionDelay = Math.max(200, 600 - phoenixTier * 150); // faster at higher tiers
          setTimeout(() => {
            if (stateRef.current.gameOver) return;
            setResources(prev => Math.max(0, prev - cm.cost));
            const fwNode = nodes.find(n => n.id === 'firewall');
            if (fwNode) {
              setPackets(prev => [...prev, {
                id: Math.random(), sourceId: 'firewall', targetId: attack.target,
                x: fwNode.x, y: fwNode.y, color: '#3b82f6',
                progress: 0, speed: 2 * tier.packetSpeed, type: 'hunter_killer'
              }]);
            }
            setTimeout(() => {
              setActiveAttacks(prev => prev.filter(a => a.id !== attack.id));
              setNodeStatus(prev => ({
                ...prev,
                [attack.target]: Math.min(100, prev[attack.target] + tier.healPower)
              }));
              addLog(`AI DEFENSE [T${phoenixTier}]: Neutralized ${ATTACK_TYPES[attack.type].name}`, "SUCCESS");
              mitigatedAttacksRef.current.delete(attack.id);
            }, 400);
          }, reactionDelay);
        }
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isAutoDefense, gameOver, isPhoenixCrash, addLog]);

  // ═══════════════════════════════════════════════════════════
  //  PREDICTIVE ENGINE (Tier 2+)
  //  Predicts incoming attacks 2 seconds ahead based on history
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (phoenixTier < 2 || gameOver || isPhoenixCrash) return;
    const interval = setInterval(() => {
      if (stateRef.current.speed === 0) return;
      // Simulate: randomly predict an attack type that will come
      if (Math.random() < 0.3) {
        const keys = Object.keys(ATTACK_TYPES);
        const type = keys[Math.floor(Math.random() * keys.length)];
        const att = ATTACK_TYPES[type];
        const pred = { id: Date.now() + Math.random(), type, target: att.target, name: att.name, eta: 2 };
        setPredictedAttacks(prev => [...prev.slice(-3), pred]);
        addLog(`PREDICTIVE: Anomaly detected — ${att.name} expected in ~2s`, "WARN");

        // After 2s, if an attack of that type actually arrives, highlight it
        setTimeout(() => {
          setPredictedAttacks(prev => prev.filter(p => p.id !== pred.id));
        }, 2000);
      }
    }, 1500 / (stateRef.current.speed || 1));
    return () => clearInterval(interval);
  }, [phoenixTier, gameOver, isPhoenixCrash]);

  // ═══════════════════════════════════════════════════════════
  //  SIMULATION LOOP
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (gameOver || isPhoenixCrash) return;
    const gameLoop = setInterval(() => {
      if (stateRef.current.speed === 0) return;
      tick();
    }, 100 / (speed || 1));

    const attackLoop = setInterval(() => {
      if (stateRef.current.speed > 0 && gameMode === 'DEFENSE') {
        launchRandomAttack();
      }
    }, BASE_ATTACK_INTERVAL / (speed || 1));

    return () => { clearInterval(gameLoop); clearInterval(attackLoop); };
  }, [gameOver, isPhoenixCrash, speed, gameMode]);

  const tick = () => {
    const { activeAttacks, firewallRules, nodeStatus, phoenixTier } = stateRef.current;
    const tier = PHOENIX_TIERS[phoenixTier];

    // Resources regen
    setResources(prev => Math.min(100, prev + 0.1 * speed));

    // Firewall regen (Tier 1+)
    if (tier.firewall.regen > 0) {
      setNodeStatus(prev => ({
        ...prev,
        firewall: Math.min(100, (prev.firewall || 0) + tier.firewall.regen)
      }));
    }

    // Process attacks
    const nextStatus = { ...nodeStatus };
    activeAttacks.forEach(attack => {
      const proto = ATTACK_TYPES[attack.type].protocol;
      if (firewallRules[proto] === false) return;
      const dmg = ATTACK_TYPES[attack.type].damage / 10;
      if (nextStatus[attack.target] !== undefined) {
        nextStatus[attack.target] = Math.max(0, nextStatus[attack.target] - dmg);
      }
    });
    setNodeStatus(nextStatus);

    // Integrity
    const internal = INITIAL_NODES.filter(n => n.id !== 'internet');
    const avg = internal.reduce((a, n) => a + (nextStatus[n.id] || 0), 0) / internal.length;
    setSystemIntegrity(avg);

    // Hacker progress
    const unblocked = activeAttacks.filter(a => firewallRules[ATTACK_TYPES[a.type].protocol] !== false);
    setHackerProgress(prev => Math.max(0, Math.min(100, prev + (unblocked.length > 0 ? 0.1 : -0.05))));
  };

  // ─── ACTIONS ─────────────────────────────────────────────
  const launchRandomAttack = () => {
    if (Math.random() > 0.55) {
      const keys = Object.keys(ATTACK_TYPES);
      triggerAttack(keys[Math.floor(Math.random() * keys.length)]);
    }
  };

  const triggerAttack = (type) => {
    const def = ATTACK_TYPES[type];
    setActiveAttacks(prev => [...prev, { ...def, id: Date.now() + Math.random(), type }]);
    addLog(`INTRUSION: ${def.name} → ${def.target.toUpperCase()}`, "ALERT");
  };

  const toggleFirewallRule = (proto) => {
    setFirewallRules(prev => {
      const next = { ...prev, [proto]: !prev[proto] };
      addLog(`FIREWALL: ${proto} → ${next[proto] ? 'ALLOW' : 'BLOCK'}`, "INFO");
      return next;
    });
  };

  const deployCountermeasure = (key) => {
    const cm = COUNTERMEASURES[key];
    if (resources < cm.cost || cooldowns[key] || gameOver) return;
    setResources(prev => prev - cm.cost);
    setCooldowns(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCooldowns(prev => ({ ...prev, [key]: false })), cm.cooldown);

    const removed = activeAttacks.filter(a => ATTACK_TYPES[a.type].counter === key);
    if (removed.length > 0) {
      setActiveAttacks(prev => prev.filter(a => ATTACK_TYPES[a.type].counter !== key));
      const tier = PHOENIX_TIERS[phoenixTier];
      setNodeStatus(prev => {
        const next = { ...prev };
        removed.forEach(a => { next[a.target] = Math.min(100, next[a.target] + 20 + tier.healPower); });
        return next;
      });
      addLog(`DEFENSE: ${cm.label} — ${removed.length} threat(s) neutralized.`, "SUCCESS");
    } else {
      addLog(`DEFENSE: ${cm.label} deployed. No active threat matched.`, "WARN");
    }
  };

  // ─── ANIMATION LOOP ──────────────────────────────────────
  useEffect(() => {
    const animate = () => {
      setPackets(prev => {
        const { nodes, activeAttacks, firewallRules, isPhoenixCrash, speed, gameOver } = stateRef.current;
        if (speed === 0 && !isPhoenixCrash) return prev;
        const next = [];

        prev.forEach(p => {
          p.progress += p.speed * (isPhoenixCrash ? 1 : speed);
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

        if (!isPhoenixCrash && !gameOver) {
          activeAttacks.forEach(att => {
            if (firewallRules[ATTACK_TYPES[att.type].protocol] === false) return;
            if (Math.random() > 0.98) {
              const internet = nodes.find(n => n.id === 'internet');
              if (internet) {
                next.push({
                  id: Math.random(), sourceId: 'internet', targetId: att.target,
                  x: internet.x, y: internet.y, color: ATTACK_TYPES[att.type].color,
                  progress: 0, speed: 0.5 + Math.random(), type: 'attack', subtype: att.type
                });
              }
            }
          });
        }

        // Phoenix rebuild healing packets
        if (isPhoenixCrash && stateRef.current.speed !== 0) {
          const targets = nodes.filter(n => n.id !== 'internet');
          if (targets.length && Math.random() > 0.6) {
            const t = targets[Math.floor(Math.random() * targets.length)];
            const src = nodes.find(n => n.id === 'firewall') || targets[0];
            next.push({
              id: Math.random(), sourceId: src.id, targetId: t.id,
              x: src.x, y: src.y, color: '#f59e0b',
              progress: 0, speed: 3, type: 'phoenix_heal'
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

  // ─── CANVAS HANDLERS ─────────────────────────────────────
  const handleCanvasMouseDown = (e) => {
    setDragState({ isPanning: true, isDragging: false, nodeId: null, startX: e.clientX, startY: e.clientY, initialPanX: pan.x, initialPanY: pan.y, initialX: 0, initialY: 0 });
  };
  const handleNodeMouseDown = (e, id) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    setDragState({ isDragging: true, isPanning: false, nodeId: id, startX: e.clientX, startY: e.clientY, initialX: node.x, initialY: node.y, initialPanX: 0, initialPanY: 0 });
    setSelectedNodeId(id);
  };
  const handleMouseMove = (e) => {
    if (dragState.isPanning) {
      setPan({ x: dragState.initialPanX + (e.clientX - dragState.startX), y: dragState.initialPanY + (e.clientY - dragState.startY) });
    } else if (dragState.isDragging) {
      const dx = (e.clientX - dragState.startX) / zoom;
      const dy = (e.clientY - dragState.startY) / zoom;
      setNodes(prev => prev.map(n =>
        n.id === dragState.nodeId
          ? { ...n, x: Math.round((dragState.initialX + dx) / 20) * 20, y: Math.round((dragState.initialY + dy) / 20) * 20 }
          : n
      ));
    }
  };
  const handleMouseUp = () => {
    setDragState({ isDragging: false, isPanning: false, nodeId: null, startX: 0, startY: 0, initialX: 0, initialY: 0, initialPanX: 0, initialPanY: 0 });
  };

  // ─── PACKET VISUALS ──────────────────────────────────────
  const renderPacket = (p) => {
    if (p.type === 'hunter_killer') return (
      <div className="relative">
        <div className="absolute inset-0 bg-blue-400 blur-md rounded-full opacity-80" style={{ transform: 'scale(1.5)' }}></div>
        <Crosshair className="w-5 h-5 text-white relative z-10" style={{ animation: 'spin 0.4s linear infinite' }} />
      </div>
    );
    if (p.type === 'phoenix_heal') return (
      <div className="relative">
        <div className="absolute inset-0 rounded-full opacity-90" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'scale(2)' }}></div>
        <Flame className="w-5 h-5 text-orange-300 relative z-10" style={{ animation: 'pulse 0.3s ease infinite alternate' }} />
      </div>
    );
    if (p.type === 'heal') return (
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-sm rounded-full opacity-60"></div>
        <Plus className="w-4 h-4 text-white relative z-10" />
      </div>
    );
    if (p.type === 'attack') {
      const icons = { DDOS: Zap, SQLI: Code, BRUTE: Unlock, MALWARE: Skull };
      const Icon = icons[p.subtype] || FileWarning;
      const colors = { DDOS: 'text-red-500', SQLI: 'text-purple-500', BRUTE: 'text-orange-500', MALWARE: 'text-green-500' };
      return <Icon className={`w-4 h-4 ${colors[p.subtype] || 'text-white'} drop-shadow-[0_0_6px_currentColor]`} />;
    }
    return <div className="w-2 h-2 bg-white rounded-full" />;
  };

  // ─── DERIVED ─────────────────────────────────────────────
  const tier = PHOENIX_TIERS[phoenixTier];
  const tierColor = tier.color;

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen w-full text-sm overflow-hidden" style={{ background: '#0a0e1a', color: '#cbd5e1', fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}>

      {/* ── Glitch overlay during crash ── */}
      {glitchIntensity > 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none" style={{ opacity: glitchIntensity * 0.15 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239,68,68,0.08) 2px, rgba(239,68,68,0.08) 4px)' }} />
        </div>
      )}

      {/* ── Shockwave ring ── */}
      {shockwaveActive && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: '2px solid rgba(239,68,68,0.6)',
            animation: 'shockwave 2.5s ease-out infinite',
            boxShadow: '0 0 40px rgba(239,68,68,0.2)'
          }} />
        </div>
      )}

      {/* ── Tier-Up Banner ── */}
      {showTierUpBanner && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 70%)' }}>
          <div style={{ animation: 'tierBannerIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards', opacity: 0, transform: 'scale(0.6)' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-8 h-8" style={{ color: tierColor, filter: `drop-shadow(0 0 12px ${tierColor})` }} />
                <Flame className="w-12 h-12" style={{ color: tierColor, filter: `drop-shadow(0 0 20px ${tierColor})` }} />
                <Flame className="w-8 h-8" style={{ color: tierColor, filter: `drop-shadow(0 0 12px ${tierColor})` }} />
              </div>
              <div className="text-xs tracking-widest uppercase" style={{ color: tierColor, opacity: 0.7 }}>Phoenix Protocol — Evolution</div>
              <div className="text-3xl font-black tracking-tight text-white" style={{ textShadow: `0 0 30px ${tierColor}` }}>
                {tier.label}
              </div>
              <div className="text-xs text-center max-w-xs" style={{ color: tierColor, opacity: 0.8 }}>{tier.description}</div>
              <div className="mt-2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: `${tierColor}22`, border: `1px solid ${tierColor}55`, color: tierColor }}>
                {tier.badge}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
         ═════════════════════════════════════════════════════ */}
      <div className="w-76 flex flex-col shadow-2xl" style={{ width: 296, background: '#0d1117', borderRight: '1px solid #1e293b', zIndex: 20 }}>

        {/* Header */}
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="relative">
            <Shield className="w-7 h-7" style={{ color: tierColor, filter: `drop-shadow(0 0 8px ${tierColor})` }} />
          </div>
          <div>
            <div className="font-black text-lg text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              CYBER<span style={{ color: tierColor }}>SENTINEL</span>
            </div>
            <div className="text-[9px] tracking-widest uppercase" style={{ color: '#475569' }}>SOC Simulator — Phoenix Edition</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ scrollbarWidth: 'none' }}>

          {/* Phoenix Tier Badge */}
          <div className="rounded-lg p-3" style={{ background: `${tierColor}0a`, border: `1px solid ${tierColor}33` }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Flame className="w-3 h-3" style={{ color: tierColor }} />
                <span className="text-xs font-bold" style={{ color: tierColor }}>{tier.label}</span>
              </div>
              <span className="text-[9px] font-mono" style={{ color: '#64748b' }}>Collapses: {collapseCount}</span>
            </div>
            <div className="text-[9px] leading-relaxed" style={{ color: '#64748b' }}>{tier.badge}</div>
            {/* Tier progress dots */}
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500" style={{
                  background: i <= phoenixTier ? tierColor : '#1e293b',
                  boxShadow: i === phoenixTier ? `0 0 6px ${tierColor}` : 'none'
                }} />
              ))}
            </div>
          </div>

          {/* Mode Toggle */}
          <div>
            <div className="text-[9px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#475569' }}>Operation Mode</div>
            <div className="flex gap-1.5">
              {[['DEFENSE', Shield, '#22c55e'], ['RED_TEAM', Skull, '#ef4444']].map(([mode, Icon, c]) => (
                <button key={mode} onClick={() => setGameMode(mode)}
                  className="flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all"
                  style={{
                    background: gameMode === mode ? `${c}15` : '#0d1117',
                    border: `1px solid ${gameMode === mode ? c : '#1e293b'}`,
                    color: gameMode === mode ? c : '#64748b'
                  }}>
                  <Icon className="w-3 h-3" /> {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Red Team Attacks */}
          {gameMode === 'RED_TEAM' && (
            <div className="rounded-lg p-3" style={{ background: '#1f0a0a', border: '1px solid #3b1010' }}>
              <div className="text-[9px] font-bold tracking-widest mb-2 flex items-center gap-1.5" style={{ color: '#ef4444' }}>
                <Skull className="w-3 h-3" /> ATTACK VECTORS
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(ATTACK_TYPES).map(([key, att]) => (
                  <button key={key} onClick={() => triggerAttack(key)}
                    className="px-2 py-1.5 rounded text-[9px] font-bold text-left transition-all"
                    style={{ background: '#2a0f0f', border: '1px solid #3b1a1a', color: '#f87171' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3b1515'; e.currentTarget.style.borderColor = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#2a0f0f'; e.currentTarget.style.borderColor = '#3b1a1a'; }}>
                    {att.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Auto-Defense */}
          <div className="rounded-lg p-3" style={{
            background: isAutoDefense ? '#0a1628' : '#0d1117',
            border: `1px solid ${isAutoDefense ? '#3b82f6' : '#1e293b'}`
          }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" style={{ color: isAutoDefense ? '#3b82f6' : '#64748b' }} />
                <span className="text-[10px] font-bold" style={{ color: isAutoDefense ? '#60a5fa' : '#94a3b8' }}>AI Auto-Defense</span>
                {phoenixTier >= 1 && <span className="text-[8px] px-1 rounded" style={{ background: '#3b82f622', color: '#60a5fa' }}>T{phoenixTier}+</span>}
              </div>
              <button onClick={() => setIsAutoDefense(!isAutoDefense)}
                className="w-9 h-4.5 rounded-full relative transition-colors" style={{ background: isAutoDefense ? '#3b82f6' : '#334155', height: 18 }}>
                <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: isAutoDefense ? 20 : 2 }} />
              </button>
            </div>
            <div className="text-[9px]" style={{ color: '#64748b' }}>
              {isAutoDefense ? "Hunter-Killer drones active. Reaction speed scales with tier." : "Enable for autonomous threat neutralization."}
            </div>
          </div>

          {/* Firewall */}
          <div className="rounded-lg p-3" style={{ background: '#0d1117', border: '1px solid #1e293b' }}>
            <div className="text-[9px] font-bold tracking-widest mb-2 flex items-center gap-1.5" style={{ color: '#60a5fa' }}>
              <Router className="w-3 h-3" /> FIREWALL RULES
            </div>
            <div className="space-y-1">
              {Object.keys(firewallRules).map(proto => (
                <div key={proto} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color: '#cbd5e1' }}>{proto}</span>
                  <button onClick={() => toggleFirewallRule(proto)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded transition-all"
                    style={{
                      background: firewallRules[proto] ? '#16a34a15' : '#dc262615',
                      border: `1px solid ${firewallRules[proto] ? '#16a34a44' : '#dc262644'}`,
                      color: firewallRules[proto] ? '#4ade80' : '#f87171'
                    }}>
                    {firewallRules[proto] ? 'ALLOW' : 'BLOCK'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Warnings (Tier 2+) */}
          {phoenixTier >= 2 && (
            <div className="rounded-lg p-3" style={{ background: '#1a0f2e', border: '1px solid #4c1d95' }}>
              <div className="text-[9px] font-bold tracking-widest mb-2 flex items-center gap-1.5" style={{ color: '#a78bfa' }}>
                <Eye className="w-3 h-3" /> PREDICTIVE INTEL
                <span className="text-[8px] px-1 rounded" style={{ background: '#4c1d9522', color: '#a78bfa' }}>TIER 2</span>
              </div>
              {predictedAttacks.length === 0 ? (
                <div className="text-[9px] text-center py-2" style={{ color: '#475569' }}>No anomalies detected</div>
              ) : (
                <div className="space-y-1.5">
                  {predictedAttacks.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: '#2d1b4e', border: '1px solid #4c1d9544' }}>
                      <AlertTriangle className="w-3 h-3" style={{ color: '#fbbf24' }} />
                      <div className="flex-1">
                        <div className="text-[9px] font-bold" style={{ color: '#e9d5ff' }}>{p.name}</div>
                        <div className="text-[8px]" style={{ color: '#7c3aed' }}>Target: {p.target.toUpperCase()} · ~2s</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live Threats */}
          <div>
            <div className="text-[9px] font-bold tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
              <Activity className="w-3 h-3" /> LIVE THREATS
              {activeAttacks.length > 0 && (
                <span className="ml-auto px-1.5 py-0.25 rounded-full text-[8px] font-bold" style={{ background: '#ef444422', color: '#f87171', border: '1px solid #ef444444' }}>{activeAttacks.length}</span>
              )}
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {activeAttacks.length === 0 && <div className="text-center py-3 text-[9px]" style={{ color: '#334155' }}>— System Secure —</div>}
              {activeAttacks.map(att => (
                <div key={att.id} className="px-2 py-1.5 rounded" style={{ background: '#1a0a0a', borderLeft: `3px solid ${ATTACK_TYPES[att.type].color}` }}>
                  <div className="flex justify-between text-[9px] font-bold" style={{ color: ATTACK_TYPES[att.type].color }}>
                    <span>{ATTACK_TYPES[att.type].name}</span>
                    <span style={{ color: '#475569' }}>{ATTACK_TYPES[att.type].protocol}</span>
                  </div>
                  <div className="text-[8px] mt-0.5" style={{ color: '#64748b' }}>→ {nodes.find(n => n.id === att.target)?.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CANVAS AREA
         ═════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col relative">

        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-5" style={{ background: '#0d1117', borderBottom: '1px solid #1e293b', zIndex: 10 }}>
          {/* Playback */}
          <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: '#0a0e1a', border: '1px solid #1e293b' }}>
            {[[0, Pause], [1, Play], [4, FastForward]].map(([s, Icon]) => (
              <button key={s} onClick={() => setSpeed(s)}
                className="p-1.5 rounded transition-all"
                style={{ background: speed === s ? '#1e293b' : 'transparent', color: speed === s ? (s === 0 ? '#facc15' : '#4ade80') : '#64748b' }}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Center — status */}
          <div className="flex items-center gap-5">
            {/* Integrity */}
            <div className="flex flex-col items-center">
              <div className="text-[8px] tracking-widest uppercase" style={{ color: '#475569' }}>Integrity</div>
              <div className="text-sm font-black" style={{ color: systemIntegrity < 40 ? '#ef4444' : systemIntegrity < 70 ? '#f59e0b' : '#4ade80', textShadow: `0 0 8px ${systemIntegrity < 40 ? '#ef4444' : systemIntegrity < 70 ? '#f59e0b' : '#4ade80'}44` }}>
                {Math.round(systemIntegrity)}%
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: '#1e293b' }} />
            {/* Resources */}
            <div className="flex flex-col items-center">
              <div className="text-[8px] tracking-widest uppercase" style={{ color: '#475569' }}>Resources</div>
              <div className="text-sm font-black text-white">{Math.floor(resources)}</div>
            </div>
            <div style={{ width: 1, height: 28, background: '#1e293b' }} />
            {/* Hacker */}
            <div className="flex flex-col items-center">
              <div className="text-[8px] tracking-widest uppercase" style={{ color: '#475569' }}>Threat Level</div>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{
                  width: `${hackerProgress}%`,
                  background: hackerProgress > 70 ? '#ef4444' : hackerProgress > 40 ? '#f59e0b' : '#22c55e',
                  boxShadow: hackerProgress > 70 ? '0 0 6px #ef4444' : 'none'
                }} />
              </div>
            </div>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.min(1.8, z + 0.1))} className="p-1.5 rounded transition-all" style={{ color: '#64748b' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-mono" style={{ color: '#475569', minWidth: 34, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1.5 rounded transition-all" style={{ color: '#64748b' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => { setPan({ x: 30, y: 20 }); setZoom(0.75); }} className="ml-1 p-1.5 rounded" style={{ color: '#64748b' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden" style={{ background: '#0a0e1a', cursor: dragState.isPanning ? 'grabbing' : 'grab' }}
          onMouseDown={handleCanvasMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} ref={canvasRef}>

          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
            backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            opacity: 0.6
          }} />

          {/* Crash vignette */}
          {glitchIntensity > 0 && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,${glitchIntensity * 0.12}) 100%)`,
              zIndex: 1
            }} />
          )}

          {/* Transform container */}
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0', width: '100%', height: '100%', pointerEvents: 'none'
          }}>

            {/* SVG Connections */}
            <svg className="absolute top-0 left-0 overflow-visible" style={{ width: '100%', height: '100%', zIndex: 0 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {connections.map((conn, i) => {
                const s = nodes.find(n => n.id === conn.from);
                const e = nodes.find(n => n.id === conn.to);
                if (!s || !e) return null;
                const x1 = s.x + 64, y1 = s.y + 38, x2 = e.x + 64, y2 = e.y + 38;
                const cpOff = Math.abs(x1 - x2) * 0.4;
                const isAttacked = activeAttacks.some(a => a.target === conn.to);
                return (
                  <path key={i}
                    d={`M ${x1} ${y1} C ${x1 + cpOff} ${y1}, ${x2 - cpOff} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isAttacked ? '#f59e0b' : '#1e293b'}
                    strokeWidth={isAttacked ? 2.5 : 1.5}
                    strokeOpacity={isAttacked ? 0.7 : 0.4}
                    filter={isAttacked ? 'url(#glow)' : 'none'}
                  />
                );
              })}
            </svg>

            {/* Packets */}
            {packets.map(p => (
              <div key={p.id} className="absolute pointer-events-none" style={{ left: p.x + 64, top: p.y + 38, transform: 'translate(-50%,-50%)', zIndex: 20 }}>
                {renderPacket(p)}
              </div>
            ))}

            {/* Nodes */}
            <div className="relative" style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
              {nodes.map(node => {
                const hp = nodeStatus[node.id] ?? 100;
                const attacked = activeAttacks.some(a => a.target === node.id);
                const dead = hp === 0;
                const isSelected = selectedNodeId === node.id;
                const predicted = predictedAttacks.some(p => p.target === node.id);
                const Icon = node.icon;

                let borderColor = '#1e293b';
                let shadow = 'none';
                if (dead) { borderColor = '#ef4444'; shadow = '0 0 20px #ef444433'; }
                else if (attacked) { borderColor = '#f59e0b'; shadow = '0 0 14px #f59e0b44'; }
                else if (predicted) { borderColor = '#a78bfa'; shadow = '0 0 10px #a78bfa33'; }
                else if (isSelected) { borderColor = '#60a5fa'; shadow = '0 0 8px #60a5fa33'; }

                return (
                  <div key={node.id}
                    onMouseDown={e => handleNodeMouseDown(e, node.id)}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="absolute rounded-xl transition-all duration-200"
                    style={{
                      left: node.x, top: node.y, width: 128,
                      background: dead ? '#1a0808' : '#111827',
                      border: `1.5px solid ${borderColor}`,
                      boxShadow: shadow,
                      cursor: 'move',
                      zIndex: 10,
                      animation: dead ? 'shake 0.3s infinite' : attacked ? 'pulse-border 1.5s infinite' : 'none'
                    }}>
                    {/* Predicted warning badge */}
                    {predicted && !dead && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.25 rounded-full" style={{ background: '#1a0f2e', border: '1px solid #7c3aed', zIndex: 2 }}>
                        <Eye className="w-2.5 h-2.5" style={{ color: '#a78bfa' }} />
                        <span className="text-[7px] font-bold" style={{ color: '#a78bfa' }}>PREDICTED</span>
                      </div>
                    )}

                    <div className="p-2.5">
                      <div className="flex justify-center mb-1.5">
                        <div className="p-1.5 rounded-lg" style={{ background: dead ? '#2a1010' : '#1a1f2e' }}>
                          {dead ? <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} /> : <Icon className="w-5 h-5" style={{ color: '#94a3b8' }} />}
                        </div>
                      </div>
                      <div className="text-center text-[9px] font-bold tracking-wide" style={{ color: dead ? '#ef4444' : '#cbd5e1' }}>
                        {node.label}
                      </div>
                    </div>

                    {/* HP bar */}
                    {node.id !== 'internet' && !dead && (
                      <div className="px-2 pb-2">
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#0d1117' }}>
                          <div className="h-full rounded-full transition-all duration-300" style={{
                            width: `${hp}%`,
                            background: hp < 30 ? '#ef4444' : hp < 60 ? '#f59e0b' : '#22c55e',
                            boxShadow: hp < 30 ? '0 0 4px #ef4444' : 'none'
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Dead overlay */}
                    {dead && (
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                        <span className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded" style={{ background: '#0d1117', border: '1px solid #ef4444', color: '#ef4444' }}>OFFLINE</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="absolute top-16 right-4 flex flex-col gap-3 pointer-events-none" style={{ width: 260, zIndex: 15 }}>

          {/* Node Inspector */}
          <div className="rounded-xl p-3 pointer-events-auto" style={{ background: '#0d1117cc', backdropFilter: 'blur(12px)', border: '1px solid #1e293b' }}>
            <div className="text-[9px] font-bold tracking-widest mb-2 flex items-center gap-1.5" style={{ color: '#7c3aed' }}>
              <Search className="w-3 h-3" /> NODE INSPECTOR
            </div>
            {selectedNodeId ? (() => {
              const n = nodes.find(x => x.id === selectedNodeId);
              const h = nodeStatus[selectedNodeId] ?? 100;
              const Icon = n.icon;
              return (
                <div>
                  <div className="flex items-center gap-2 pb-2 mb-2" style={{ borderBottom: '1px solid #1e293b' }}>
                    <Icon className="w-5 h-5" style={{ color: '#64748b' }} />
                    <div>
                      <div className="text-[11px] font-bold text-white">{n.label}</div>
                      <div className="text-[8px]" style={{ color: '#475569' }}>{n.detail}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                    <div className="rounded p-1.5 text-center" style={{ background: '#0a0e1a' }}>
                      <div className="font-bold mb-0.5" style={{ color: '#475569' }}>HP</div>
                      <div className="font-black" style={{ color: h < 30 ? '#ef4444' : h < 70 ? '#f59e0b' : '#4ade80' }}>{Math.round(h)}</div>
                    </div>
                    <div className="rounded p-1.5 text-center" style={{ background: '#0a0e1a' }}>
                      <div className="font-bold mb-0.5" style={{ color: '#475569' }}>STATUS</div>
                      <div className="font-bold" style={{ color: h === 0 ? '#ef4444' : h < 100 ? '#f59e0b' : '#4ade80' }}>
                        {h === 0 ? 'OFF' : h < 100 ? 'WARN' : 'OK'}
                      </div>
                    </div>
                    <div className="rounded p-1.5 text-center" style={{ background: '#0a0e1a' }}>
                      <div className="font-bold mb-0.5" style={{ color: '#475569' }}>LOAD</div>
                      <div className="font-bold" style={{ color: activeAttacks.some(a => a.target === n.id) ? '#ef4444' : '#4ade80' }}>
                        {activeAttacks.filter(a => a.target === n.id).length > 0 ? 'HIGH' : 'LOW'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="py-4 text-center text-[9px]" style={{ color: '#334155' }}>Select a node to inspect</div>
            )}
          </div>

          {/* Defense Toolkit */}
          <div className="rounded-xl p-3 pointer-events-auto" style={{ background: '#0d1117cc', backdropFilter: 'blur(12px)', border: '1px solid #16a34a33' }}>
            <div className="text-[9px] font-bold tracking-widest mb-2 flex items-center gap-1.5" style={{ color: '#4ade80' }}>
              <Terminal className="w-3 h-3" /> DEFENSE TOOLKIT
            </div>
            <div className="space-y-1.5">
              {Object.entries(COUNTERMEASURES).map(([key, cm]) => {
                const Icon = cm.icon;
                const disabled = cooldowns[key] || resources < cm.cost || gameOver;
                return (
                  <button key={key} onClick={() => deployCountermeasure(key)} disabled={disabled}
                    className="w-full rounded-lg p-2 text-left transition-all relative overflow-hidden"
                    style={{
                      background: cooldowns[key] ? '#0a0e1a' : '#111827',
                      border: `1px solid ${cooldowns[key] ? '#1e293b' : resources < cm.cost ? '#3b1010' : '#16a34a33'}`,
                      opacity: disabled ? 0.45 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = '#4ade80'; }}
                    onMouseLeave={e => { if (!cooldowns[key]) e.currentTarget.style.borderColor = resources < cm.cost ? '#3b1010' : '#16a34a33'; }}>
                    {cooldowns[key] && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ background: '#0a0e1a99', zIndex: 2 }}>
                        <span className="text-[8px] font-bold tracking-widest" style={{ color: '#64748b' }}>RECHARGING</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3" style={{ color: '#4ade80' }} />
                        <span className="text-[9px] font-bold text-white">{cm.label}</span>
                      </div>
                      <span className="text-[8px] font-mono" style={{ color: '#64748b' }}>-{cm.cost}</span>
                    </div>
                    <div className="text-[8px] mt-0.5" style={{ color: '#475569' }}>{cm.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Terminal Log ── */}
        <div className="absolute bottom-4 right-4 pointer-events-none" style={{ width: 380, zIndex: 30 }}>
          <div className="rounded-xl overflow-hidden pointer-events-auto" style={{ background: '#050709dd', backdropFilter: 'blur(16px)', border: '1px solid #1e293b', height: 140 }}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid #1e293b', background: '#0a0e1a' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                <span className="text-[8px] ml-2 font-bold tracking-widest" style={{ color: '#475569' }}>TERMINAL</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px]" style={{ color: '#4ade80' }}>●</span>
                <span className="text-[8px]" style={{ color: '#475569' }}>LIVE</span>
              </div>
            </div>
            <div className="p-2 overflow-y-auto space-y-0.5" style={{ height: 108, scrollbarWidth: 'none' }}>
              {logs.map(log => (
                <div key={log.id} className="flex gap-2 text-[9px]">
                  <span style={{ color: '#334155', minWidth: 48, flexShrink: 0 }}>{log.time}</span>
                  <span style={{
                    color: log.type === 'ALERT' || log.type === 'CRITICAL' ? '#f87171' :
                      log.type === 'SUCCESS' ? '#60a5fa' :
                        log.type === 'WARN' ? '#fb923c' : '#4ade80',
                    fontWeight: log.type === 'CRITICAL' || log.type === 'ALERT' ? 700 : 400
                  }}>{log.msg}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Global Styles ── */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0); }
          25% { transform: translate(-2px, 1px); }
          75% { transform: translate(2px, -1px); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 14px #f59e0b44; }
          50% { box-shadow: 0 0 22px #f59e0b66; }
        }
        @keyframes shockwave {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(8); opacity: 0; }
        }
        @keyframes tierBannerIn {
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          to { opacity: 0.6; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
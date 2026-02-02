"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import {
  Server,
  Activity,
  ShieldAlert,
  RefreshCw,
  HeartPulse,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Zap,
  ShieldCheck,
} from "lucide-react";

/* ---------------- CONFIG ---------------- */

const GRID = 20;
const HEARTBEAT_TIMEOUT = 3;

/* ---------------- COMPONENT TYPES ---------------- */

const COMPONENTS = {
  PRIMARY: {
    label: "Primary Server",
    icon: Server,
    color: "text-emerald-400",
    bg: "bg-neutral-900",
  },
  REPLICA: {
    label: "Replica",
    icon: Server,
    color: "text-slate-300",
    bg: "bg-neutral-800",
  },
  HEALTH: {
    label: "Health Monitor",
    icon: HeartPulse,
    color: "text-cyan-400",
    bg: "bg-cyan-900/20",
  },
  DETECTOR: {
    label: "Fault Detector",
    icon: ShieldAlert,
    color: "text-yellow-400",
    bg: "bg-yellow-900/20",
  },
  RECOVERY: {
    label: "Recovery Engine",
    icon: RefreshCw,
    color: "text-indigo-400",
    bg: "bg-indigo-900/20",
  },
};

/* ---------------- NODE ---------------- */

const Node = memo(({ node }) => {
  const Icon = COMPONENTS[node.type].icon;

  const statusColor = {
    healthy: "border-emerald-500",
    suspect: "border-yellow-400",
    failed: "border-red-500",
    recovering: "border-cyan-400",
  }[node.status];

  return (
    <div
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
      }}
      className={`absolute w-20 h-20 rounded-xl border-2 ${statusColor} ${COMPONENTS[node.type].bg}
        flex flex-col items-center justify-center text-xs shadow-lg transition-all duration-500`}
    >
      <Icon className={`w-6 h-6 ${COMPONENTS[node.type].color}`} />
      <span className="mt-1 text-neutral-300 text-[10px] text-center">
        {COMPONENTS[node.type].label}
      </span>

      <div
        className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${
          node.status === "healthy"
            ? "bg-emerald-500"
            : node.status === "suspect"
            ? "bg-yellow-400"
            : node.status === "failed"
            ? "bg-red-500"
            : "bg-cyan-400"
        }`}
      />
    </div>
  );
});

/* ---------------- MAIN ---------------- */

export default function FaultToleranceSimulator() {
  const [nodes, setNodes] = useState([
    { id: "p1", type: "PRIMARY", x: 300, y: 220, status: "healthy", missed: 0 },
    { id: "r1", type: "REPLICA", x: 450, y: 220, status: "healthy", missed: 0 },
    { id: "h1", type: "HEALTH", x: 200, y: 100, status: "healthy" },
    { id: "f1", type: "DETECTOR", x: 300, y: 100, status: "healthy" },
    { id: "a1", type: "RECOVERY", x: 400, y: 100, status: "healthy" },
  ]);

  const [running, setRunning] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({
    availability: 100,
    failed: 0,
    recovered: 0,
  });

  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  /* ---------------- SIM LOOP ---------------- */

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  /* ---------------- CORE LOGIC ---------------- */

  const tick = () => {
    let updated = [...nodesRef.current];
    let alertsLocal = [];

    updated.forEach((n) => {
      if (n.type === "PRIMARY" || n.type === "REPLICA") {
        if (Math.random() > 0.92) n.missed += 1;
        else n.missed = 0;

        if (n.missed === 2 && n.status === "healthy") {
          n.status = "suspect";
          alertsLocal.push(`${n.id} is suspect`);
        }

        if (n.missed >= HEARTBEAT_TIMEOUT) {
          if (n.status !== "failed") {
            n.status = "failed";
            alertsLocal.push(`${n.id} FAILED`);
            failover(n.id, updated, alertsLocal);
          }
        }
      }
    });

    setNodes(updated);
    if (alertsLocal.length) setAlerts((a) => [...alertsLocal, ...a].slice(0, 5));
    computeMetrics(updated);
  };

  /* ---------------- FAILOVER ---------------- */

  const failover = (failedId, list, alertsLocal) => {
    const replica = list.find((n) => n.type === "REPLICA" && n.status === "healthy");
    if (replica) {
      replica.type = "PRIMARY";
      alertsLocal.push("Replica promoted to PRIMARY");
    }

    setTimeout(() => recover(failedId), 2000);
  };

  /* ---------------- RECOVERY ---------------- */

  const recover = (id) => {
    setNodes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      next.push({
        id: `new-${Date.now()}`,
        type: "REPLICA",
        x: 450,
        y: 320,
        status: "recovering",
        missed: 0,
      });

      setTimeout(() => {
        setNodes((p) =>
          p.map((n) =>
            n.status === "recovering" ? { ...n, status: "healthy" } : n
          )
        );
      }, 2000);

      return next;
    });

    setMetrics((m) => ({ ...m, recovered: m.recovered + 1 }));
  };

  /* ---------------- METRICS ---------------- */

  const computeMetrics = (list) => {
    const total = list.filter((n) => n.type === "PRIMARY" || n.type === "REPLICA");
    const healthy = total.filter((n) => n.status === "healthy").length;
    const failed = total.filter((n) => n.status === "failed").length;

    setMetrics({
      availability: Math.round((healthy / total.length) * 100),
      failed,
      recovered: metrics.recovered,
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="h-screen w-full bg-neutral-950 text-neutral-200 flex flex-col">
      {/* TOP BAR */}
      <div className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-cyan-400" />
          <h1 className="font-bold">Fault Tolerance Simulator</h1>
        </div>

        <button
          onClick={() => setRunning(!running)}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            running
              ? "bg-red-900/40 text-red-300"
              : "bg-emerald-900/40 text-emerald-300"
          }`}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Stop" : "Run"}
        </button>
      </div>

      {/* METRICS */}
      <div className="px-6 py-3 flex gap-8 text-sm">
        <span>Availability: <b>{metrics.availability}%</b></span>
        <span>Failed: <b className="text-red-400">{metrics.failed}</b></span>
        <span>Recovered: <b className="text-cyan-400">{metrics.recovered}</b></span>
      </div>

      {/* CANVAS */}
      <div
        className="flex-1 relative"
        style={{
          backgroundImage: "radial-gradient(#404040 1px, transparent 1px)",
          backgroundSize: `${GRID}px ${GRID}px`,
        }}
      >
        {nodes.map((n) => (
          <Node key={n.id} node={n} />
        ))}
      </div>

      {/* ALERTS */}
      <div className="absolute bottom-4 left-4 space-y-2">
        {alerts.map((a, i) => (
          <div
            key={i}
            className="bg-neutral-900/80 border-l-4 border-yellow-400 px-3 py-2 text-xs rounded"
          >
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}

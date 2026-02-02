"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, Settings, RefreshCw, 
  Wind, Thermometer, Gauge, Zap, Bell, ChevronRight, X, 
  TrendingUp, Cpu, Server, ShieldAlert, Play, Pause, RotateCcw
} from 'lucide-react';

// --- Configuration & Constants ---
const MAX_DATA_POINTS = 60;
const REFRESH_RATE = 100; // ms

const SENSORS = {
  VIBRATION: { id: 'vib', name: 'Vibration', unit: 'mm/s', min: 0, max: 10, threshold: 7.5, color: '#f59e0b' },
  TEMP: { id: 'temp', name: 'Core Temp', unit: '°C', min: 200, max: 800, threshold: 720, color: '#ef4444' },
  PRESSURE: { id: 'pres', name: 'Oil Pressure', unit: 'PSI', min: 0, max: 120, threshold: 30, color: '#3b82f6', isLowerBound: true },
  RPM: { id: 'rpm', name: 'Rotor Speed', unit: 'RPM', min: 0, max: 15000, threshold: 14200, color: '#10b981' }
};

// --- Helper: Simple SVG Chart ---
const LiveChart = ({ data, dataKey, color, height = 60, min, max, threshold, isLowerBound }) => {
  if (!data || data.length === 0) return null;

  const width = 100; // use percentages for width in SVG
  const range = max - min;
  
  // Create points for the polyline
  const points = data.map((d, i) => {
    const x = (i / (MAX_DATA_POINTS - 1)) * 300; // Fixed width SVG
    const normalizedValue = Math.max(min, Math.min(max, d[dataKey]));
    const y = height - ((normalizedValue - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Calculate threshold line Y position
  const threshY = height - ((threshold - min) / range) * height;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
      <svg viewBox={`0 0 300 ${height}`} className="w-full h-full preserve-3d">
        {/* Background Grid */}
        <line x1="0" y1={height/2} x2="300" y2={height/2} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        
        {/* Threshold Line */}
        <line 
          x1="0" y1={threshY} x2="300" y2={threshY} 
          stroke={isLowerBound ? "#3b82f6" : "#ef4444"} 
          strokeWidth="1" 
          strokeDasharray="2 2" 
          opacity="0.6" 
        />

        {/* Data Line */}
        <polyline 
          points={points} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Area fill (optional, simplified) */}
        <polygon 
          points={`0,${height} ${points} 300,${height}`} 
          fill={color} 
          fillOpacity="0.1" 
        />
      </svg>
    </div>
  );
};

// --- Main Application ---
export default function IoTFaultDetector() {
  // State
  const [isRunning, setIsRunning] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [systemHealth, setSystemHealth] = useState(100);
  const [selectedSensor, setSelectedSensor] = useState('VIBRATION');
  
  // Simulation State
  const [simSettings, setSimSettings] = useState({
    noiseLevel: 10,
    anomalyProbability: 0.02,
    drift: 0
  });

  // Refs for animation loop
  const dataRef = useRef([]);
  const frameRef = useRef(0);
  
  // Initialize Data
  useEffect(() => {
    const initialData = Array(MAX_DATA_POINTS).fill(0).map(() => generateDataPoint(0));
    setSensorData(initialData);
    dataRef.current = initialData;
  }, []);

  // Simulation Logic
  const generateDataPoint = (frame) => {
    const time = Date.now();
    
    // Base waveforms
    const baseVib = 3 + Math.sin(frame * 0.1) * 1 + Math.random() * (simSettings.noiseLevel / 20);
    const baseTemp = 600 + Math.sin(frame * 0.01) * 50 + (simSettings.drift * frame * 0.1);
    const basePres = 90 + Math.cos(frame * 0.05) * 5;
    const baseRpm = 12000 + Math.random() * 200;

    // Fault Injection (Random spikes)
    let faultModifier = { vib: 0, temp: 0, pres: 0, rpm: 0 };
    
    if (Math.random() < simSettings.anomalyProbability && isRunning) {
      const type = Math.random();
      if (type < 0.25) faultModifier.vib = 5 + Math.random() * 5; // Vibration spike
      else if (type < 0.5) faultModifier.temp = 150; // Temp spike
      else if (type < 0.75) faultModifier.pres = -70; // Pressure drop
      else faultModifier.rpm = -3000; // RPM drop
    }

    return {
      time,
      vib: Math.max(0, baseVib + faultModifier.vib),
      temp: Math.max(0, baseTemp + faultModifier.temp),
      pres: Math.max(0, basePres + faultModifier.pres),
      rpm: Math.max(0, baseRpm + faultModifier.rpm)
    };
  };

  // Main Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      frameRef.current += 1;
      const newDataPoint = generateDataPoint(frameRef.current);
      
      const updatedData = [...dataRef.current.slice(1), newDataPoint];
      dataRef.current = updatedData;
      setSensorData(updatedData);
      
      detectFaults(newDataPoint);
    }, REFRESH_RATE);

    return () => clearInterval(interval);
  }, [isRunning, simSettings]);

  // Fault Detection Logic
  const detectFaults = (data) => {
    const newAlerts = [];
    let healthDrop = 0;

    // Check Vibration
    if (data.vib > SENSORS.VIBRATION.threshold) {
      newAlerts.push({ type: 'CRITICAL', sensor: 'Vibration', msg: `High vibration detected: ${data.vib.toFixed(1)} mm/s`, time: new Date() });
      healthDrop += 20;
    }

    // Check Temperature
    if (data.temp > SENSORS.TEMP.threshold) {
      newAlerts.push({ type: 'WARNING', sensor: 'Temperature', msg: `Core overheating: ${Math.round(data.temp)}°C`, time: new Date() });
      healthDrop += 10;
    }

    // Check Pressure
    if (data.pres < SENSORS.PRESSURE.threshold) {
      newAlerts.push({ type: 'CRITICAL', sensor: 'Pressure', msg: `Oil pressure loss: ${Math.round(data.pres)} PSI`, time: new Date() });
      healthDrop += 30;
    }

    // Update System Health
    if (healthDrop > 0) {
      setSystemHealth(prev => Math.max(0, prev - healthDrop * 0.1)); // Gradual decline
    } else {
      setSystemHealth(prev => Math.min(100, prev + 0.5)); // Gradual recovery
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    }
  };

  const getHealthColor = (score) => {
    if (score > 80) return 'text-emerald-400';
    if (score > 50) return 'text-amber-400';
    return 'text-red-500';
  };

  const getHealthStatus = (score) => {
    if (score > 80) return 'OPTIMAL';
    if (score > 50) return 'DEGRADED';
    return 'CRITICAL';
  };

  const clearAlerts = () => setAlerts([]);
  const resetSim = () => {
    setSystemHealth(100);
    setAlerts([]);
    frameRef.current = 0;
    setSimSettings({ noiseLevel: 10, anomalyProbability: 0.02, drift: 0 });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* Sidebar Navigation */}
      <div className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-slate-800 h-20">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden lg:block text-slate-100">Fault<span className="text-indigo-400">Sense</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={Gauge} label="Live Monitor" />
          <NavItem active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={TrendingUp} label="Analysis" />
          <NavItem active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={Bell} label="Alert Log" count={alerts.length} />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Config" />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-2 hidden lg:flex">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">System Status</span>
          </div>
          <div className="hidden lg:block text-2xl font-mono font-bold tracking-tight">
            <span className={getHealthColor(systemHealth)}>{Math.round(systemHealth)}%</span>
            <span className="text-sm text-slate-500 font-sans font-normal ml-2">{getHealthStatus(systemHealth)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-6 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Turbine T-900 Monitoring</h2>
            <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-400 font-mono">
              ID: #TRB-2024-X8
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isRunning 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause Stream' : 'Resume Stream'}
            </button>
            <button 
              onClick={resetSim}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Vibration Level" 
              value={sensorData.length ? sensorData[sensorData.length-1].vib.toFixed(2) : '0.00'} 
              unit="mm/s"
              icon={Activity}
              status={sensorData.length && sensorData[sensorData.length-1].vib > SENSORS.VIBRATION.threshold ? 'danger' : 'success'}
              trend={+0.2}
            />
            <MetricCard 
              title="Core Temp" 
              value={sensorData.length ? Math.round(sensorData[sensorData.length-1].temp) : '0'} 
              unit="°C"
              icon={Thermometer}
              status={sensorData.length && sensorData[sensorData.length-1].temp > SENSORS.TEMP.threshold ? 'warning' : 'success'}
              trend={-1.5}
            />
            <MetricCard 
              title="Oil Pressure" 
              value={sensorData.length ? Math.round(sensorData[sensorData.length-1].pres) : '0'} 
              unit="PSI"
              icon={Gauge}
              status={sensorData.length && sensorData[sensorData.length-1].pres < SENSORS.PRESSURE.threshold ? 'danger' : 'success'}
              trend={0}
            />
            <MetricCard 
              title="Active Anomalies" 
              value={alerts.length} 
              unit="Faults"
              icon={ShieldAlert}
              status={alerts.length > 5 ? 'danger' : alerts.length > 0 ? 'warning' : 'neutral'}
              trend={null}
            />
          </div>

          {/* Main Visual & Charts Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
            
            {/* Left: Digital Twin (Turbine Visual) */}
            <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Settings className="w-32 h-32 text-indigo-500 animate-spin-slow" />
              </div>
              
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 z-10">Digital Twin State</h3>
              
              <div className="flex-1 flex items-center justify-center relative z-10">
                {/* Simplified Turbine SVG */}
                <div className="relative w-full h-64">
                   <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-2xl">
                     {/* Intake */}
                     <path 
                       d="M 20 50 L 80 20 L 80 180 L 20 150 Z" 
                       fill={sensorData.length && sensorData[sensorData.length-1].pres < SENSORS.PRESSURE.threshold ? '#ef4444' : '#334155'} 
                       className="transition-colors duration-300"
                     />
                     <text x="35" y="105" fill="white" fontSize="12" opacity="0.5" transform="rotate(-90 40 100)">INTAKE</text>
                     
                     {/* Compressor */}
                     <path 
                       d="M 85 20 L 200 40 L 200 160 L 85 180 Z" 
                       fill={sensorData.length && sensorData[sensorData.length-1].rpm > SENSORS.RPM.threshold ? '#f59e0b' : '#475569'} 
                       className="transition-colors duration-300"
                     />
                     {/* Compressor Blades (Animated) */}
                     <g transform="translate(140, 100)">
                        <circle r="30" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" className={isRunning ? "animate-spin-slow" : ""} opacity="0.3" />
                     </g>

                     {/* Combustion Chamber */}
                     <path 
                       d="M 205 40 L 280 40 L 280 160 L 205 160 Z" 
                       fill={sensorData.length && sensorData[sensorData.length-1].temp > SENSORS.TEMP.threshold ? '#ef4444' : '#64748b'} 
                       className="transition-colors duration-300"
                     />
                     
                     {/* Exhaust */}
                     <path 
                       d="M 285 40 L 380 10 L 380 190 L 285 160 Z" 
                       fill={sensorData.length && sensorData[sensorData.length-1].vib > SENSORS.VIBRATION.threshold ? '#f59e0b' : '#475569'} 
                       className="transition-colors duration-300"
                     />
                     
                     {/* Connection Lines */}
                     <line x1="0" y1="100" x2="400" y2="100" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.1" />
                   </svg>
                   
                   {/* Status Labels */}
                   <div className="absolute top-0 left-10 text-xs text-slate-500">Air Intake</div>
                   <div className="absolute bottom-0 right-10 text-xs text-slate-500">Exhaust Manifold</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 z-10">
                <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
                   <div className="text-xs text-slate-500 mb-1">Efficiency</div>
                   <div className="text-lg font-mono text-indigo-400">94.2%</div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
                   <div className="text-xs text-slate-500 mb-1">Load</div>
                   <div className="text-lg font-mono text-emerald-400">820 kW</div>
                </div>
              </div>
            </div>

            {/* Middle/Right: Charts */}
            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sensor Streams</h3>
                <div className="flex gap-2">
                  {Object.keys(SENSORS).map(key => (
                    <button
                      key={key}
                      onClick={() => setSelectedSensor(key)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                        selectedSensor === key 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {SENSORS[key].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Large Chart */}
              <div className="flex-1 bg-slate-950/50 rounded-lg border border-slate-800 p-4 relative mb-4">
                 <div className="absolute top-4 left-4 flex flex-col">
                    <span className="text-3xl font-mono font-bold text-white">
                      {sensorData.length 
                        ? sensorData[sensorData.length-1][SENSORS[selectedSensor].id].toFixed(1) 
                        : '0'}
                      <span className="text-base text-slate-500 ml-2">{SENSORS[selectedSensor].unit}</span>
                    </span>
                 </div>
                 <div className="h-full pt-12">
                   <LiveChart 
                      data={sensorData} 
                      dataKey={SENSORS[selectedSensor].id} 
                      color={SENSORS[selectedSensor].color}
                      height={200}
                      min={SENSORS[selectedSensor].min}
                      max={SENSORS[selectedSensor].max}
                      threshold={SENSORS[selectedSensor].threshold}
                      isLowerBound={SENSORS[selectedSensor].isLowerBound}
                   />
                 </div>
              </div>

              {/* Mini Charts for others */}
              <div className="grid grid-cols-3 gap-4 h-24">
                 {Object.keys(SENSORS).filter(k => k !== selectedSensor).map(key => (
                   <div key={key} className="bg-slate-950/30 rounded border border-slate-800 p-2 flex flex-col justify-end relative" onClick={() => setSelectedSensor(key)}>
                      <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-500 uppercase">{SENSORS[key].name}</span>
                      <LiveChart 
                        data={sensorData} 
                        dataKey={SENSORS[key].id} 
                        color={SENSORS[key].color} 
                        height={40}
                        min={SENSORS[key].min}
                        max={SENSORS[key].max}
                        threshold={SENSORS[key].threshold}
                      />
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Controls & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Simulation Controls */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Simulation Parameters</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-slate-300">Signal Noise</span>
                    <span className="font-mono text-slate-500">{simSettings.noiseLevel}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="50" 
                    value={simSettings.noiseLevel} 
                    onChange={(e) => setSimSettings(s => ({...s, noiseLevel: parseInt(e.target.value)}))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-slate-300">Anomaly Probability</span>
                    <span className="font-mono text-slate-500">{(simSettings.anomalyProbability * 100).toFixed(1)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" step="0.5"
                    value={simSettings.anomalyProbability * 100} 
                    onChange={(e) => setSimSettings(s => ({...s, anomalyProbability: parseFloat(e.target.value) / 100}))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div className="text-sm">
                      <div className="text-slate-200 font-medium">Inject Manual Fault</div>
                      <div className="text-slate-500 text-xs">Triggers immediate sensor spike</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSimSettings(s => ({...s, anomalyProbability: 0.8}))} // Temp high prob
                    onMouseLeave={() => setSimSettings(s => ({...s, anomalyProbability: 0.02}))} // Reset
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded text-sm font-bold transition-colors"
                  >
                    Trigger
                  </button>
                </div>
              </div>
            </div>

            {/* Alert Feed */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Alerts</h3>
                  {alerts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold">{alerts.length}</span>
                  )}
                </div>
                <button 
                  onClick={clearAlerts}
                  className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" /> Acknowledge All
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {alerts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                    <span className="text-sm">System Nominal. No Active Faults.</span>
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 animate-in slide-in-from-right-2 duration-300 ${
                      alert.type === 'CRITICAL' 
                        ? 'bg-red-500/10 border-red-500/20' 
                        : 'bg-amber-500/10 border-amber-500/20'
                    }`}>
                      <div className={`mt-0.5 p-1 rounded-full ${
                        alert.type === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                         {alert.type === 'CRITICAL' ? <X className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                           <span className={`text-xs font-bold ${
                             alert.type === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                           }`}>{alert.sensor} Fault</span>
                           <span className="text-[10px] text-slate-500 font-mono">
                             {alert.time.toLocaleTimeString()}
                           </span>
                        </div>
                        <p className="text-sm text-slate-300 truncate" title={alert.msg}>{alert.msg}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function NavItem({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="hidden lg:block text-sm font-medium">{label}</span>
      {count > 0 && (
        <span className="hidden lg:flex ml-auto w-5 h-5 items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

function MetricCard({ title, value, unit, icon: Icon, status, trend }) {
  const getColors = () => {
    if (status === 'danger') return 'bg-red-500/10 border-red-500/30 text-red-500';
    if (status === 'warning') return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    if (status === 'neutral') return 'bg-slate-800/50 border-slate-700 text-slate-400';
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
  };

  const style = getColors();

  return (
    <div className={`p-5 rounded-xl border ${style} backdrop-blur-sm relative overflow-hidden transition-all duration-500`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</span>
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-mono font-bold tracking-tight text-white">{value}</span>
        <span className="text-sm text-slate-500 mb-1">{unit}</span>
      </div>
      
      {trend !== null && (
         <div className="mt-3 flex items-center gap-1 text-xs font-medium">
           {trend > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
           <span className={trend > 0 ? "text-emerald-400" : "text-red-400"}>
             {Math.abs(trend)}% vs avg
           </span>
         </div>
      )}
    </div>
  );
}
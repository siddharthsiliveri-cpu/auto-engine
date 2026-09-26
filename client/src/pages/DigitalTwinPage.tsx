import React, { useState, useEffect } from 'react';
import AutomotiveCanvas from '../components/3d/AutomotiveCanvas';
import { VehicleCustomization } from '../components/3d/VehicleModel3D';
import { Activity, BatteryCharging, Zap, Thermometer, Wind, Gauge, Shield, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Magnetic } from '@/components/core/magnetic';

export const DigitalTwinPage: React.FC = () => {
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  // Animated live telemetry values
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    motorRpm: 0,
    batteryTempC: 31.4,
    motorTempC: 68.2,
    inverterTempC: 52.8,
    batterySocPct: 94,
    cellVoltageV: 3.92,
    frontTorquePct: 45,
    rearTorquePct: 55,
    tirePressureBar: [2.5, 2.5, 2.6, 2.6],
    networkLatencyMs: 14,
  });

  // Simulated live CAN-bus telemetry heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        batteryTempC: Number((31.0 + Math.random() * 0.8).toFixed(1)),
        motorTempC: Number((67.8 + Math.random() * 1.2).toFixed(1)),
        inverterTempC: Number((52.4 + Math.random() * 0.9).toFixed(1)),
        cellVoltageV: Number((3.91 + Math.random() * 0.02).toFixed(2)),
        networkLatencyMs: Math.floor(12 + Math.random() * 5),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const runDiagnostic = () => {
    setIsRunningDiagnostic(true);
    setDiagnosticResult(null);
    setTimeout(() => {
      setIsRunningDiagnostic(false);
      setDiagnosticResult('ALL 12 POWERTRAIN SENSORS IN OPTIMAL EQUILIBRIUM. ZERO FAULT CODES DETECTED.');
      setTimeout(() => setDiagnosticResult(null), 5000);
    }, 2200);
  };

  const customization: VehicleCustomization = {
    paintColor: '#00F0FF',
    caliperColor: '#00F0FF',
    wheelStyle: 'aero',
    powertrain: 'dual',
    interiorTrim: 'carbon',
    isXRay: false,
    explodedProgress: 0,
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Hardware-in-the-Loop Telemetry Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
            AE-APEX DIGITAL TWIN
          </h1>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs">
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SYNCHRONIZED (CAN-FD • {telemetry.networkLatencyMs}ms)</span>
          </div>

          <Magnetic intensity={0.2} range={60}>
            <button
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
              className="bg-white/10 hover:bg-[#00F0FF] text-white hover:text-black border border-white/20 font-semibold px-4 py-2 rounded-full transition-all flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
              <span>{isRunningDiagnostic ? 'Scanning ECUs...' : 'Run Diagnostics'}</span>
            </button>
          </Magnetic>
        </div>
      </div>

      {diagnosticResult && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl font-mono text-xs text-emerald-300 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{diagnosticResult}</span>
        </div>
      )}

      {/* Main Grid: Telemetry Panels Left, Center 3D Model, Telemetry Panels Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Powertrain & Energy Cards (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Range & Battery */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-[#00F0FF]" />
                RANGE
              </span>
              <span className="text-emerald-400 font-bold">{telemetry.batterySocPct}% SoC</span>
            </div>
            <div className="text-4xl font-display font-extrabold text-white tracking-tight">
              520 <span className="text-lg font-mono text-neutral-400">KM</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#00F0FF] h-full" style={{ width: `${telemetry.batterySocPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>82 KWH LIQUID-COOLED</span>
              <span>{telemetry.cellVoltageV} V/CELL</span>
            </div>
          </div>

          {/* Card 2: Peak Power Output */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                TOTAL POWER
              </span>
              <span className="text-[#00F0FF] font-bold">670 HP</span>
            </div>
            <div className="text-4xl font-display font-extrabold text-white tracking-tight">
              500 <span className="text-lg font-mono text-neutral-400">KW</span>
            </div>
            <div className="text-[11px] font-mono text-neutral-400">
              Dual Axial-Flux Permanent Magnet Motors
            </div>
          </div>

          {/* Card 3: Weight & Inertia */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
            <div className="text-neutral-400 font-mono text-xs">CURB WEIGHT</div>
            <div className="text-4xl font-display font-extrabold text-white tracking-tight">
              1,920 <span className="text-lg font-mono text-neutral-400">KG</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>WEIGHT RATIO</span>
              <span>49% FRONT / 51% REAR</span>
            </div>
          </div>
        </div>

        {/* Center: Large Interactive 3D Model (6 Cols) */}
        <div className="lg:col-span-6 bg-[#080808] border border-white/10 rounded-3xl h-[650px] relative overflow-hidden shadow-2xl">
          <AutomotiveCanvas
            customization={customization}
            enableControls={true}
            autoRotate={true}
            cameraPosition={[3.8, 1.8, 4.8]}
          />

          {/* Center Technical Callout Watermark */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none text-center">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              ORBIT CONTROLS ACTIVE • REAL-TIME CAN-BUS SYNC
            </span>
          </div>
        </div>

        {/* Right Side: Thermal & Kinematics Cards (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 4: Acceleration & Dynamics */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#00F0FF]" />
                0–100 KM/H
              </span>
              <span className="text-[#00F0FF] font-bold">LAUNCH</span>
            </div>
            <div className="text-4xl font-display font-extrabold text-[#00F0FF] tracking-tight">
              3.2 <span className="text-lg font-mono text-white">SEC</span>
            </div>
            <div className="text-[10px] font-mono text-neutral-400">
              Torque Vectoring: {telemetry.frontTorquePct}% F / {telemetry.rearTorquePct}% R
            </div>
          </div>

          {/* Card 5: Aerodynamics */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-400" />
                AERODYNAMICS
              </span>
              <span className="text-white font-bold">DRS ACTIVE</span>
            </div>
            <div className="text-4xl font-display font-extrabold text-white tracking-tight">
              0.208 <span className="text-lg font-mono text-neutral-400">Cd</span>
            </div>
            <div className="text-[10px] font-mono text-neutral-400">
              Downforce: 450 kg @ 250 km/h
            </div>
          </div>

          {/* Card 6: Live Thermal Telemetry */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex items-center space-x-2 text-neutral-400">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span>SUBSYSTEM THERMALS</span>
            </div>

            <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-[11px]">BATTERY PACK</span>
                <span className="font-bold text-emerald-400">{telemetry.batteryTempC} °C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-[11px]">ELECTRIC MOTORS</span>
                <span className="font-bold text-amber-400">{telemetry.motorTempC} °C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-[11px]">SiC INVERTER</span>
                <span className="font-bold text-sky-400">{telemetry.inverterTempC} °C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinPage;

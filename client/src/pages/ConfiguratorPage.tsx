import React, { useState, useEffect } from 'react';
import AutomotiveCanvas from '../components/3d/AutomotiveCanvas';
import { VehicleCustomization } from '../components/3d/VehicleModel3D';
import { Magnetic } from '../components/core/magnetic';
import api from '../services/api';
import { VehicleModel, VehicleVariant, Component, VehicleConfiguration } from '../types';
import {
  Save,
  Check,
  RotateCcw,
  Eye,
  Sliders,
  Sparkles,
  Download,
  Share2,
  Cpu,
  Layers,
  Zap,
  Activity,
  ChevronRight,
  Printer,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConfiguratorPageProps {
  onNavigateToComponent?: (partNumber: string) => void;
}

export const ConfiguratorPage: React.FC<ConfiguratorPageProps> = () => {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VehicleVariant | null>(null);
  const [configName, setConfigName] = useState('Cyber Apex Custom Configuration');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'paint' | 'wheels' | 'brakes' | 'powertrain' | 'interior'>('paint');

  // Customization 3D state
  const [paintColor, setPaintColor] = useState('#00F0FF');
  const [caliperColor, setCaliperColor] = useState('#00F0FF');
  const [wheelStyle, setWheelStyle] = useState<'aero' | 'forged' | 'turbine'>('aero');
  const [powertrain, setPowertrain] = useState<'dual' | 'tri'>('dual');
  const [interiorTrim, setInteriorTrim] = useState<'carbon' | 'titanium' | 'white'>('carbon');
  const [isXRay, setIsXRay] = useState(false);
  const [explodedProgress, setExplodedProgress] = useState(0);

  // Saved configs list
  const [savedConfigs, setSavedConfigs] = useState<VehicleConfiguration[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isSpecSheetOpen, setIsSpecSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.vehicles.getModels();
        if (res.success && res.data.length > 0) {
          setModels(res.data);
          const firstModel = res.data[0];
          setSelectedModel(firstModel);
          if (firstModel.variants && firstModel.variants.length > 0) {
            setSelectedVariant(firstModel.variants[0]);
          }
        }

        const configsRes = await api.configurator.getAll();
        if (configsRes.success) {
          setSavedConfigs(configsRes.data);
        }
      } catch (err) {
        console.error('Failed to load configurator models:', err);
      }
    };
    fetchData();
  }, []);

  // Calculate live dynamic specs
  const basePrice = selectedVariant?.basePrice || 165000;
  const isTri = powertrain === 'tri';
  const totalPrice = basePrice + (isTri ? 50000 : 0) + (wheelStyle === 'aero' ? 4600 : 3200) + (interiorTrim === 'white' ? 4200 : 0);
  const rangeKm = (selectedVariant?.specifications?.rangeKm || 520) + (isTri ? 90 : 0);
  const acceleration0100 = isTri ? 2.1 : selectedVariant?.specifications?.acceleration0100 || 3.2;
  const peakPowerKw = isTri ? 750 : selectedVariant?.specifications?.peakPowerKw || 500;
  const curbWeightKg = (selectedVariant?.specifications?.curbWeightKg || 1920) + (isTri ? 90 : 0);

  const customization: VehicleCustomization = {
    paintColor,
    caliperColor,
    wheelStyle,
    powertrain,
    interiorTrim,
    isXRay,
    explodedProgress,
  };

  const paints = [
    { name: 'Hyperion Electric Cyan', hex: '#00F0FF' },
    { name: 'Obsidian Stealth Black', hex: '#111111' },
    { name: 'Liquid Cyber Silver', hex: '#8E8E93' },
    { name: 'Alpine Arctic White', hex: '#F5F5F7' },
    { name: 'Formula Track Red', hex: '#E50914' },
  ];

  const calipers = [
    { name: 'Electric Cyan', hex: '#00F0FF' },
    { name: 'Racing Yellow', hex: '#EAB308' },
    { name: 'Acid Green', hex: '#22C55E' },
    { name: 'Stealth Black', hex: '#1F2937' },
  ];

  const handleSaveConfiguration = async () => {
    if (!selectedVariant) return;
    setIsSaving(true);
    try {
      const res = await api.configurator.save({
        variantId: selectedVariant.id,
        name: configName,
        components: ['CMP-BAT-82KW', 'CMP-MOT-250KW', 'CMP-BRK-BREMBO-CC', 'CMP-WHL-AERO-21'],
        paintColor,
      });

      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#0070F3', '#FFFFFF'],
        });
        setSaveSuccessMessage(`Configuration ${res.data.configCode} saved to PostgreSQL!`);
        setTimeout(() => setSaveSuccessMessage(null), 4000);

        // Refresh saved configs list
        const refreshed = await api.configurator.getAll();
        if (refreshed.success) setSavedConfigs(refreshed.data);
      }
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1700px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Digital Vehicle Studio</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            {selectedModel?.name || 'AE-Apex Hyper-GT'}
          </h1>
        </div>

        {/* Live Calculation Counters */}
        <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2">
            <span className="text-[10px] text-neutral-400 block uppercase">EST. PRICE</span>
            <span className="text-lg font-bold text-white">${totalPrice.toLocaleString()}</span>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2">
            <span className="text-[10px] text-neutral-400 block uppercase">0–100 KM/H</span>
            <span className="text-lg font-bold text-[#00F0FF]">{acceleration0100}s</span>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2">
            <span className="text-[10px] text-neutral-400 block uppercase">RANGE</span>
            <span className="text-lg font-bold text-white">{rangeKm} km</span>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2">
            <span className="text-[10px] text-neutral-400 block uppercase">PEAK POWER</span>
            <span className="text-lg font-bold text-white">{peakPowerKw} kW</span>
          </div>

          {/* Magnetic Save Configuration */}
          <Magnetic intensity={0.25} range={80}>
            <button
              onClick={handleSaveConfiguration}
              disabled={isSaving}
              className="bg-[#00F0FF] text-black hover:bg-white font-bold text-xs uppercase px-5 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-[#00F0FF]/25"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Persisting...' : 'Save Configuration'}</span>
            </button>
          </Magnetic>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="mb-4 p-3 bg-[#00F0FF]/15 border border-[#00F0FF]/40 rounded-xl text-xs font-mono text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00F0FF]" />
            {saveSuccessMessage}
          </span>
          <button onClick={() => setSaveSuccessMessage(null)} className="text-neutral-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Viewport (7 Cols) */}
        <div className="lg:col-span-8 bg-[#080808] border border-white/10 rounded-3xl h-[650px] relative overflow-hidden shadow-2xl">
          <AutomotiveCanvas
            customization={customization}
            enableControls={true}
            autoRotate={false}
            cameraPosition={[3.8, 1.8, 4.8]}
          />

          {/* Quick HUD controls overlay on canvas */}
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={() => setIsXRay(!isXRay)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                isXRay
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-black/60 text-white border-white/10 hover:border-white/30'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>X-Ray Chassis</span>
            </button>

            <button
              onClick={() => setExplodedProgress(explodedProgress > 0 ? 0 : 0.85)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center space-x-1.5 border transition-all ${
                explodedProgress > 0
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-black/60 text-white border-white/10 hover:border-white/30'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{explodedProgress > 0 ? 'Assemble' : 'Explode'}</span>
            </button>
          </div>

          {/* Bottom right: Spec Sheet & History Trigger */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={() => setIsSpecSheetOpen(true)}
              className="bg-black/70 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-mono border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3 h-3 text-[#00F0FF]" />
              <span>Spec Sheet</span>
            </button>

            <button
              onClick={() => setIsSavedDrawerOpen(true)}
              className="bg-black/70 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-mono border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <span>Saved ({savedConfigs.length})</span>
            </button>
          </div>
        </div>

        {/* Right Column: Customizer Control Deck (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Configuration Title */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10">
            <label className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block mb-1">
              Configuration Tag
            </label>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          {/* Model & Variant Selector */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase block mb-2">
                1. Vehicle Model Architecture
              </span>
              <div className="grid grid-cols-3 gap-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m);
                      if (m.variants && m.variants.length > 0) setSelectedVariant(m.variants[0]);
                    }}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                      selectedModel?.id === m.id
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white font-semibold'
                        : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{m.name}</div>
                    <div className="text-[9px] font-mono text-neutral-500">{m.segment}</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedModel?.variants && (
              <div>
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block mb-2">
                  Drivetrain Package
                </span>
                <div className="space-y-1.5">
                  {selectedModel.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.variantCode.includes('TRI')) setPowertrain('tri');
                        else setPowertrain('dual');
                      }}
                      className={`w-full p-3 rounded-xl text-left border text-xs flex items-center justify-between transition-all ${
                        selectedVariant?.id === v.id
                          ? 'bg-white/10 border-white/30 text-white font-medium'
                          : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div>{v.name}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{v.drivetrain}</div>
                      </div>
                      <div className="font-mono text-[#00F0FF]">${v.basePrice.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Component Tabs Deck */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10">
            {/* Tabs */}
            <div className="flex border-b border-white/10 pb-3 mb-4 space-x-4 overflow-x-auto text-xs font-mono">
              {[
                { id: 'paint', label: 'Exterior' },
                { id: 'wheels', label: 'Wheels' },
                { id: 'brakes', label: 'Braking' },
                { id: 'powertrain', label: 'Powertrain' },
                { id: 'interior', label: 'Cockpit' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id as any)}
                  className={`pb-1 tracking-wider uppercase transition-colors relative ${
                    activeCategoryTab === tab.id ? 'text-[#00F0FF] font-bold' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {activeCategoryTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F0FF]" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: Paint */}
            {activeCategoryTab === 'paint' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-neutral-400">Exterior CMF Coating</span>
                <div className="grid grid-cols-1 gap-2">
                  {paints.map((p) => (
                    <button
                      key={p.hex}
                      onClick={() => setPaintColor(p.hex)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        paintColor === p.hex
                          ? 'bg-white/10 border-[#00F0FF] text-white'
                          : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span className="text-xs">{p.name}</span>
                      </div>
                      {paintColor === p.hex && <Check className="w-4 h-4 text-[#00F0FF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Wheels */}
            {activeCategoryTab === 'wheels' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-neutral-400">Rim Architecture</span>
                <div className="space-y-2">
                  {[
                    { id: 'aero', name: '21" Aero Carbon Blade Wheels', price: '+$4,600', desc: 'Precision monoblock with active carbon air vanes' },
                    { id: 'forged', name: '20" Ultra-Lightweight Forged Track', price: '+$3,200', desc: 'Forged 6061-T6 aluminum aerospace spec' },
                    { id: 'turbine', name: '22" Cyber Turbine Sport Rims', price: '+$5,100', desc: 'Directional aerodynamic spoke geometry' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWheelStyle(w.id as any)}
                      className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        wheelStyle === w.id
                          ? 'bg-white/10 border-[#00F0FF] text-white'
                          : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{w.name}</div>
                        <div className="text-[10px] text-neutral-500">{w.desc}</div>
                      </div>
                      <div className="font-mono text-xs text-[#00F0FF]">{w.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Brakes */}
            {activeCategoryTab === 'brakes' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-neutral-400">Brembo 6-Piston Caliper Finish</span>
                <div className="grid grid-cols-2 gap-2">
                  {calipers.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setCaliperColor(c.hex)}
                      className={`p-3 rounded-xl border flex items-center space-x-2 transition-all ${
                        caliperColor === c.hex
                          ? 'bg-white/10 border-[#00F0FF] text-white'
                          : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Powertrain */}
            {activeCategoryTab === 'powertrain' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-neutral-400">Electric Drive Unit Configuration</span>
                <div className="space-y-2">
                  <button
                    onClick={() => setPowertrain('dual')}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      powertrain === 'dual'
                        ? 'bg-white/10 border-[#00F0FF] text-white'
                        : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">Dual Axial-Flux AWD (500 kW)</div>
                      <div className="text-[10px] text-neutral-500">82 kWh Battery • 0–100 in 3.2s • 520 km Range</div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">Standard</span>
                  </button>

                  <button
                    onClick={() => setPowertrain('tri')}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      powertrain === 'tri'
                        ? 'bg-white/10 border-[#00F0FF] text-white'
                        : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">Tri-Motor Cyber Track (750 kW)</div>
                      <div className="text-[10px] text-neutral-500">105 kWh Solid-State • 0–100 in 2.1s • 610 km Range</div>
                    </div>
                    <span className="text-xs font-mono text-[#00F0FF]">+$50,000</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 5: Interior */}
            {activeCategoryTab === 'interior' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-neutral-400">Cockpit Monocoque CMF</span>
                <div className="space-y-2">
                  {[
                    { id: 'carbon', name: 'Stealth Autoclave Carbon & Alcantara', price: 'Standard' },
                    { id: 'white', name: 'Arctic Minimalist Nappa Leather', price: '+$4,200' },
                    { id: 'titanium', name: 'Raw Aerospace Titanium & Microfiber', price: '+$3,800' },
                  ].map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setInteriorTrim(i.id as any)}
                      className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        interiorTrim === i.id
                          ? 'bg-white/10 border-[#00F0FF] text-white'
                          : 'bg-black/30 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-medium">{i.name}</span>
                      <span className="font-mono text-xs text-[#00F0FF]">{i.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Configurations Modal / Drawer */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-white/15 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-display font-bold text-white">Database Persisted Configurations</h3>
                <p className="text-xs text-neutral-400 font-mono">Stored in PostgreSQL via ACID transaction table</p>
              </div>
              <button onClick={() => setIsSavedDrawerOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {savedConfigs.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                  No vehicle configurations found in database. Create and save one!
                </div>
              ) : (
                savedConfigs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">{cfg.name}</div>
                      <div className="text-[11px] font-mono text-[#00F0FF]">{cfg.configCode}</div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        {cfg.variant?.model?.name || 'AE-Apex GT'} • {cfg.calculatedRange} km Range • {cfg.totalWeight} kg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-white">${cfg.totalPrice.toLocaleString()}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {cfg.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Engineering Spec Sheet Modal */}
      {isSpecSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-white/15 rounded-3xl p-8 max-w-2xl w-full shadow-2xl font-mono text-xs space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] text-[#00F0FF] uppercase tracking-widest">
                  AUTOENGINE • OFFICIAL SPECIFICATION
                </span>
                <h3 className="text-xl font-display font-extrabold text-white mt-1">
                  {selectedModel?.name} — {configName}
                </h3>
              </div>
              <button onClick={() => setIsSpecSheetOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-neutral-500 text-[10px]">PROGRAM ARCHITECTURE</span>
                <div className="text-white font-bold">{selectedModel?.project?.projectCode || 'PRJ-APEX-01'}</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">DRIVETRAIN</span>
                <div className="text-white font-bold">{isTri ? 'Tri-Motor Performance AWD' : 'Dual-Motor AWD'}</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">TOTAL POWER OUTPUT</span>
                <div className="text-[#00F0FF] font-bold">{peakPowerKw} kW ({(peakPowerKw * 1.341).toFixed(0)} HP)</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">0–100 KM/H ACCELERATION</span>
                <div className="text-[#00F0FF] font-bold">{acceleration0100} Seconds</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">ENERGY STORAGE</span>
                <div className="text-white font-bold">{isTri ? '105 kWh Solid-State Pack' : '82 kWh Liquid-Cooled NMC'}</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">CURB WEIGHT</span>
                <div className="text-white font-bold">{curbWeightKg} kg</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">AERODYNAMIC DRAG</span>
                <div className="text-white font-bold">0.208 Cd</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">ESTIMATED MSRP</span>
                <div className="text-emerald-400 font-bold">${totalPrice.toLocaleString()} USD</div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.print()}
                className="bg-white text-black hover:bg-[#00F0FF] px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Spec Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguratorPage;

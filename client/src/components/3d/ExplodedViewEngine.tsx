import React, { useState } from 'react';
import AutomotiveCanvas from './AutomotiveCanvas';
import ComponentInspectorFlyout from './ComponentInspectorFlyout';
import { VehicleCustomization } from './VehicleModel3D';
import { Layers, Sliders, Info, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Magnetic } from '../core/magnetic';

interface ExplodedViewEngineProps {
  onNavigateToComponent?: (partNumber: string) => void;
}

export const ExplodedViewEngine: React.FC<ExplodedViewEngineProps> = ({ onNavigateToComponent }) => {
  const [explodedProgress, setExplodedProgress] = useState(0.8);
  const [isXRay, setIsXRay] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<{ name: string; meta: any } | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const customization: VehicleCustomization = {
    paintColor: '#00F0FF',
    caliperColor: '#00F0FF',
    wheelStyle: 'aero',
    powertrain: 'dual',
    interiorTrim: 'carbon',
    isXRay,
    explodedProgress,
  };

  const layers = [
    { label: 'AERODYNAMIC CARBON BODY', spec: 'Cd 0.208 • Active DRS Wing', height: 'Top Tier' },
    { label: 'COCKPIT & INTERIOR', spec: '37" Curved OLED • Recaro Carbon', height: 'Upper Tier' },
    { label: '800V SKATEBOARD BATTERY', spec: '82 kWh Liquid-Cooled • 350 kW Charge', height: 'Structural Core' },
    { label: 'DUAL ELECTRIC MOTORS', spec: 'Dual 250 kW Axial-Flux • 20,000 RPM', height: 'Powertrain Line' },
    { label: 'ADAPTIVE AIR SUSPENSION', spec: 'Bilstein Pneumatic • Brembo Carbon Brakes', height: 'Kinematic Link' },
    { label: '21" FORGED AERO WHEELS', spec: 'Michelin Pilot Sport EV • Aeroblade', height: 'Ground Plane' },
  ];

  return (
    <div className="relative w-full h-[85vh] bg-[#070707] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <AutomotiveCanvas
          customization={customization}
          onSelectComponent={(name, meta) => setSelectedComponent({ name, meta })}
          hoveredComponent={hoveredComponent}
          setHoveredComponent={setHoveredComponent}
          enableControls={true}
          autoRotate={explodedProgress === 0}
          cameraPosition={[4.5, 2.2, 5.2]}
        />
      </div>

      {/* Floating Left: Interactive Layers Legend */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none hidden md:block max-w-xs space-y-2">
        <div className="glass-panel rounded-2xl p-4 border border-white/10 pointer-events-auto">
          <div className="flex items-center space-x-2 text-[#00F0FF] mb-2 font-mono text-xs tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Sub-Assembly Stack</span>
          </div>

          <div className="space-y-1.5">
            {layers.map((l, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-colors cursor-pointer border border-transparent hover:border-[#00F0FF]/30"
                onClick={() =>
                  setSelectedComponent({
                    name: l.label,
                    meta: { specs: l.spec, category: l.height, status: 'APPROVED' },
                  })
                }
              >
                <div className="text-[11px] font-semibold text-white tracking-wide">{l.label}</div>
                <div className="text-[9px] font-mono text-neutral-400">{l.spec}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom: Interactive Explosion Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto">
        <div className="glass-panel rounded-full px-6 py-3 border border-white/15 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-2xl">
          {/* Explosion Slider */}
          <div className="flex items-center space-x-3 flex-1">
            <Sliders className="w-4 h-4 text-[#00F0FF] shrink-0" />
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline">
              Separation
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodedProgress}
              onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-white w-10 text-right">
              {Math.round(explodedProgress * 100)}%
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
            <button
              onClick={() => setExplodedProgress(explodedProgress > 0.1 ? 0 : 0.85)}
              className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-[#00F0FF] hover:text-black transition-colors"
            >
              {explodedProgress > 0.1 ? 'Assemble' : 'Explode'}
            </button>

            <button
              onClick={() => setIsXRay(!isXRay)}
              className={`p-2 rounded-full text-xs transition-colors ${
                isXRay ? 'bg-[#00F0FF] text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Toggle X-Ray Internal View"
            >
              {isXRay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Flyout panel on component select */}
      <ComponentInspectorFlyout
        selectedComponent={selectedComponent}
        onClose={() => setSelectedComponent(null)}
        onNavigateToComponent={onNavigateToComponent}
      />
    </div>
  );
};

export default ExplodedViewEngine;

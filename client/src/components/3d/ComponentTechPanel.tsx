import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  Cpu,
  Shield,
  Layers,
  Wrench,
  Maximize2,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Zap,
  Activity,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { Magnetic } from '../core/magnetic';

export interface ComponentDetailData {
  id?: string;
  name: string;
  category: string;
  partNumber: string;
  manufacturer: string;
  supplier?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  cost?: string | number;
  specs?: string;
  status?: string;
  notes?: string;
  compatibleAlternatives?: Array<{
    id: string;
    name: string;
    partNumber: string;
    costUsd: number;
    manufacturer: string;
    material?: string;
    category?: string;
  }>;
}

interface ComponentTechPanelProps {
  component: ComponentDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  isIsolated: boolean;
  onToggleIsolate: () => void;
  isHidden: boolean;
  onToggleHide: () => void;
  onResetVehicle: () => void;
  onSelectAlternative?: (alt: any) => void;
  onAddToCart?: (component: ComponentDetailData) => void;
}

export const ComponentTechPanel: React.FC<ComponentTechPanelProps> = ({
  component,
  isOpen,
  onClose,
  isIsolated,
  onToggleIsolate,
  isHidden,
  onToggleHide,
  onResetVehicle,
  onSelectAlternative,
  onAddToCart,
}) => {
  if (!component || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 380 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 380 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-20 right-4 bottom-4 z-40 w-96 max-w-[calc(100vw-2rem)] flex flex-col bg-[#08090B]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden font-sans text-white"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 255, 0.1)',
        }}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between bg-[#111318]/60">
          <div className="space-y-1.5 pr-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center gap-1 font-semibold">
                <Cpu className="w-3 h-3" />
                <span>{component.category || 'VEHICLE COMPONENT'}</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>{component.status || 'VERIFIED'}</span>
              </span>
            </div>

            <h3 className="text-base font-display font-extrabold text-white tracking-wide leading-tight">
              {component.name}
            </h3>

            <div className="text-[11px] font-mono text-neutral-400">
              Part No: <span className="text-white font-bold">{component.partNumber}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
            title="Close Technical Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Technical Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs font-mono">
          {/* 3D Asset Live Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#00E5FF]/10 to-transparent border border-[#00E5FF]/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[11px] text-[#00E5FF]">
              <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              <span className="font-bold">LIVE 3D ACTIVE MESH</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-sans">60 FPS Real-time</span>
          </div>

          {/* Core Engineering Specs Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#111318] border border-white/5 space-y-0.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">MANUFACTURER</span>
              <span className="text-white font-bold text-[11px] truncate block">
                {component.manufacturer || 'AUTOENGINE LABS'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#111318] border border-white/5 space-y-0.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">TIER-1 SUPPLIER</span>
              <span className="text-[#00E5FF] font-bold text-[11px] truncate block flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#00E5FF]" />
                {component.supplier || 'Brembo Racing'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#111318] border border-white/5 space-y-0.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">MATERIAL SPEC</span>
              <span className="text-neutral-200 text-[11px] truncate block">
                {component.material || 'Autoclave Carbon / Forged Alloy'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#111318] border border-white/5 space-y-0.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">MASS / WEIGHT</span>
              <span className="text-neutral-200 text-[11px] truncate block">
                {component.weight || '32.0 kg'}
              </span>
            </div>

            {component.dimensions && (
              <div className="col-span-2 p-3 rounded-2xl bg-[#111318] border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">DIMENSIONS / FITMENT</span>
                <span className="text-neutral-200 text-[11px] truncate block">{component.dimensions}</span>
              </div>
            )}

            {component.cost && (
              <div className="col-span-2 p-3 rounded-2xl bg-[#111318] border border-white/5 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500">ESTIMATED COMPONENT COST</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {typeof component.cost === 'number'
                    ? `$${component.cost.toLocaleString()}`
                    : component.cost}
                </span>
              </div>
            )}
          </div>

          {/* Description & Technical Specifications */}
          {component.specs && (
            <div className="p-3.5 rounded-2xl bg-[#111318] border border-white/5 space-y-1.5">
              <span className="text-[10px] text-[#00E5FF] uppercase font-bold tracking-wider block">
                ENGINEERING NOTES & TELEMETRY
              </span>
              <p className="text-neutral-300 text-xs leading-relaxed font-sans">
                {component.specs}
              </p>
            </div>
          )}

          {/* Compatible Replacements & Alternatives */}
          {component.compatibleAlternatives && component.compatibleAlternatives.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Compatible Replacements ({component.compatibleAlternatives.length})</span>
                </span>
                <span className="text-[9px] text-neutral-500 font-mono">Click to Swap in 3D</span>
              </div>

              <div className="space-y-2">
                {component.compatibleAlternatives.map((alt) => (
                  <button
                    key={alt.id || alt.partNumber}
                    onClick={() => onSelectAlternative?.(alt)}
                    className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-[#00E5FF]/10 border border-white/10 hover:border-[#00E5FF]/40 transition-all group flex items-center justify-between"
                  >
                    <div className="pr-2 space-y-0.5">
                      <div className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-tight">
                        {alt.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {alt.manufacturer} • {alt.material || 'OEM Spec'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400">
                        ${alt.costUsd?.toLocaleString() || 'OEM'}
                      </div>
                      <div className="text-[9px] text-[#00E5FF] flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Swap</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 border-t border-white/10 bg-[#111318]/90 space-y-2">
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(component)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold bg-[#00E5FF] text-black hover:bg-white transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-[#00E5FF]/20"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add Component to Cart ({typeof component.cost === 'number' ? `$${component.cost.toLocaleString()}` : component.cost || '$4,800'})</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleIsolate}
              className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                isIsolated
                  ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-lg shadow-[#00E5FF]/20'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isIsolated ? 'Show Vehicle' : 'Isolate Part'}</span>
            </button>

            <button
              onClick={onToggleHide}
              className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                isHidden
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
              }`}
            >
              {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isHidden ? 'Unhide Part' : 'Hide Part'}</span>
            </button>
          </div>

          <button
            onClick={onResetVehicle}
            className="w-full py-2 px-3 rounded-xl text-[11px] font-mono text-neutral-400 hover:text-white bg-transparent hover:bg-white/5 transition-colors flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3 h-3 text-neutral-500" />
            <span>Return to Complete Vehicle</span>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default ComponentTechPanel;

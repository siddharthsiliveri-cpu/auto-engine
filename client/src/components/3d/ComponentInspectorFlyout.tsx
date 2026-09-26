import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Cpu, Zap, Shield, ExternalLink, ArrowRight } from 'lucide-react';
import { Magnetic } from '../core/magnetic';

interface ComponentInspectorFlyoutProps {
  selectedComponent: {
    name: string;
    meta: {
      partNumber?: string;
      category?: string;
      manufacturer?: string;
      supplier?: string;
      specs?: string;
      status?: string;
      weight?: string;
      cost?: string;
    };
  } | null;
  onClose: () => void;
  onNavigateToComponent?: (partNumber: string) => void;
}

export const ComponentInspectorFlyout: React.FC<ComponentInspectorFlyoutProps> = ({
  selectedComponent,
  onClose,
  onNavigateToComponent,
}) => {
  return (
    <AnimatePresence>
      {selectedComponent && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 right-8 z-40 w-96 max-w-[calc(100vw-2rem)] glass-panel rounded-2xl p-6 shadow-2xl shadow-black/80 border border-[#00F0FF]/30 glow-cyan backdrop-blur-2xl"
        >
          {/* Top header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {selectedComponent.meta.category || 'ENGINEERING SUBSYSTEM'}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {selectedComponent.meta.status || 'APPROVED'}
                </span>
              </div>
              <h3 className="text-sm font-display font-bold text-white tracking-wide leading-snug">
                {selectedComponent.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Part Number & Specs */}
          <div className="space-y-3 mb-6 bg-black/40 rounded-xl p-3.5 border border-white/5 font-mono text-xs">
            <div className="flex justify-between items-center text-neutral-400 pb-2 border-b border-white/5">
              <span>PART NUMBER</span>
              <span className="text-white font-semibold">{selectedComponent.meta.partNumber || 'CMP-GEN-01'}</span>
            </div>

            <div className="flex justify-between items-center text-neutral-400 pb-2 border-b border-white/5">
              <span>MANUFACTURER</span>
              <span className="text-white">{selectedComponent.meta.manufacturer || 'AutoEngine Lab'}</span>
            </div>

            <div className="flex justify-between items-center text-neutral-400 pb-2 border-b border-white/5">
              <span>TIER-1 SUPPLIER</span>
              <span className="text-[#00F0FF] flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {selectedComponent.meta.supplier || 'Bosch Mobility Solutions'}
              </span>
            </div>

            {selectedComponent.meta.weight && (
              <div className="flex justify-between items-center text-neutral-400 pb-2 border-b border-white/5">
                <span>SUB-ASSEMBLY MASS</span>
                <span className="text-white">{selectedComponent.meta.weight}</span>
              </div>
            )}

            <div className="pt-1">
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">TECHNICAL SPECIFICATIONS</span>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {selectedComponent.meta.specs || 'Certified for 800V silicon-carbide architecture.'}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2">
            <Magnetic intensity={0.2} range={60} className="w-full">
              <button
                onClick={() => {
                  onNavigateToComponent?.(selectedComponent.meta.partNumber || '');
                  onClose();
                }}
                className="w-full bg-[#00F0FF] text-black hover:bg-white font-medium text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-[#00F0FF]/20"
              >
                <span>Full Telemetry Spec</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Magnetic>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComponentInspectorFlyout;

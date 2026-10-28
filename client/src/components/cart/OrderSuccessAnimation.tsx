import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Truck,
  FileText,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Car,
  Activity,
} from 'lucide-react';

interface OrderSuccessAnimationProps {
  orderNumber: string;
  vin?: string;
  customerName: string;
  totalAmount: number;
  deliveryMethod?: string;
  estimatedDelivery?: string;
  onViewReceipt: () => void;
  onTrackDelivery: () => void;
}

export const OrderSuccessAnimation: React.FC<OrderSuccessAnimationProps> = ({
  orderNumber,
  vin,
  customerName,
  totalAmount,
  deliveryMethod,
  estimatedDelivery,
  onViewReceipt,
  onTrackDelivery,
}) => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage 1: Progress build pipeline
    const timer1 = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer1);
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    // Multi-shot celebration confetti cannon
    const fireConfetti = () => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6, x: 0.3 },
        colors: ['#00F0FF', '#38BDF8', '#10B981', '#FFFFFF'],
      });
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6, x: 0.7 },
        colors: ['#00F0FF', '#38BDF8', '#EAB308', '#FFFFFF'],
      });
    };

    fireConfetti();
    const interval = setInterval(fireConfetti, 1200);

    const stepTimer = setTimeout(() => {
      setStep(2);
    }, 1800);

    return () => {
      clearInterval(timer1);
      clearInterval(interval);
      clearTimeout(stepTimer);
    };
  }, []);

  // Format estimated delivery date (5-6 days)
  const formattedDelivery = estimatedDelivery
    ? new Date(estimatedDelivery).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 5);
        return d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden select-none"
    >
      {/* Background Holographic Scanlines & Neon Glow */}
      <div className="absolute inset-0 pointer-events-none technical-grid opacity-20" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00F0FF]/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Sweeping Cyan Laser Scan Line */}
      <motion.div
        animate={{ y: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00F0FF]/80 to-transparent shadow-[0_0_20px_#00F0FF] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-2xl bg-[#090B0E]/90 border border-[#00F0FF]/40 rounded-3xl p-6 md:p-10 shadow-[0_0_60px_rgba(0,240,255,0.25)] space-y-6 text-center text-white font-sans">
        {/* Hologram Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#00F0FF]/20 via-[#00F0FF]/10 to-transparent border-2 border-[#00F0FF] flex items-center justify-center shadow-[0_0_35px_#00F0FF] relative"
        >
          <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-[#00F0FF]" />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-3xl border border-[#00F0FF]"
          />
        </motion.div>

        {/* Title & Commissioning Status */}
        <div className="space-y-1.5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[11px] font-mono text-[#00F0FF] uppercase tracking-widest font-bold"
          >
            <Sparkles className="w-3 h-3" />
            <span>COMMISSIONING ORDER CONFIRMED</span>
          </motion.div>

          <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-wide uppercase">
            Build Successfully Placed!
          </h2>

          <p className="text-xs md:text-sm text-neutral-400 font-mono">
            Thank you, <span className="text-white font-bold">{customerName}</span>. Your bespoke automotive build is now allocated into active production.
          </p>
        </div>

        {/* High-Tech Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Order Ref */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">
              ORDER REFERENCE
            </span>
            <div className="text-white font-bold text-xs truncate text-[#00F0FF]">{orderNumber}</div>
          </div>

          {/* Assigned VIN */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block tracking-wider">
              ASSIGNED CHASSIS VIN
            </span>
            <div className="text-white font-bold text-xs tracking-wider">{vin || '1AE98F2741US'}</div>
          </div>

          {/* Express Estimated Delivery (5-6 Days) */}
          <div className="p-3.5 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 space-y-1">
            <span className="text-[10px] text-[#00F0FF] uppercase block tracking-wider font-bold flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>ESTIMATED HANDOVER</span>
            </span>
            <div className="text-emerald-400 font-bold text-xs">
              {formattedDelivery} <span className="text-[10px] text-white font-normal">(5-6 Days)</span>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#00F0FF] animate-spin" />
              <span>
                {progress < 40
                  ? 'Verifying escrow & financial settlement...'
                  : progress < 80
                  ? 'Allocating factory carbon-chassis tooling...'
                  : 'White-glove 5-6 day express handover queued!'}
              </span>
            </span>
            <span className="text-[#00F0FF] font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] via-[#38BDF8] to-emerald-400 shadow-[0_0_12px_#00F0FF]"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
          <button
            onClick={onTrackDelivery}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#00F0FF] text-black hover:bg-white font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#00F0FF]/30 flex items-center justify-center space-x-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Delivery Live (5-6 Days)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onViewReceipt}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider transition-colors border border-white/10 flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4 text-[#00F0FF]" />
            <span>View Build Spec Sheet</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSuccessAnimation;

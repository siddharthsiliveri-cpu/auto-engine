import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StartupLoaderProps {
  onComplete?: () => void;
}

export const StartupLoader: React.FC<StartupLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFinished(true);
            onComplete?.();
          }, 300);
          return 100;
        }
        const increment = Math.floor(Math.random() * 18) + 8;
        return Math.min(prev + increment, 100);
      });
    }, 90);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[10000] bg-[#050505] flex flex-col items-center justify-center p-6 select-none"
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            {/* Minimalist automotive emblem / pulse */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center relative"
            >
              <div className="w-2.5 h-2.5 bg-[#00F0FF] rounded-full animate-ping opacity-75" />
              <div className="w-2 h-2 bg-[#00F0FF] rounded-full absolute" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-white font-display mb-2"
            >
              AUTOENGINE
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs md:text-sm font-mono tracking-[0.2em] text-neutral-400 mb-8 uppercase"
            >
              DIGITAL ENGINEERING PLATFORM
            </motion.p>

            {/* Progress bar */}
            <div className="w-64 h-[2px] bg-neutral-900 rounded-full overflow-hidden relative mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0070F3]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
              />
            </div>

            {/* Progress text */}
            <div className="flex justify-between w-64 text-[10px] font-mono text-neutral-500">
              <span>SYSTEM INITIALIZATION</span>
              <span>{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartupLoader;

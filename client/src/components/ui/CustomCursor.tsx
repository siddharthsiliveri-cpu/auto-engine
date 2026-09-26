import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | '3d' | 'drag'>('default');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 350 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 350 });

  useEffect(() => {
    // Check if touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Detect hovered element type
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, input, select, textarea, [role="button"], [data-cursor="pointer"]');
      const canvas3D = target.closest('canvas, [data-cursor="3d"]');

      if (interactive) {
        setCursorType('pointer');
      } else if (canvas3D) {
        setCursorType('3d');
      } else {
        setCursorType('default');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Outer subtle glow ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F0FF]/40 mix-blend-screen transition-all duration-150"
        style={{
          x: smoothX,
          y: smoothY,
          width: cursorType === 'pointer' ? 44 : cursorType === '3d' ? 52 : 28,
          height: cursorType === 'pointer' ? 44 : cursorType === '3d' ? 52 : 28,
          backgroundColor: cursorType === 'pointer' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 240, 255, 0.03)',
        }}
      />
      {/* Inner precise dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00F0FF] transition-all duration-75"
        style={{
          x: mouseX,
          y: mouseY,
          width: cursorType === 'pointer' ? 6 : cursorType === '3d' ? 8 : 4,
          height: cursorType === 'pointer' ? 6 : cursorType === '3d' ? 8 : 4,
        }}
      />
    </>
  );
};

export default CustomCursor;

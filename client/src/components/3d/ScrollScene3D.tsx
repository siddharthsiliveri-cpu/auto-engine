import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import VehicleModel3D, { VehicleCustomization } from './VehicleModel3D';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Cpu, Activity, Shield, Zap } from 'lucide-react';

interface CameraRigProps {
  stage: number;
  stageProgress: number; // 0 to 1 within current stage
}

// Camera Rig interpolates camera position and rotation smoothly based on the scroll stage
const CameraRig: React.FC<CameraRigProps> = ({ stage, stageProgress }) => {
  useFrame((state, delta) => {
    // Camera positions per stage:
    // 1: Exterior - [3.8, 1.8, 4.8], looking at [0, 0.4, 0]
    // 2: Body Panels - [2.5, 1.2, 2.8], looking at [0, 0.5, 0.8]
    // 3: Cockpit Interior - [0.0, 1.05, 0.5], looking at [0, 0.7, -0.2]
    // 4: Battery & Powertrain - [3.2, 2.6, 3.6], looking at [0, 0.2, 0]
    // 5: Suspension & Brakes - [1.9, 0.6, 2.0], looking at [1.0, 0.3, 1.45]
    // 6: Final Road Ready - [4.2, 1.6, 4.2], looking at [0, 0.4, 0]

    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();

    if (stage === 1) {
      targetPos.set(3.8, 1.8, 4.8);
      targetLook.set(0, 0.4, 0);
    } else if (stage === 2) {
      targetPos.set(2.4, 1.1, 2.6);
      targetLook.set(0.2, 0.5, 0.8);
    } else if (stage === 3) {
      targetPos.set(0.1, 1.1, 0.6);
      targetLook.set(0, 0.65, -0.2);
    } else if (stage === 4) {
      targetPos.set(3.4, 2.8, 3.8);
      targetLook.set(0, 0.2, 0);
    } else if (stage === 5) {
      targetPos.set(1.9, 0.6, 2.1);
      targetLook.set(1.0, 0.35, 1.45);
    } else {
      targetPos.set(4.2, 1.6, 4.2);
      targetLook.set(0, 0.4, 0);
    }

    state.camera.position.lerp(targetPos, delta * 2.8);
    const currentLook = new THREE.Vector3(0, 0.4, 0);
    currentLook.lerp(targetLook, delta * 2.8);
    state.camera.lookAt(currentLook);
  });

  return null;
};

export const ScrollScene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(1);
  const [stageProgress, setStageProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      // 6 stages mapped to progress range 0.0 to 1.0
      // 0.00 - 0.16 -> Stage 1
      // 0.16 - 0.33 -> Stage 2
      // 0.33 - 0.50 -> Stage 3
      // 0.50 - 0.67 -> Stage 4
      // 0.67 - 0.84 -> Stage 5
      // 0.84 - 1.00 -> Stage 6
      const stageIndex = Math.min(Math.floor(v * 6) + 1, 6);
      setActiveStage(stageIndex);
      const subProg = (v * 6) % 1;
      setStageProgress(subProg);
    });
  }, [scrollYProgress]);

  // Dynamic customization state derived from scroll stage
  const customization: VehicleCustomization = {
    paintColor: '#00F0FF',
    caliperColor: '#00F0FF',
    wheelStyle: 'aero',
    powertrain: 'dual',
    interiorTrim: activeStage === 3 ? 'white' : 'carbon',
    isXRay: activeStage === 4,
    explodedProgress: activeStage === 4 ? 0.85 : activeStage === 5 ? 0.35 : 0,
  };

  const stages = [
    {
      stage: 1,
      tag: 'STAGE 01 — EXTERIOR ARCHITECTURE',
      title: 'THE COMPLETE VEHICLE',
      subtitle: 'Sculpted by airflow. Grounded by purpose.',
      desc: 'Monolithic carbon composite surface language engineered for minimal drag and maximum downforce stability at speeds exceeding 320 km/h.',
      statLabel: 'DRAG COEFFICIENT',
      statValue: '0.208 Cd',
    },
    {
      stage: 2,
      tag: 'STAGE 02 — SURFACE AERODYNAMICS',
      title: 'PRECISION BODY ENGINEERING',
      subtitle: 'Millimeter tolerances. Active aerodynamic control.',
      desc: 'Front air curtains, underbody venturi tunnels, and dual-plane motorized DRS rear wing provide automated downforce trimming in real-time.',
      statLabel: 'PEAK DOWNFORCE',
      statValue: '450 KG',
    },
    {
      stage: 3,
      tag: 'STAGE 03 — INTERIOR ERGONOMICS',
      title: 'DESIGNED AROUND THE DRIVER',
      subtitle: 'Where human focus meets machine telemetry.',
      desc: 'Continuous 37-inch 8K curved panoramic OLED cluster paired with dual Recaro autoclave carbon fiber monocoque bucket seats.',
      statLabel: 'GLASS DISPLAY',
      statValue: '37" 8K OLED',
    },
    {
      stage: 4,
      tag: 'STAGE 04 — POWERTRAIN & ENERGY',
      title: 'ENGINEERED FROM THE INSIDE OUT',
      subtitle: '800V structural energy. Zero wasted volume.',
      desc: 'Prismatic liquid-cooled 82 kWh battery pack integrated directly into the structural aluminum skateboard floor, feeding dual axial-flux motors.',
      statLabel: 'ENERGY DENSITY',
      statValue: '82 KWH / 800V',
    },
    {
      stage: 5,
      tag: 'STAGE 05 — CHASSIS & KINEMATICS',
      title: 'EVERY COMPONENT MATTERS',
      subtitle: 'Adaptive damping. Sub-millisecond reaction.',
      desc: 'Bilstein triple-chamber adaptive air suspension paired with 410mm Brembo carbon-ceramic ventilated rotors and 6-piston monobloc calipers.',
      statLabel: 'BRAKE ACCELERATION',
      statValue: '100–0 IN 31M',
    },
    {
      stage: 6,
      tag: 'STAGE 06 — HOMOLOGATED READY',
      title: 'READY FOR THE ROAD.',
      subtitle: 'Digital twin validated. Production calibrated.',
      desc: 'Unified track-certified machine built on 19 normalized database engineering entities, ready to redefine the future of automotive mobility.',
      statLabel: '0–100 KM/H',
      statValue: '3.2 SECONDS',
    },
  ];

  const currentStageData = stages[activeStage - 1] || stages[0];

  return (
    <div ref={containerRef} className="relative w-full bg-[#050505]">
      {/* ======================================================== */}
      {/* PINNED VIEWPORT: Fixed 3D Canvas while content scrolls   */}
      {/* ======================================================== */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Ambient background glows */}
        <div className="absolute inset-0 technical-grid opacity-15 pointer-events-none" />
        <div className="absolute inset-0 radial-vignette pointer-events-none" />
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#0070F3]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* 3D WebGL Canvas */}
        <div className="absolute inset-0 z-10">
          <Canvas
            shadows
            camera={{ position: [3.8, 1.8, 4.8], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[6, 8, 5]} intensity={1.8} castShadow />
            <directionalLight position={[-6, 5, -5]} intensity={0.8} color="#00F0FF" />
            <pointLight position={[0, -0.4, 0]} intensity={2.5} color="#00F0FF" distance={4} />

            <CameraRig stage={activeStage} stageProgress={stageProgress} />

            <Suspense fallback={null}>
              <VehicleModel3D
                customization={customization}
                autoRotate={false}
              />
              <ContactShadows
                position={[0, -0.22, 0]}
                opacity={0.8}
                scale={10}
                blur={1.8}
                far={4}
                color="#000000"
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Cinematic HUD Overlay for Active Stage */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 md:p-16 max-w-7xl mx-auto">
          {/* Top Stage Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
              <span className="font-mono text-xs tracking-widest text-[#00F0FF] uppercase">
                {currentStageData.tag}
              </span>
            </div>

            {/* Stage Counter Dots */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5, 6].map((st) => (
                <div
                  key={st}
                  className={`transition-all duration-300 rounded-full ${
                    st === activeStage
                      ? 'w-6 h-1.5 bg-[#00F0FF]'
                      : 'w-1.5 h-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Narrative Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <motion.h2
                key={`title-${activeStage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-none"
              >
                {currentStageData.title}
              </motion.h2>

              <motion.p
                key={`sub-${activeStage}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base md:text-lg text-neutral-300 font-light"
              >
                {currentStageData.subtitle}
              </motion.p>

              <motion.p
                key={`desc-${activeStage}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs md:text-sm text-neutral-400 max-w-xl leading-relaxed"
              >
                {currentStageData.desc}
              </motion.p>
            </div>

            {/* Telemetry Badge */}
            <div className="lg:col-span-4 flex lg:justify-end">
              <motion.div
                key={`stat-${activeStage}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="glass-panel border border-[#00F0FF]/30 px-6 py-4 rounded-2xl glow-cyan text-left"
              >
                <div className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase mb-1">
                  {currentStageData.statLabel}
                </div>
                <div className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
                  {currentStageData.statValue}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SCROLL TRACK: Invisible spacers that drive scroll steps  */}
      {/* ======================================================== */}
      <div className="relative z-0 pointer-events-none">
        <div className="h-screen" />
        <div className="h-screen" />
        <div className="h-screen" />
        <div className="h-screen" />
        <div className="h-screen" />
        <div className="h-screen" />
      </div>
    </div>
  );
};

export default ScrollScene3D;

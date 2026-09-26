import React, { useRef } from 'react';
import AutomotiveCanvas from '../components/3d/AutomotiveCanvas';
import ScrollScene3D from '../components/3d/ScrollScene3D';
import ExplodedViewEngine from '../components/3d/ExplodedViewEngine';
import { VehicleCustomization } from '../components/3d/VehicleModel3D';
import { Magnetic } from '../components/core/magnetic';
import {
  ArrowRight,
  ArrowDown,
  Layers,
  Zap,
  Sliders,
  Database,
  Cpu,
  Shield,
  Activity,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface LandingPageProps {
  onNavigateToTab: (tab: string) => void;
  onNavigateToComponent?: (partNumber: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToTab, onNavigateToComponent }) => {
  const horizontalSectionRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll transform for engineering phases
  const { scrollYProgress } = useScroll({
    target: horizontalSectionRef,
    offset: ['start start', 'end end'],
  });

  const horizontalX = useTransform(scrollYProgress, [0, 1], ['0%', '-55%']);

  const heroCustomization: VehicleCustomization = {
    paintColor: '#00F0FF',
    caliperColor: '#00F0FF',
    wheelStyle: 'aero',
    powertrain: 'dual',
    interiorTrim: 'carbon',
    isXRay: false,
    explodedProgress: 0,
  };

  const engineeringPhases = [
    {
      num: '01',
      title: 'CONCEPT',
      desc: 'Computational fluid dynamics (CFD), aerodynamic packaging, and target benchmark definition.',
      metrics: 'Cd Target 0.208 • Homologation Blueprint',
    },
    {
      num: '02',
      title: 'DESIGN',
      desc: 'Exterior CMF sculpting, panoramic driver-centric cockpit architecture, and lighting optics.',
      metrics: 'Class-A Surfacing • VR Ergonomics',
    },
    {
      num: '03',
      title: 'ENGINEERING',
      desc: '800V skateboard chassis integration, axial-flux motor winding, and FEA crash simulations.',
      metrics: '62,000 Nm/deg Torsional Rigidity',
    },
    {
      num: '04',
      title: 'PROTOTYPE',
      desc: 'Physical alpha mule builds, dyno thermal bench testing, and hardware-in-the-loop validation.',
      metrics: '350 kW Fast Charge Thermal Test',
    },
    {
      num: '05',
      title: 'TESTING',
      desc: 'Nürburgring Nordschleife dynamic suspension tuning and full NCAP crash certification.',
      metrics: 'Sub-7 Min Target • 5-Star NCAP',
    },
    {
      num: '06',
      title: 'PRODUCTION',
      desc: 'Robotic precision assembly, automated optical inspection, and digital twin serial synchronization.',
      metrics: '19 Normalized Relational Tables in 3NF',
    },
  ];

  return (
    <div className="relative w-full bg-[#050505] text-white overflow-hidden">
      {/* ======================================================== */}
      {/* 1. CINEMATIC FULL-SCREEN 3D HERO SECTION                 */}
      {/* ======================================================== */}
      <section className="relative h-screen w-full flex flex-col justify-between p-6 md:p-12 overflow-hidden">
        {/* Background 3D rotating vehicle */}
        <div className="absolute inset-0 z-0">
          <AutomotiveCanvas
            customization={heroCustomization}
            enableControls={false}
            autoRotate={true}
            cameraPosition={[3.8, 1.8, 4.8]}
          />
        </div>

        {/* Ambient gradients & vignettes */}
        <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 radial-vignette pointer-events-none" />

        {/* Top spacer */}
        <div className="h-12" />

        {/* Center Hero Typography */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel border border-white/10 text-xs font-mono text-[#00F0FF]"
          >
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span>AUTOMOTIVE DIGITAL ENGINEERING PLATFORM</span>
          </motion.div>

          {/* Large Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-extrabold tracking-[-0.04em] text-white leading-[0.88] select-none uppercase"
          >
            DESIGN<br />
            THE FUTURE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00F0FF] to-white">
              OF MOBILITY.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm md:text-lg text-neutral-300 font-light max-w-2xl mx-auto"
          >
            A digital engineering platform for the next generation of automobiles. Combining 3D digital twins, real-time configurators, and enterprise database systems.
          </motion.p>

          {/* Magnetic CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4 pointer-events-auto"
          >
            <Magnetic intensity={0.35} range={90}>
              <button
                onClick={() => onNavigateToTab('projects')}
                className="bg-white text-black hover:bg-[#00F0FF] font-bold text-xs uppercase px-8 py-4 rounded-full transition-all duration-300 shadow-2xl shadow-white/20 flex items-center space-x-2"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Magnetic>

            <Magnetic intensity={0.35} range={90}>
              <button
                onClick={() => onNavigateToTab('studio')}
                className="bg-black/60 hover:bg-neutral-800 text-white border border-white/20 font-bold text-xs uppercase px-8 py-4 rounded-full backdrop-blur-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Sliders className="w-4 h-4 text-[#00F0FF]" />
                <span>Enter 3D Studio</span>
              </button>
            </Magnetic>
          </motion.div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center font-mono text-[11px] text-neutral-400 tracking-widest pointer-events-none pb-4 animate-bounce">
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. 6-STAGE 3D SCROLL EXPERIENCE (Pinned Scene)           */}
      {/* ======================================================== */}
      <section className="relative w-full">
        <ScrollScene3D />
      </section>

      {/* ======================================================== */}
      {/* 3. CINEMATIC TEXT REVEAL SECTION                         */}
      {/* ======================================================== */}
      <section className="py-32 px-6 max-w-6xl mx-auto text-center space-y-6">
        <span className="text-xs font-mono tracking-widest text-[#00F0FF] uppercase">
          AUTOMOTIVE SYSTEMS PHILOSOPHY
        </span>
        <h2 className="text-4xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-tight">
          ENGINEER<br />
          EVERY<br />
          <span className="text-[#00F0FF]">DETAIL.</span>
        </h2>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          From high-voltage silicon-carbide inverters to active aerodynamic venturi surfaces, every sub-assembly in AUTOENGINE is backed by real relational database integrity.
        </p>
      </section>

      {/* ======================================================== */}
      {/* 4. EXPLODED VEHICLE VIEW ENGINEERING MODE                */}
      {/* ======================================================== */}
      <section className="py-16 px-4 md:px-12 max-w-[1700px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
              <Layers className="w-4 h-4" />
              <span>Interactive Exploded Architecture</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
              ENGINEERING EXPLODED VIEW
            </h2>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 max-w-md font-mono">
            Drag the slider to decouple vehicle sub-assemblies. Click any component in the 3D scene to inspect verified database specifications.
          </p>
        </div>

        <ExplodedViewEngine onNavigateToComponent={onNavigateToComponent} />
      </section>

      {/* ======================================================== */}
      {/* 5. HORIZONTAL SCROLL: FROM IDEA TO AUTOMOBILE (6 Phases) */}
      {/* ======================================================== */}
      <section ref={horizontalSectionRef} className="relative h-[300vh] bg-[#050505]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center px-6 md:px-16">
          <div className="mb-10 max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-[#00F0FF] uppercase block mb-1">
              Vehicle Program Lifecycle
            </span>
            <h2 className="text-3xl md:text-6xl font-display font-extrabold text-white tracking-tight">
              FROM IDEA TO AUTOMOBILE.
            </h2>
          </div>

          {/* Horizontal Sliding Cards */}
          <motion.div style={{ x: horizontalX }} className="flex space-x-6 w-max">
            {engineeringPhases.map((phase) => (
              <div
                key={phase.num}
                className="w-80 md:w-96 glass-panel rounded-3xl p-8 border border-white/10 flex flex-col justify-between h-[360px] hover:border-[#00F0FF]/40 transition-colors"
              >
                <div>
                  <div className="text-3xl font-display font-extrabold text-[#00F0FF] mb-4">
                    {phase.num}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    {phase.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 font-mono text-[11px] text-neutral-300">
                  <span className="text-[9px] text-[#00F0FF] uppercase block mb-0.5">Key Metric</span>
                  {phase.metrics}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CALL TO ACTION & RELATIONAL ENTERPRISE FOOTER         */}
      {/* ======================================================== */}
      <section className="py-24 px-6 max-w-6xl mx-auto text-center space-y-8 border-t border-white/10">
        <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight">
          READY TO DESIGN THE FUTURE?
        </h2>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm">
          Enter the high-precision vehicle configurator, run database queries, or inspect digital twin telemetries.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Magnetic intensity={0.3} range={80}>
            <button
              onClick={() => onNavigateToTab('studio')}
              className="bg-[#00F0FF] text-black hover:bg-white font-bold text-xs uppercase px-8 py-4 rounded-full transition-all shadow-xl shadow-[#00F0FF]/30 flex items-center space-x-2"
            >
              <span>Launch 3D Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Magnetic>

          <Magnetic intensity={0.3} range={80}>
            <button
              onClick={() => onNavigateToTab('database')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase px-8 py-4 rounded-full border border-white/10 transition-all flex items-center space-x-2"
            >
              <Database className="w-4 h-4 text-[#00F0FF]" />
              <span>BCSE307L Database Hub</span>
            </button>
          </Magnetic>
        </div>
      </section>

      {/* Global Minimal Footer */}
      <footer className="border-t border-white/10 py-10 px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs font-mono text-neutral-500 gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-white font-bold tracking-widest">AUTOENGINE</span>
          <span>•</span>
          <span>BCSE307L DATABASE SYSTEMS PROJECT</span>
        </div>
        <div>
          <span>POSTGRESQL • PRISMA 3NF • THREE.JS • REACT THREE FIBER • GSAP</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

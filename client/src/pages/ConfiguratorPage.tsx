import React, { useState, useEffect, useRef } from 'react';
import Vehicle3DViewer, { VehicleCustomizationState } from '../components/3d/Vehicle3DViewer';
import ComponentTechPanel, { ComponentDetailData } from '../components/3d/ComponentTechPanel';
import { Magnetic } from '../components/core/magnetic';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart, CartItemModification } from '../context/CartContext';
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
  Lock,
  LogIn,
  Shield,
  Maximize2,
  Minimize2,
  Compass,
  Camera,
  Car,
  Wrench,
  Copy,
  Trash2,
  Flame,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConfiguratorPageProps {
  onNavigateToComponent?: (partNumber: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ConfiguratorPage: React.FC<ConfiguratorPageProps> = ({ onNavigateToComponent, onNavigateToTab }) => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen, totalCartItems, setIsCheckoutOpen } = useCart();

  // Modals & Drawers
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<'save' | 'cart'>('cart');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareTargetConfig, setCompareTargetConfig] = useState<VehicleConfiguration | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Vehicle data from backend
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VehicleVariant | null>(null);
  const [configName, setConfigName] = useState('Bespoke Custom Build');

  // 3D Customization State
  const [paintColor, setPaintColor] = useState('#00E5FF');
  const [paintFinish, setPaintFinish] = useState<'metallic' | 'gloss' | 'matte' | 'carbon'>('metallic');
  const [wheelStyle, setWheelStyle] = useState<'forged5' | 'centerlock' | 'multispoke' | 'carbonaero' | 'beadlock'>('centerlock');
  const [tyreStyle, setTyreStyle] = useState<'cup2r' | 'pzero' | 'potenza' | 'allterrain'>('cup2r');
  const [spoilerStyle, setSpoilerStyle] = useState<'gt3' | 'ducktail' | 'lip' | 'active' | 'none'>('gt3');
  const [caliperColor, setCaliperColor] = useState('#00E5FF');
  const [interiorTrim, setInteriorTrim] = useState<'nappa' | 'alcantara' | 'cognac' | 'carbonbucket'>('alcantara');
  const [exhaustStyle, setExhaustStyle] = useState<'akrapovic' | 'quadblack'>('akrapovic');

  // View & Inspection states
  const [isXRay, setIsXRay] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [explodedProgress, setExplodedProgress] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<'front' | 'rear' | 'side' | 'top' | 'cockpit' | 'isometric' | null>(null);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);

  // Component Selection & Isolation
  const [selectedComponentData, setSelectedComponentData] = useState<ComponentDetailData | null>(null);
  const [isTechPanelOpen, setIsTechPanelOpen] = useState(false);
  const [isolatedComponent, setIsolatedComponent] = useState<string | null>(null);
  const [hiddenComponents, setHiddenComponents] = useState<string[]>([]);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  // Active Parts Category Tab in Bottom Toolbar
  const [activeModCategory, setActiveModCategory] = useState<'paint' | 'wheels' | 'tyres' | 'spoiler' | 'brakes' | 'interior' | 'engine' | 'exhaust'>('paint');

  // Saved Configurations State
  const [savedConfigs, setSavedConfigs] = useState<VehicleConfiguration[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Fullscreen container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all vehicles from database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.vehicles.getModels();
        if (res.success && res.data.length > 0) {
          setModels(res.data);
          // Default to Porsche 911 or first model
          const porsche = res.data.find((m) => m.modelCode === 'POR-911-TURBOS') || res.data[0];
          setSelectedModel(porsche);
          if (porsche.variants && porsche.variants.length > 0) {
            setSelectedVariant(porsche.variants[0]);
            setConfigName(`${porsche.name} Bespoke Engineering Build`);
          }
        }

        const configsRes = await api.configurator.getAll();
        if (configsRes.success) {
          setSavedConfigs(configsRes.data);
        }
      } catch (err) {
        console.error('Failed to load configurator data:', err);
      }
    };
    fetchData();
  }, []);

  // Update default wheel and tyre for off-road vs track vehicles
  const handleSelectVehicle = (model: VehicleModel) => {
    setSelectedModel(model);
    if (model.variants && model.variants.length > 0) {
      setSelectedVariant(model.variants[0]);
    }
    setConfigName(`${model.name} Bespoke Custom Build`);
    setIsLibraryOpen(false);

    // Apply specialized presets depending on vehicle class
    if (model.modelCode.includes('THAR')) {
      setWheelStyle('beadlock');
      setTyreStyle('allterrain');
      setSpoilerStyle('none');
      setPaintColor('#D4B996'); // Earth Sand Desert Gold
    } else if (model.modelCode.includes('MUSTANG')) {
      setWheelStyle('forged5');
      setTyreStyle('pzero');
      setSpoilerStyle('lip');
      setPaintColor('#111111'); // Kingpin Obsidian Black
    } else if (model.modelCode.includes('911')) {
      setWheelStyle('centerlock');
      setTyreStyle('cup2r');
      setSpoilerStyle('gt3');
      setPaintColor('#00E5FF');
    } else if (model.modelCode.includes('SF90')) {
      setWheelStyle('carbonaero');
      setTyreStyle('cup2r');
      setSpoilerStyle('active');
      setPaintColor('#DC2626'); // Rosso Corsa
    } else if (model.modelCode.includes('PHANTOM')) {
      setWheelStyle('forged5');
      setTyreStyle('potenza');
      setSpoilerStyle('none');
      setInteriorTrim('cognac');
      setPaintColor('#0A0A0C');
    }

    // Reset isolation & camera
    setIsolatedComponent(null);
    setHiddenComponents([]);
    setSelectedComponentData(null);
    setIsTechPanelOpen(false);
    setResetCameraTrigger((prev) => prev + 1);
  };

  // Toggle Exploded View with animation
  const handleToggleExploded = () => {
    if (isExploded) {
      setExplodedProgress(0);
      setIsExploded(false);
    } else {
      setExplodedProgress(0.85);
      setIsExploded(true);
    }
  };

  // Reset entire vehicle to default
  const handleResetVehicle = () => {
    setPaintColor('#00E5FF');
    setPaintFinish('metallic');
    setWheelStyle('centerlock');
    setTyreStyle('cup2r');
    setSpoilerStyle('gt3');
    setCaliperColor('#00E5FF');
    setInteriorTrim('alcantara');
    setExhaustStyle('akrapovic');
    setIsExploded(false);
    setExplodedProgress(0);
    setIsXRay(false);
    setIsolatedComponent(null);
    setHiddenComponents([]);
    setSelectedComponentData(null);
    setIsTechPanelOpen(false);
    setResetCameraTrigger((prev) => prev + 1);
  };

  // Component Selection from 3D Scene
  const handleSelectComponent = (comp: ComponentDetailData) => {
    setSelectedComponentData(comp);
    setIsTechPanelOpen(true);
  };

  // Component Isolation Toggle
  const handleToggleIsolate = () => {
    if (!selectedComponentData) return;
    const partKey = getPartKey(selectedComponentData.category);
    if (isolatedComponent === partKey) {
      setIsolatedComponent(null);
    } else {
      setIsolatedComponent(partKey);
    }
  };

  // Component Hide Toggle
  const handleToggleHide = () => {
    if (!selectedComponentData) return;
    const partKey = getPartKey(selectedComponentData.category);
    if (hiddenComponents.includes(partKey)) {
      setHiddenComponents(hiddenComponents.filter((k) => k !== partKey));
    } else {
      setHiddenComponents([...hiddenComponents, partKey]);
    }
  };

  // Map category to 3D Part key
  const getPartKey = (cat: string) => {
    const upper = (cat || '').toUpperCase();
    if (upper.includes('WHEEL') || upper.includes('TYRE')) return 'WHEELS';
    if (upper.includes('BRAKE')) return 'BRAKES';
    if (upper.includes('HOOD') || upper.includes('BONNET')) return 'HOOD';
    if (upper.includes('SPOILER') || upper.includes('WING')) return 'SPOILER';
    if (upper.includes('ENGINE') || upper.includes('POWERTRAIN')) return 'ENGINE';
    if (upper.includes('INTERIOR') || upper.includes('COCKPIT')) return 'INTERIOR';
    if (upper.includes('EXHAUST')) return 'EXHAUST';
    if (upper.includes('SUSPENSION')) return 'SUSPENSION';
    return 'BODY';
  };

  // Live Calculated Price and Specs
  const basePrice = selectedVariant?.basePrice || 165000;
  const wheelCost =
    wheelStyle === 'centerlock'
      ? 5800
      : wheelStyle === 'carbonaero'
      ? 6400
      : wheelStyle === 'forged5'
      ? 3200
      : wheelStyle === 'multispoke'
      ? 2800
      : 2200;
  const brakeCost =
    caliperColor === '#EAB308'
      ? 9800
      : caliperColor === '#00E5FF'
      ? 8900
      : 4600;
  const spoilerCost =
    spoilerStyle === 'gt3'
      ? 5400
      : spoilerStyle === 'ducktail'
      ? 2200
      : spoilerStyle === 'active'
      ? 4200
      : spoilerStyle === 'lip'
      ? 1200
      : 0;
  const exhaustCost = exhaustStyle === 'akrapovic' ? 7900 : 3400;
  const interiorCost =
    interiorTrim === 'cognac'
      ? 6800
      : interiorTrim === 'carbonbucket'
      ? 7400
      : interiorTrim === 'nappa'
      ? 5200
      : 4800;
  const paintCost = paintFinish === 'carbon' ? 3500 : 0;
  const totalPrice = basePrice + wheelCost + brakeCost + spoilerCost + exhaustCost + interiorCost + paintCost;

  // Customization state object passed to 3D viewer
  const customizationState: VehicleCustomizationState = {
    paintColor,
    paintFinish,
    wheelStyle,
    tyreStyle,
    spoilerStyle,
    caliperColor,
    interiorTrim,
    exhaustStyle,
    isXRay,
    explodedProgress,
    isolatedComponent,
    hiddenComponents,
  };

  // Compile all active modified items selected by client
  const getActiveModifications = (): CartItemModification[] => {
    const paintMap: Record<string, string> = {
      '#111111': 'Obsidian Stealth Black',
      '#00E5FF': 'Quantum Cyan',
      '#8E8E93': 'Liquid Cyber Silver',
      '#E50914': 'Guards Red',
      '#15803D': 'Isle of Man Green',
      '#6B7280': 'Nardo Grey',
      '#EAB308': 'Acid Gold',
      '#F5F5F7': 'Alpine Arctic White',
      '#D4B996': 'Earth Sand Desert Gold',
      '#DC2626': 'Rosso Corsa',
      '#0A0A0C': 'Black Diamond',
    };

    const wheelMap: Record<string, { name: string; cost: number; spec: string }> = {
      centerlock: { name: 'Centerlock Monoblock GT Wheels', cost: 5800, spec: 'Forged aluminum racing hub center-locking system' },
      forged5: { name: 'Forged 5-Spoke Lightweight Wheels', cost: 3200, spec: 'Aerospace grade forged aluminum 20" front / 21" rear' },
      carbonaero: { name: 'Carbon Aero Disc Wheels', cost: 6400, spec: 'High-downforce carbon fiber aerodynamic blade structure' },
      multispoke: { name: 'Multi-Spoke Competition Alloy', cost: 2800, spec: 'TUV-certified track competition forged alloy' },
      beadlock: { name: '17" Rugged Beadlock Off-Road Wheels', cost: 2200, spec: 'Heavy-duty beadlock mechanical clamping rim' },
    };

    const tyreMap: Record<string, { name: string; cost: number; spec: string }> = {
      cup2r: { name: 'Michelin Pilot Sport Cup 2 R Semi-Slick', cost: 2400, spec: 'Competition compound with N-Spec sidewall rating' },
      pzero: { name: 'Pirelli P-Zero Corsa Track Compound', cost: 2100, spec: 'Dual-tread track tire optimized for lateral g-force' },
      potenza: { name: 'Bridgestone Potenza Sport Grand Touring', cost: 0, spec: 'OEM high-speed touring compound' },
      allterrain: { name: 'Goodyear Wrangler All-Terrain Tyres', cost: 1400, spec: 'Reinforced Kevlar casing for rock & desert terrain' },
    };

    const spoilerMap: Record<string, { name: string; cost: number; spec: string }> = {
      gt3: { name: 'GT3 Swan-Neck Carbon Wing', cost: 5400, spec: 'Dual-element carbon aerodynamic wing producing 480kg downforce' },
      ducktail: { name: 'Heritage Carbon Ducktail', cost: 2200, spec: 'Classic upswept rear deck spoiler in autoclave carbon' },
      active: { name: 'Active Speed-Deployable DRS Wing', cost: 4200, spec: 'Hydraulic multi-stage variable angle DRS wing' },
      lip: { name: 'Low-Drag OEM Lip Spoiler', cost: 1200, spec: 'Subtle high-speed stabilizing aerodynamic lip' },
      none: { name: 'Clean Decklid (No Wing)', cost: 0, spec: 'Standard streamlined aerodynamic bodywork' },
    };

    const caliperMap: Record<string, { name: string; cost: number }> = {
      '#00E5FF': { name: 'Brembo Electric Cyan 6-Piston Calipers', cost: 8900 },
      '#EAB308': { name: 'Speed Yellow Carbon-Ceramic Calipers', cost: 9800 },
      '#EF4444': { name: 'Formula Racing Red 6-Piston Calipers', cost: 4600 },
      '#1F2937': { name: 'Stealth Anodized Black Calipers', cost: 4600 },
      '#22C55E': { name: 'Acid Green Motorsport Calipers', cost: 4600 },
    };

    const interiorMap: Record<string, { name: string; cost: number; spec: string }> = {
      alcantara: { name: 'Full Race Alcantara with Matte Carbon', cost: 4800, spec: 'Motorsport Alcantara with contrasting carbon fibre inlays' },
      cognac: { name: 'Hand-Stitched Cognac Tan Luxury Leather', cost: 6800, spec: 'Full-grain Bavarian Nappa leather with diamond quilting' },
      nappa: { name: 'Obsidian Nappa Leather with Cyan Stitching', cost: 5200, spec: 'Semi-aniline leather with precision contrast stitching' },
      carbonbucket: { name: 'Carbon Monocoque Racing Shells', cost: 7400, spec: 'CFRP fixed-back racing bucket seats with 6-point harness prep' },
    };

    const exhaustMap: Record<string, { name: string; cost: number; spec: string }> = {
      akrapovic: { name: 'Akrapovič Ultralight Titanium Valved Exhaust', cost: 7900, spec: 'Full titanium link pipes and valved rear muffler (-14.2 kg)' },
      quadblack: { name: 'Black Chrome Quad-Exit Venturi Exhaust', cost: 3400, spec: 'Stainless steel sport exhaust with acoustic flow chambers' },
    };

    const selectedPaintName = paintMap[paintColor] || paintColor;
    const selectedWheel = wheelMap[wheelStyle] || { name: wheelStyle, cost: wheelCost, spec: 'Custom Wheels' };
    const selectedTyre = tyreMap[tyreStyle] || { name: tyreStyle, cost: 0, spec: 'Performance Tyres' };
    const selectedSpoiler = spoilerMap[spoilerStyle] || { name: spoilerStyle, cost: spoilerCost, spec: 'Aerodynamic Element' };
    const selectedCaliper = caliperMap[caliperColor] || { name: 'Brembo Performance Calipers', cost: brakeCost };
    const selectedInterior = interiorMap[interiorTrim] || { name: interiorTrim, cost: interiorCost, spec: 'Bespoke Upholstery' };
    const selectedExhaust = exhaustMap[exhaustStyle] || { name: exhaustStyle, cost: exhaustCost, spec: 'Sport Exhaust' };

    return [
      {
        category: 'Paint & Surface Finish',
        name: `${selectedPaintName} (${paintFinish.toUpperCase()} Finish)`,
        cost: paintFinish === 'carbon' ? 3500 : 0,
        colorPreview: paintColor,
        spec: `${paintFinish.toUpperCase()} automotive protective top-coat`,
      },
      {
        category: 'Wheels & Rims',
        name: selectedWheel.name,
        cost: selectedWheel.cost,
        spec: selectedWheel.spec,
      },
      {
        category: 'Tyre Compounds',
        name: selectedTyre.name,
        cost: selectedTyre.cost,
        spec: selectedTyre.spec,
      },
      {
        category: 'Aerodynamics',
        name: selectedSpoiler.name,
        cost: selectedSpoiler.cost,
        spec: selectedSpoiler.spec,
      },
      {
        category: 'Braking System',
        name: selectedCaliper.name,
        cost: selectedCaliper.cost,
        colorPreview: caliperColor,
        spec: 'Carbon-Ceramic Rotors (410mm front / 390mm rear)',
      },
      {
        category: 'Cabin & Interior',
        name: selectedInterior.name,
        cost: selectedInterior.cost,
        spec: selectedInterior.spec,
      },
      {
        category: 'Exhaust System',
        name: selectedExhaust.name,
        cost: selectedExhaust.cost,
        spec: selectedExhaust.spec,
      },
    ];
  };

  // Add the fully modified vehicle build to cart
  const handleAddToCart = (openDrawer: boolean = true) => {
    if (!user) {
      setAuthModalReason('cart');
      setShowAuthModal(true);
      return;
    }

    const modifications = getActiveModifications();
    const configCode = `AUTOENG-${(selectedModel?.manufacturer || 'AE').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    addToCart({
      type: 'custom_vehicle',
      vehicleModelName: selectedModel?.name || '911 Turbo S',
      vehicleModelCode: selectedModel?.modelCode || 'POR-911-TURBOS',
      variantName: selectedVariant?.name || 'Factory Track Specification',
      variantId: selectedVariant?.id,
      configCode,
      basePrice,
      totalPrice,
      quantity: 1,
      modifications,
      paintColor,
      paintFinish,
      wheelStyle,
      tyreStyle,
      spoilerStyle,
      caliperColor,
      interiorTrim,
      exhaustStyle,
    });

    setSaveSuccessMessage(`Added "${selectedModel?.name || 'Custom Build'}" with all modified items to your cart!`);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00E5FF', '#38BDF8', '#FFFFFF'],
    });

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3500);

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  // Immediate "Buy Now" - adds to cart and opens checkout directly
  const handleBuyNow = () => {
    if (!user) {
      setAuthModalReason('cart');
      setShowAuthModal(true);
      return;
    }
    handleAddToCart(false);
    setIsCheckoutOpen(true);
  };

  // Save Configuration to Database
  const handleSaveConfiguration = async () => {
    if (!user) {
      setAuthModalReason('save');
      setShowAuthModal(true);
      return;
    }

    if (!selectedVariant) return;

    setIsSaving(true);
    try {
      const res = await api.configurator.save({
        variantId: selectedVariant.id,
        name: configName.trim() || `${selectedModel?.name} Custom Build`,
        paintColor,
        components: [
          `CMP-WHL-${wheelStyle.toUpperCase()}`,
          `CMP-TYR-${tyreStyle.toUpperCase()}`,
          `CMP-SPOILER-${spoilerStyle.toUpperCase()}`,
          `CMP-BRK-${caliperColor.replace('#', '').toUpperCase()}`,
          `CMP-INT-${interiorTrim.toUpperCase()}`,
          `CMP-EXH-${exhaustStyle.toUpperCase()}`,
        ],
      });

      if (res.success) {
        setSaveSuccessMessage('Configuration saved permanently to PostgreSQL / SQLite database!');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00E5FF', '#38BDF8', '#FFFFFF'],
        });

        // Refresh configs list
        const configsRes = await api.configurator.getAll();
        if (configsRes.success) {
          setSavedConfigs(configsRes.data);
        }

        setTimeout(() => setSaveSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Failed to save configuration:', err);
      alert('Error saving configuration: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Duplicate a saved configuration
  const handleDuplicateConfig = async (configId: string) => {
    try {
      const res = await api.configurator.duplicate(configId);
      if (res.success) {
        const configsRes = await api.configurator.getAll();
        if (configsRes.success) setSavedConfigs(configsRes.data);
      }
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  // Delete a saved configuration
  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this saved build from the database?')) return;
    try {
      const res = await api.configurator.delete(configId);
      if (res.success) {
        setSavedConfigs(savedConfigs.filter((c) => c.id !== configId));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Load a saved configuration into 3D viewer
  const handleLoadSavedConfig = (cfg: VehicleConfiguration) => {
    if (cfg.variant?.model) {
      const targetModel = models.find((m) => m.id === cfg.variant?.modelId);
      if (targetModel) {
        setSelectedModel(targetModel);
        setSelectedVariant(cfg.variant);
      }
    }
    setConfigName(cfg.name);
    setIsSavedDrawerOpen(false);
    setResetCameraTrigger((prev) => prev + 1);
  };

  // Fullscreen handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#08090B] text-white pt-20 pb-16 overflow-hidden flex flex-col justify-between select-none"
    >
      {/* ======================================================== */}
      {/* 1. TOP HEADER: ACTIVE VEHICLE & EXECUTIVE METRICS        */}
      {/* ======================================================== */}
      <header className="px-6 py-3 border-b border-white/10 bg-[#111318]/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/10 hover:border-[#00E5FF]/40 text-xs font-mono font-bold transition-all text-neutral-200 hover:text-white"
          >
            <Car className="w-4 h-4 text-[#00E5FF]" />
            <span>Vehicle Library ({models.length})</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold tracking-widest">
                {selectedModel?.manufacturer || 'AUTOENGINE'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">
                {selectedModel?.category || 'Supercar'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-wide">
              {selectedModel?.name || '911 Turbo S'}
            </h1>
          </div>
        </div>

        {/* Live Metrics: Price & Performance */}
        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="hidden sm:block text-right">
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest block">ACCELERATION</span>
            <span className="text-white font-bold text-sm">
              {selectedVariant?.specifications?.acceleration0100 || 2.6}s{' '}
              <span className="text-[10px] text-neutral-500 font-normal">0-100</span>
            </span>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest block">TOP SPEED</span>
            <span className="text-white font-bold text-sm">
              {selectedVariant?.specifications?.topSpeedKmh || 330}{' '}
              <span className="text-[10px] text-neutral-500 font-normal">km/h</span>
            </span>
          </div>

          <div className="text-right pl-4 border-l border-white/10">
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest block">TOTAL BUILD COST</span>
            <span className="text-[#00E5FF] font-extrabold text-base md:text-lg">
              ${totalPrice.toLocaleString()}
            </span>
          </div>

          {/* Add to Cart Magnetic Button */}
          <Magnetic intensity={0.25} range={80}>
            <button
              onClick={() => handleAddToCart(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase px-4 py-2.5 rounded-2xl transition-all flex items-center space-x-1.5 shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Add to Cart</span>
            </button>
          </Magnetic>

          {/* Buy Now / Place Order Magnetic Button */}
          <Magnetic intensity={0.25} range={80}>
            <button
              onClick={handleBuyNow}
              className="bg-[#00E5FF] text-black hover:bg-white font-bold text-xs uppercase px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-[#00E5FF]/25 flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          </Magnetic>

          {/* Save Configuration Magnetic Button */}
          <Magnetic intensity={0.25} range={80}>
            <button
              onClick={handleSaveConfiguration}
              disabled={isSaving}
              className="bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 font-bold text-xs uppercase px-3.5 py-2.5 rounded-2xl transition-all flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Build'}</span>
            </button>
          </Magnetic>

          {/* Cart Drawer Button with live counter badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/10 hover:border-[#00E5FF]/40 text-neutral-300 hover:text-white transition-colors relative"
            title="Open Engineering Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#00E5FF]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00E5FF] text-black font-bold text-[9px] flex items-center justify-center animate-pulse">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Saved Drawer Button */}
          <button
            onClick={() => setIsSavedDrawerOpen(!isSavedDrawerOpen)}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors relative"
            title="Saved Builds Drawer"
          >
            <Layers className="w-4 h-4 text-[#00E5FF]" />
            {savedConfigs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00E5FF] text-black font-bold text-[9px] flex items-center justify-center">
                {savedConfigs.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-6 py-2.5 rounded-2xl text-xs font-mono backdrop-blur-xl shadow-xl flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN INTERACTIVE 3D STAGE & FLOATING CONTROLS         */}
      {/* ======================================================== */}
      <div className="relative flex-1 w-full h-[60vh] md:h-[65vh]">
        {/* The 3D Scene */}
        <Vehicle3DViewer
          modelCode={selectedModel?.modelCode || 'POR-911-TURBOS'}
          customization={customizationState}
          onSelectComponent={handleSelectComponent}
          selectedComponent={selectedComponentData ? getPartKey(selectedComponentData.category) : null}
          hoveredComponent={hoveredComponent}
          setHoveredComponent={setHoveredComponent}
          cameraPreset={cameraPreset}
          resetCameraTrigger={resetCameraTrigger}
          autoRotate={autoRotate}
        />

        {/* Floating Top Left: Camera Angle Presets */}
        <div className="absolute top-4 left-6 z-30 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#111318]/70 border border-white/10 backdrop-blur-xl font-mono text-[11px]">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 px-2 flex items-center gap-1">
            <Camera className="w-3 h-3 text-[#00E5FF]" />
            <span>Camera</span>
          </span>
          {[
            { id: 'front', label: 'Front' },
            { id: 'rear', label: 'Rear' },
            { id: 'side', label: 'Side' },
            { id: 'top', label: 'Top' },
            { id: 'cockpit', label: 'Cockpit' },
            { id: 'isometric', label: 'Isometric' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCameraPreset(preset.id as any)}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                cameraPreset === preset.id
                  ? 'bg-[#00E5FF] text-black font-bold shadow-md shadow-[#00E5FF]/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Floating Top Right: Exploded View & Visual Tools */}
        <div className="absolute top-4 right-6 z-30 flex items-center space-x-2">
          {/* Exploded View Button */}
          <Magnetic intensity={0.3} range={70}>
            <button
              onClick={handleToggleExploded}
              className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all flex items-center space-x-2 border shadow-xl ${
                isExploded
                  ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[#00E5FF]/30'
                  : 'bg-[#111318]/80 text-white border-white/15 hover:border-[#00E5FF]/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExploded ? 'Assemble Vehicle' : 'EXPLODED VIEW'}</span>
            </button>
          </Magnetic>

          {/* X-Ray Mode */}
          <button
            onClick={() => setIsXRay(!isXRay)}
            className={`p-2.5 rounded-2xl border font-mono text-xs transition-colors ${
              isXRay
                ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                : 'bg-[#111318]/80 text-neutral-300 border-white/15 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle X-Ray Chassis View"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => {
              setCameraPreset(null);
              setResetCameraTrigger((prev) => prev + 1);
            }}
            className="p-2.5 rounded-2xl bg-[#111318]/80 border border-white/15 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Camera Angle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2.5 rounded-2xl bg-[#111318]/80 border border-white/15 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen 3D View"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Floating Exploded Separation Slider when exploded view is active */}
        {isExploded && (
          <div className="absolute top-16 right-6 z-30 p-4 rounded-3xl bg-[#111318]/90 border border-white/15 shadow-2xl backdrop-blur-xl w-72 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neutral-400">Separation Distance:</span>
              <span className="text-[#00E5FF] font-bold">{Math.round(explodedProgress * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodedProgress}
              onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
              className="w-full accent-[#00E5FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>Assembled</span>
              <span>Maximum Decouple</span>
            </div>
          </div>
        )}

        {/* Hint Pill on Scene Bottom */}
        <div className="absolute bottom-4 left-6 z-20 pointer-events-none text-[11px] font-mono text-neutral-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md hidden sm:flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Click any 3D component to inspect & modify. Drag to rotate 360°.</span>
        </div>

        {/* Right-Side Technical Component Information Panel */}
        <ComponentTechPanel
          component={selectedComponentData}
          isOpen={isTechPanelOpen}
          onClose={() => setIsTechPanelOpen(false)}
          isIsolated={isolatedComponent !== null}
          onToggleIsolate={handleToggleIsolate}
          isHidden={
            selectedComponentData ? hiddenComponents.includes(getPartKey(selectedComponentData.category)) : false
          }
          onToggleHide={handleToggleHide}
          onResetVehicle={handleResetVehicle}
          onSelectAlternative={(alt) => {
            // Live swap component based on part number
            if (alt.partNumber.includes('WHL')) {
              if (alt.partNumber.includes('CENTERLOCK')) setWheelStyle('centerlock');
              else if (alt.partNumber.includes('FORGED')) setWheelStyle('forged5');
              else if (alt.partNumber.includes('CARBON')) setWheelStyle('carbonaero');
              else if (alt.partNumber.includes('MULTI')) setWheelStyle('multispoke');
            } else if (alt.partNumber.includes('SPOILER')) {
              if (alt.partNumber.includes('GT3')) setSpoilerStyle('gt3');
              else if (alt.partNumber.includes('DUCKTAIL')) setSpoilerStyle('ducktail');
              else if (alt.partNumber.includes('LIP')) setSpoilerStyle('lip');
            } else if (alt.partNumber.includes('BRK')) {
              if (alt.partNumber.includes('YELLOW')) setCaliperColor('#EAB308');
              else if (alt.partNumber.includes('RED')) setCaliperColor('#EF4444');
              else if (alt.partNumber.includes('BREMBO')) setCaliperColor('#00E5FF');
            }
          }}
          onAddToCart={(comp) => {
            if (!user) {
              setAuthModalReason('cart');
              setShowAuthModal(true);
              return;
            }
            const costVal =
              typeof comp.cost === 'number'
                ? comp.cost
                : typeof comp.cost === 'string'
                ? parseFloat(comp.cost.replace(/[^0-9.]/g, '')) || 4800
                : 4800;
            addToCart({
              type: 'component',
              vehicleModelName: comp.name,
              basePrice: costVal,
              totalPrice: costVal,
              quantity: 1,
              modifications: [
                {
                  category: comp.category,
                  name: comp.name,
                  spec: `Part #${comp.partNumber} • ${comp.material || 'OEM Engineering Specification'}`,
                  cost: costVal,
                },
              ],
            });
            setIsCartOpen(true);
            setIsTechPanelOpen(false);
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM PARTS MODIFICATION TOOLBAR                     */}
      {/* ======================================================== */}
      <div className="px-6 py-4 bg-[#111318]/90 border-t border-white/10 backdrop-blur-2xl z-20 space-y-3">
        {/* Category Navigation Bar */}
        <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2 font-mono text-xs scrollbar-none">
          <div className="flex items-center space-x-2">
            {[
              { id: 'paint', label: 'Paint & Finish', icon: Sparkles },
              { id: 'wheels', label: 'Wheels & Rims', icon: CircleIcon },
              { id: 'tyres', label: 'Tyre Compounds', icon: Activity },
              { id: 'spoiler', label: 'Aerodynamic Wing', icon: Layers },
              { id: 'brakes', label: 'Brakes & Calipers', icon: Shield },
              { id: 'interior', label: 'Interior Trim', icon: Cpu },
              { id: 'engine', label: 'Powertrain', icon: Flame },
              { id: 'exhaust', label: 'Sport Exhaust', icon: WindIcon },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeModCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveModCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                    isActive
                      ? 'bg-[#00E5FF] text-black font-bold shadow-lg shadow-[#00E5FF]/20'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Magnetic intensity={0.25} range={60}>
              <button
                onClick={() => handleAddToCart(true)}
                className="px-3.5 py-2 rounded-2xl text-[11px] font-mono font-bold bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 transition-all flex items-center space-x-1.5 shadow-md shadow-[#00E5FF]/10"
                title="Add current modified build to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add Build to Cart</span>
              </button>
            </Magnetic>

            <Magnetic intensity={0.25} range={60}>
              <button
                onClick={handleBuyNow}
                className="px-4 py-2 rounded-2xl text-[11px] font-mono font-bold bg-[#00E5FF] hover:bg-white text-black transition-all flex items-center space-x-1.5 shadow-lg shadow-[#00E5FF]/20"
                title="Proceed immediately to checkout & order placement"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Buy & Order</span>
              </button>
            </Magnetic>

            <Magnetic intensity={0.25} range={60}>
              <button
                onClick={handleResetVehicle}
                className="px-3 py-2 rounded-2xl text-[11px] font-mono text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors flex items-center space-x-1.5"
                title="Reset vehicle configuration to factory standard"
              >
                <RotateCcw className="w-3 h-3 text-neutral-500" />
                <span>Reset</span>
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Category Options Sub-Row */}
        <div className="pt-2 border-t border-white/5">
          {/* TAB 1: PAINT & FINISH */}
          {activeModCategory === 'paint' && (
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">COLOUR:</span>
                {[
                  { name: 'Obsidian Stealth Black', hex: '#111111' },
                  { name: 'Quantum Cyan', hex: '#00E5FF' },
                  { name: 'Liquid Cyber Silver', hex: '#8E8E93' },
                  { name: 'Guards Red', hex: '#E50914' },
                  { name: 'Isle of Man Green', hex: '#15803D' },
                  { name: 'Nardo Grey', hex: '#6B7280' },
                  { name: 'Acid Gold', hex: '#EAB308' },
                  { name: 'Alpine Arctic White', hex: '#F5F5F7' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setPaintColor(color.hex)}
                    className={`w-7 h-7 rounded-full transition-transform border-2 relative ${
                      paintColor === color.hex ? 'scale-125 border-[#00E5FF] shadow-lg shadow-[#00E5FF]/40' : 'border-white/20 hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">FINISH:</span>
                {(['metallic', 'gloss', 'matte', 'carbon'] as const).map((finish) => (
                  <button
                    key={finish}
                    onClick={() => setPaintFinish(finish)}
                    className={`px-3 py-1 rounded-xl uppercase text-[10px] font-bold transition-all ${
                      paintFinish === finish ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: WHEELS */}
          {activeModCategory === 'wheels' && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              {[
                { id: 'centerlock', name: 'Centerlock Monoblock GT Wheels', cost: '+$5,800' },
                { id: 'forged5', name: 'Forged 5-Spoke Lightweight Wheels', cost: '+$3,200' },
                { id: 'carbonaero', name: 'Carbon Aero Disc Wheels', cost: '+$6,400' },
                { id: 'multispoke', name: 'Multi-Spoke Competition Alloy', cost: '+$2,800' },
                { id: 'beadlock', name: '17" Rugged Beadlock Off-Road', cost: '+$2,200' },
              ].map((wheel) => (
                <button
                  key={wheel.id}
                  onClick={() => setWheelStyle(wheel.id as any)}
                  className={`px-4 py-2 rounded-2xl transition-all border ${
                    wheelStyle === wheel.id
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white font-bold shadow-md shadow-[#00E5FF]/10'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{wheel.name}</span>
                  <span className="text-[10px] text-emerald-400 ml-2 font-bold">{wheel.cost}</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: TYRES */}
          {activeModCategory === 'tyres' && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              {[
                { id: 'cup2r', name: 'Michelin Pilot Sport Cup 2 R Semi-Slick', cost: '+$2,400' },
                { id: 'pzero', name: 'Pirelli P-Zero Corsa Track Compound', cost: '+$2,100' },
                { id: 'potenza', name: 'Bridgestone Potenza Sport Grand Touring', cost: 'OEM' },
                { id: 'allterrain', name: 'Goodyear Wrangler All-Terrain Tyres', cost: '+$1,400' },
              ].map((tyre) => (
                <button
                  key={tyre.id}
                  onClick={() => setTyreStyle(tyre.id as any)}
                  className={`px-4 py-2 rounded-2xl transition-all border ${
                    tyreStyle === tyre.id
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white font-bold shadow-md shadow-[#00E5FF]/10'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tyre.name}</span>
                  <span className="text-[10px] text-emerald-400 ml-2 font-bold">{tyre.cost}</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 4: SPOILERS */}
          {activeModCategory === 'spoiler' && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              {[
                { id: 'gt3', name: 'GT3 Swan-Neck Carbon Wing', cost: '+$5,400' },
                { id: 'ducktail', name: 'Heritage Carbon Ducktail', cost: '+$2,200' },
                { id: 'active', name: 'Active Speed-Deployable DRS Wing', cost: '+$4,200' },
                { id: 'lip', name: 'Low-Drag OEM Lip Spoiler', cost: '+$1,200' },
                { id: 'none', name: 'Clean Decklid (No Wing)', cost: 'OEM' },
              ].map((spoiler) => (
                <button
                  key={spoiler.id}
                  onClick={() => setSpoilerStyle(spoiler.id as any)}
                  className={`px-4 py-2 rounded-2xl transition-all border ${
                    spoilerStyle === spoiler.id
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white font-bold shadow-md shadow-[#00E5FF]/10'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{spoiler.name}</span>
                  <span className="text-[10px] text-emerald-400 ml-2 font-bold">{spoiler.cost}</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 5: BRAKES & CALIPERS */}
          {activeModCategory === 'brakes' && (
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">CALIPER FINISH:</span>
                {[
                  { name: 'Brembo Electric Cyan', hex: '#00E5FF' },
                  { name: 'Speed Yellow Carbon-Ceramic', hex: '#EAB308' },
                  { name: 'Formula Racing Red', hex: '#EF4444' },
                  { name: 'Stealth Anodized Black', hex: '#1F2937' },
                  { name: 'Acid Green Motorsport', hex: '#22C55E' },
                ].map((caliper) => (
                  <button
                    key={caliper.hex}
                    onClick={() => setCaliperColor(caliper.hex)}
                    className={`w-7 h-7 rounded-full transition-transform border-2 ${
                      caliperColor === caliper.hex ? 'scale-125 border-white shadow-lg' : 'border-white/20 hover:scale-110'
                    }`}
                    style={{ backgroundColor: caliper.hex }}
                    title={caliper.name}
                  />
                ))}
              </div>

              <div className="text-[11px] text-neutral-400">
                Front 410mm & Rear 390mm Carbon-Ceramic Rotors Included
              </div>
            </div>
          )}

          {/* TAB 6: INTERIOR */}
          {activeModCategory === 'interior' && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              {[
                { id: 'alcantara', name: 'Full Race Alcantara with Matte Carbon', cost: '+$4,800' },
                { id: 'cognac', name: 'Hand-Stitched Cognac Tan Luxury Leather', cost: '+$6,800' },
                { id: 'nappa', name: 'Obsidian Nappa Leather with Cyan Stitching', cost: '+$5,200' },
                { id: 'carbonbucket', name: 'Carbon Monocoque Racing Shells', cost: '+$7,400' },
              ].map((trim) => (
                <button
                  key={trim.id}
                  onClick={() => setInteriorTrim(trim.id as any)}
                  className={`px-4 py-2 rounded-2xl transition-all border ${
                    interiorTrim === trim.id
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white font-bold shadow-md shadow-[#00E5FF]/10'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{trim.name}</span>
                  <span className="text-[10px] text-emerald-400 ml-2 font-bold">{trim.cost}</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 7: ENGINE */}
          {activeModCategory === 'engine' && (
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-white font-bold block">
                  {selectedModel?.manufacturer} Precision Engine Assembly
                </span>
                <span className="text-[10px] text-neutral-400">
                  {selectedVariant?.drivetrain} • Peak Output {selectedVariant?.specifications?.peakPowerKw || 478} kW
                </span>
              </div>
              <button
                onClick={() => {
                  setCameraPreset('isometric');
                  setIsExploded(true);
                  setExplodedProgress(0.8);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-bold transition-colors"
              >
                Inspect Powertrain Sub-Assembly
              </button>
            </div>
          )}

          {/* TAB 8: EXHAUST */}
          {activeModCategory === 'exhaust' && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              {[
                { id: 'akrapovic', name: 'Akrapovič Ultralight Titanium Valved Exhaust', cost: '+$7,900' },
                { id: 'quadblack', name: 'Black Chrome Quad-Exit Venturi Exhaust', cost: '+$3,400' },
              ].map((exh) => (
                <button
                  key={exh.id}
                  onClick={() => setExhaustStyle(exh.id as any)}
                  className={`px-4 py-2 rounded-2xl transition-all border ${
                    exhaustStyle === exh.id
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white font-bold shadow-md shadow-[#00E5FF]/10'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{exh.name}</span>
                  <span className="text-[10px] text-emerald-400 ml-2 font-bold">{exh.cost}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: VEHICLE LIBRARY (All 9 Manufacturers)           */}
      {/* ======================================================== */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-5xl bg-[#08090B] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[85vh] flex flex-col font-sans">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest block mb-1">
                  OFFICIAL VEHICLE SHOWCASE
                </span>
                <h2 className="text-2xl font-display font-extrabold text-white uppercase tracking-tight">
                  Choose a Vehicle to Customize
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Select any high-performance automobile to load its actual 3D model, parts, and specs.
                </p>
              </div>

              <button
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehicle Grid (Porsche, Mercedes, BMW, Audi, Thar, Mustang, Rolls-Royce, Ferrari, Lambo) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {models.map((model) => {
                const isSelected = selectedModel?.id === model.id;
                const variant = model.variants?.[0];
                const specs = variant?.specifications;

                return (
                  <div
                    key={model.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-[#111318] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10'
                        : 'bg-[#111318]/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                        <span className="text-[#00E5FF] font-bold uppercase tracking-wider">
                          {model.manufacturer}
                        </span>
                        <span className="text-neutral-400 px-2 py-0.5 rounded-full bg-white/5">
                          {model.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-display font-extrabold text-white tracking-wide">
                        {model.name}
                      </h3>

                      <p className="text-[11px] text-neutral-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-[10px] font-mono text-center">
                      <div>
                        <span className="text-neutral-500 uppercase block text-[8px]">0-100</span>
                        <span className="text-white font-bold">{specs?.acceleration0100 || 3.1}s</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 uppercase block text-[8px]">TOP SPEED</span>
                        <span className="text-white font-bold">{specs?.topSpeedKmh || 320} km/h</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 uppercase block text-[8px]">POWER</span>
                        <span className="text-white font-bold">{specs?.peakPowerKw || 450} kW</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-bold text-white">
                        ${variant?.basePrice?.toLocaleString() || '165,000'}
                      </span>

                      <button
                        onClick={() => handleSelectVehicle(model)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/20'
                            : 'bg-white/10 hover:bg-[#00E5FF] hover:text-black text-white'
                        }`}
                      >
                        <span>{isSelected ? 'Active 3D' : 'View in 3D'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DRAWER: SAVED CONFIGURATIONS                           */}
      {/* ======================================================== */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#08090B] border-l border-white/15 p-6 shadow-2xl flex flex-col justify-between font-sans">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                    Saved Configurations ({savedConfigs.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsSavedDrawerOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {savedConfigs.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-neutral-400 text-xs font-mono">
                  <p>No configurations saved in database yet.</p>
                  <p className="text-[10px] text-neutral-500">
                    Customize your car and click "Save Build" to store it permanently.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1">
                  {savedConfigs.map((cfg) => (
                    <div
                      key={cfg.id}
                      className="p-4 rounded-2xl bg-[#111318] border border-white/10 space-y-3 hover:border-[#00E5FF]/30 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{cfg.name}</h4>
                          <span className="text-[10px] font-mono text-[#00E5FF]">
                            {cfg.variant?.model?.manufacturer} {cfg.variant?.model?.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ${cfg.totalPrice?.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-[10px]">
                        <button
                          onClick={() => handleLoadSavedConfig(cfg)}
                          className="px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black font-bold transition-colors"
                        >
                          Load in 3D
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDuplicateConfig(cfg.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(cfg.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSavedDrawerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white font-mono text-xs transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: GUEST PROMPT TO SIGN IN / REGISTER             */}
      {/* ======================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#08090B] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 text-center font-sans">
            <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center mx-auto text-[#00E5FF]">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-extrabold text-white">
                {authModalReason === 'cart'
                  ? 'Sign In Required to Add to Cart'
                  : 'Sign In to Save Configuration'}
              </h3>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                {authModalReason === 'cart'
                  ? 'Guests can explore vehicles and customize parts freely. To add custom modified vehicles to your cart, place orders, and access real-time delivery tracking, please sign in or register.'
                  : 'Guests can explore vehicles and customize parts freely. To permanently save configurations and reopen them later, please sign in or create an account.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111318] border border-white/10 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-300">
                <span>Vehicle:</span>
                <span className="text-white font-bold">{selectedModel?.name}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Total Build Cost:</span>
                <span className="text-[#00E5FF] font-bold">${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigateToTab?.('login')}
                className="w-full py-3 rounded-2xl bg-[#00E5FF] text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-lg shadow-[#00E5FF]/20 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In or Register</span>
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 rounded-2xl text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Continue Exploring as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Icon Helpers
const CircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const WindIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

export default ConfiguratorPage;

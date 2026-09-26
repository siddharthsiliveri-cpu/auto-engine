import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface VehicleCustomization {
  paintColor: string;
  caliperColor: string;
  wheelStyle: 'aero' | 'forged' | 'turbine';
  powertrain: 'dual' | 'tri';
  interiorTrim: 'carbon' | 'titanium' | 'white';
  isXRay: boolean;
  explodedProgress: number; // 0 (assembled) to 1 (fully exploded)
}

interface VehicleModel3DProps {
  customization: VehicleCustomization;
  onSelectComponent?: (componentName: string, meta: any) => void;
  hoveredComponent?: string | null;
  setHoveredComponent?: (name: string | null) => void;
  autoRotate?: boolean;
}

export const VehicleModel3D: React.FC<VehicleModel3DProps> = ({
  customization,
  onSelectComponent,
  hoveredComponent,
  setHoveredComponent,
  autoRotate = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);

  // Lerped exploded progress for silky smooth 60fps transitions
  const currentExploded = useRef(0);

  // Materials definition
  const materials = useMemo(() => {
    const isTranslucent = customization.isXRay;
    const bodyColor = new THREE.Color(customization.paintColor);

    return {
      body: new THREE.MeshPhysicalMaterial({
        color: bodyColor,
        metalness: isTranslucent ? 0.2 : 0.85,
        roughness: isTranslucent ? 0.3 : 0.18,
        clearcoat: isTranslucent ? 0.3 : 1.0,
        clearcoatRoughness: 0.1,
        transparent: isTranslucent,
        opacity: isTranslucent ? 0.22 : 1.0,
        wireframe: false,
      }),
      carbon: new THREE.MeshStandardMaterial({
        color: '#151515',
        metalness: 0.3,
        roughness: 0.5,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#0A0A0A',
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        transparent: true,
        opacity: customization.isXRay ? 0.15 : 0.7,
      }),
      batteryEnclosure: new THREE.MeshStandardMaterial({
        color: '#1F2937',
        metalness: 0.8,
        roughness: 0.3,
      }),
      batteryCells: new THREE.MeshBasicMaterial({
        color: '#00F0FF',
        wireframe: false,
      }),
      motorHousing: new THREE.MeshStandardMaterial({
        color: '#374151',
        metalness: 0.9,
        roughness: 0.25,
      }),
      motorCoils: new THREE.MeshStandardMaterial({
        color: '#F59E0B', // Copper
        metalness: 0.7,
        roughness: 0.3,
      }),
      suspensionArms: new THREE.MeshStandardMaterial({
        color: '#9CA3AF',
        metalness: 0.85,
        roughness: 0.2,
      }),
      brakeRotor: new THREE.MeshStandardMaterial({
        color: '#4B5563',
        metalness: 0.95,
        roughness: 0.3,
      }),
      brakeCaliper: new THREE.MeshStandardMaterial({
        color: customization.caliperColor,
        metalness: 0.6,
        roughness: 0.2,
      }),
      wheelRim: new THREE.MeshStandardMaterial({
        color: '#111827',
        metalness: 0.9,
        roughness: 0.2,
      }),
      tireRubber: new THREE.MeshStandardMaterial({
        color: '#0D0D0D',
        roughness: 0.85,
        metalness: 0.05,
      }),
      cockpit: new THREE.MeshStandardMaterial({
        color: customization.interiorTrim === 'white' ? '#E5E7EB' : '#18181B',
        roughness: 0.7,
      }),
      headlights: new THREE.MeshBasicMaterial({
        color: '#FFFFFF',
      }),
      taillights: new THREE.MeshBasicMaterial({
        color: '#FF1133',
      }),
      glowCyan: new THREE.MeshBasicMaterial({
        color: '#00F0FF',
      }),
    };
  }, [customization.paintColor, customization.caliperColor, customization.isXRay, customization.interiorTrim]);

  useFrame((state, delta) => {
    // Smooth lerp for exploded view transition
    currentExploded.current = THREE.MathUtils.lerp(
      currentExploded.current,
      customization.explodedProgress,
      delta * 5.0
    );

    // Auto-rotate scene when idle
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  const ep = currentExploded.current;

  // Component Click Helper
  const handlePartClick = (e: any, name: string, meta: any) => {
    e.stopPropagation();
    onSelectComponent?.(name, meta);
  };

  const handlePointerOver = (e: any, name: string) => {
    e.stopPropagation();
    setHoveredComponent?.(name);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredComponent?.(null);
  };

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} dispose={null}>
      {/* ======================================================== */}
      {/* 1. AERODYNAMIC BODY SHELL & CANOPY (Explodes Upwards)     */}
      {/* ======================================================== */}
      <group
        position={[0, ep * 1.4, 0]}
        onClick={(e) =>
          handlePartClick(e, 'AERODYNAMIC CARBON MONOCOQUE BODY', {
            partNumber: 'CMP-AERO-DRS-WING',
            category: 'AERO / BODY',
            manufacturer: 'AutoEngine Precision Labs',
            supplier: 'Bosch Mobility Solutions',
            specs: 'Aerodynamic Drag Cd 0.208 • Active Venturi Downforce 450 kg • Full Carbon Fiber Shell',
            status: 'APPROVED',
            weight: '240 kg',
          })
        }
        onPointerOver={(e) => handlePointerOver(e, 'BODY')}
        onPointerOut={handlePointerOut}
      >
        {/* Main Curved Body Shell */}
        <mesh position={[0, 0.45, 0]} material={materials.body} castShadow receiveShadow>
          <boxGeometry args={[1.9, 0.4, 4.4]} />
        </mesh>

        {/* Aerodynamic Hood Slope */}
        <mesh position={[0, 0.42, 1.4]} rotation={[-0.15, 0, 0]} material={materials.body} castShadow>
          <boxGeometry args={[1.82, 0.28, 1.6]} />
        </mesh>

        {/* Fastback Glass Canopy */}
        <mesh position={[0, 0.82, -0.2]} rotation={[0.08, 0, 0]} material={materials.glass} castShadow>
          <boxGeometry args={[1.5, 0.45, 2.2]} />
        </mesh>

        {/* Front Splitter Carbon Fiber */}
        <mesh position={[0, 0.15, 2.25]} material={materials.carbon} castShadow>
          <boxGeometry args={[1.95, 0.05, 0.4]} />
        </mesh>

        {/* Rear Diffuser & DRS Active Wing */}
        <mesh position={[0, 0.2, -2.25]} material={materials.carbon} castShadow>
          <boxGeometry args={[1.9, 0.1, 0.35]} />
        </mesh>
        <mesh position={[0, 0.85, -2.15]} material={materials.carbon} castShadow>
          <boxGeometry args={[1.7, 0.04, 0.3]} />
        </mesh>

        {/* LED Matrix Headlights */}
        <mesh position={[-0.7, 0.48, 2.18]} material={materials.headlights}>
          <boxGeometry args={[0.35, 0.04, 0.05]} />
        </mesh>
        <mesh position={[0.7, 0.48, 2.18]} material={materials.headlights}>
          <boxGeometry args={[0.35, 0.04, 0.05]} />
        </mesh>

        {/* Continuous Rear Neon Taillight Bar */}
        <mesh position={[0, 0.52, -2.22]} material={materials.taillights}>
          <boxGeometry args={[1.8, 0.03, 0.04]} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 2. DRIVER COCKPIT & INTERIOR (Explodes Mid-Upper)        */}
      {/* ======================================================== */}
      <group
        position={[0, ep * 0.8, 0]}
        onClick={(e) =>
          handlePartClick(e, 'ERGONOMIC DRIVER COCKPIT & OLED CLUSTER', {
            partNumber: 'CMP-DSB-OLED-CURV',
            category: 'INTERIOR / DASHBOARD',
            manufacturer: 'Recaro Automotive Engineering',
            supplier: 'Continental Autonomous Optics',
            specs: '37" 8K Curved Panoramic OLED • Snapdragon Digital Chassis • Dual Recaro Monocoque Shells',
            status: 'APPROVED',
            weight: '40.5 kg',
          })
        }
        onPointerOver={(e) => handlePointerOver(e, 'COCKPIT')}
        onPointerOut={handlePointerOut}
      >
        {/* Recaro Bucket Seats (Left & Right) */}
        <mesh position={[-0.45, 0.55, -0.1]} material={materials.cockpit}>
          <boxGeometry args={[0.45, 0.6, 0.55]} />
        </mesh>
        <mesh position={[0.45, 0.55, -0.1]} material={materials.cockpit}>
          <boxGeometry args={[0.45, 0.6, 0.55]} />
        </mesh>

        {/* Curved Panoramic OLED Dashboard Screen */}
        <mesh position={[0, 0.68, 0.65]} rotation={[-0.2, 0, 0]} material={materials.batteryCells}>
          <boxGeometry args={[1.3, 0.12, 0.02]} />
        </mesh>

        {/* Steering Yoke */}
        <mesh position={[-0.45, 0.62, 0.45]} material={materials.carbon}>
          <torusGeometry args={[0.14, 0.025, 8, 24]} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 3. 800V SKATEBOARD CHASSIS & 82/105 kWh BATTERY PACK      */}
      {/* ======================================================== */}
      <group
        position={[0, -ep * 0.6, 0]}
        onClick={(e) =>
          handlePartClick(e, '800V SKATEBOARD LIQUID-COOLED BATTERY PACK', {
            partNumber: customization.powertrain === 'tri' ? 'CMP-BAT-105KW' : 'CMP-BAT-82KW',
            category: 'BATTERY / ENERGY STORAGE',
            manufacturer: 'Samsung SDI High-Voltage Div',
            supplier: 'Samsung SDI High-Voltage Div',
            specs: customization.powertrain === 'tri' ? '105 kWh Solid-State Hypercell • 900V • 350 kW Fast Charge' : '82 kWh Liquid-Cooled NMC • 800V Architecture • 350 kW Fast Charge',
            status: 'APPROVED',
            weight: customization.powertrain === 'tri' ? '535 kg' : '495 kg',
          })
        }
        onPointerOver={(e) => handlePointerOver(e, 'BATTERY')}
        onPointerOut={handlePointerOut}
      >
        {/* Heavy Aluminum Battery Protection Frame */}
        <mesh position={[0, 0.12, 0]} material={materials.batteryEnclosure} castShadow receiveShadow>
          <boxGeometry args={[1.65, 0.18, 2.8]} />
        </mesh>

        {/* Glowing Internal Prismatic Battery Cell Modules */}
        <mesh position={[0, 0.14, 0]} material={materials.batteryCells}>
          <boxGeometry args={[1.5, 0.12, 2.6]} />
        </mesh>

        {/* High Voltage Orange Conduit Busbars */}
        <mesh position={[-0.6, 0.22, 0]} material={materials.motorCoils}>
          <cylinderGeometry args={[0.025, 0.025, 2.7, 12]} />
        </mesh>
        <mesh position={[0.6, 0.22, 0]} material={materials.motorCoils}>
          <cylinderGeometry args={[0.025, 0.025, 2.7, 12]} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 4. DUAL AXIAL-FLUX ELECTRIC DRIVE MOTORS & INVERTER      */}
      {/* ======================================================== */}
      <group
        position={[0, -ep * 1.0, 0]}
        onClick={(e) =>
          handlePartClick(e, 'DUAL AXIAL-FLUX PERMANENT MAGNET ELECTRIC MOTORS', {
            partNumber: 'CMP-MOT-250KW',
            category: 'POWERTRAIN / ELECTRIC DRIVE',
            manufacturer: 'Magna Steyr Vehicle Powertrains',
            supplier: 'Bosch Mobility Solutions',
            specs: 'Dual 250 kW Silicon-Carbide (SiC) Inverters • 20,000 RPM Max • 98.8% Inverter Efficiency',
            status: 'APPROVED',
            weight: '140.5 kg (Combined)',
          })
        }
        onPointerOver={(e) => handlePointerOver(e, 'MOTORS')}
        onPointerOut={handlePointerOut}
      >
        {/* Front Drive Unit */}
        <group position={[0, 0.18, 1.45]}>
          <mesh material={materials.motorHousing} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.55, 24]} />
          </mesh>
          <mesh material={materials.motorCoils}>
            <cylinderGeometry args={[0.12, 0.12, 0.58, 24]} />
          </mesh>
        </group>

        {/* Rear Performance Drive Unit */}
        <group position={[0, 0.18, -1.45]}>
          <mesh material={materials.motorHousing} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.65, 24]} />
          </mesh>
          <mesh material={materials.motorCoils}>
            <cylinderGeometry args={[0.15, 0.15, 0.68, 24]} />
          </mesh>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 5. BILSTEIN SUSPENSION & BREMBO CARBON-CERAMIC BRAKES    */}
      {/* ======================================================== */}
      <group
        position={[0, -ep * 0.3, 0]}
        onClick={(e) =>
          handlePartClick(e, 'BILSTEIN ADAPTIVE AIR SUSPENSION & BREMBO BRAKES', {
            partNumber: 'CMP-SUSP-ADAPT',
            category: 'CHASSIS / SUSPENSION & BRAKES',
            manufacturer: 'Bilstein & Brembo Racing',
            supplier: 'Brembo Racing & Performance',
            specs: '410mm Carbon-Ceramic Rotors • 6-Piston Monobloc Calipers • 12ms Adaptive Magnetorheological Dampers',
            status: 'APPROVED',
            weight: '76.0 kg',
          })
        }
        onPointerOver={(e) => handlePointerOver(e, 'SUSPENSION')}
        onPointerOut={handlePointerOut}
      >
        {/* Suspension Double-Wishbones (Front & Rear) */}
        <mesh position={[-0.8, 0.25, 1.45]} material={materials.suspensionArms}>
          <boxGeometry args={[0.3, 0.04, 0.25]} />
        </mesh>
        <mesh position={[0.8, 0.25, 1.45]} material={materials.suspensionArms}>
          <boxGeometry args={[0.3, 0.04, 0.25]} />
        </mesh>
        <mesh position={[-0.8, 0.25, -1.45]} material={materials.suspensionArms}>
          <boxGeometry args={[0.3, 0.04, 0.25]} />
        </mesh>
        <mesh position={[0.8, 0.25, -1.45]} material={materials.suspensionArms}>
          <boxGeometry args={[0.3, 0.04, 0.25]} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 6. WHEELS & HIGH-PERFORMANCE TYRES (Lateral Explosion)   */}
      {/* ======================================================== */}
      <group
        onClick={(e) =>
          handlePartClick(e, '21" AERO CARBON BLADE WHEELS & MICHELIN PILOT SPORT EV', {
            partNumber: 'CMP-WHL-AERO-21',
            category: 'WHEELS / TYRES',
            manufacturer: 'Bosch Mobility Solutions & Michelin',
            supplier: 'Michelin EV Motorsport',
            specs: '6061-T6 Forged Aerospace Monoblock • Michelin 265/35ZR21 Front, 305/30ZR21 Rear',
            status: 'APPROVED',
            weight: '80.0 kg (Set of 4)',
          })
        }
        onPointerOver={(e) => handlePointerOver(e, 'WHEELS')}
        onPointerOut={handlePointerOut}
      >
        {/* Front Left */}
        <group position={[-1.02 - ep * 0.9, 0.32, 1.45]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tireRubber} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 32]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.wheelRim}>
            <cylinderGeometry args={[0.26, 0.26, 0.27, 24]} />
          </mesh>
          <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.brakeRotor}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
          </mesh>
          <mesh position={[0.05, 0.12, 0]} material={materials.brakeCaliper}>
            <boxGeometry args={[0.06, 0.12, 0.14]} />
          </mesh>
        </group>

        {/* Front Right */}
        <group position={[1.02 + ep * 0.9, 0.32, 1.45]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tireRubber} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 32]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.wheelRim}>
            <cylinderGeometry args={[0.26, 0.26, 0.27, 24]} />
          </mesh>
          <mesh position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.brakeRotor}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
          </mesh>
          <mesh position={[-0.05, 0.12, 0]} material={materials.brakeCaliper}>
            <boxGeometry args={[0.06, 0.12, 0.14]} />
          </mesh>
        </group>

        {/* Rear Left */}
        <group position={[-1.02 - ep * 0.9, 0.33, -1.45]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tireRubber} castShadow>
            <cylinderGeometry args={[0.37, 0.37, 0.3, 32]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.wheelRim}>
            <cylinderGeometry args={[0.27, 0.27, 0.31, 24]} />
          </mesh>
          <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.brakeRotor}>
            <cylinderGeometry args={[0.19, 0.19, 0.02, 24]} />
          </mesh>
          <mesh position={[0.05, 0.11, 0]} material={materials.brakeCaliper}>
            <boxGeometry args={[0.06, 0.11, 0.13]} />
          </mesh>
        </group>

        {/* Rear Right */}
        <group position={[1.02 + ep * 0.9, 0.33, -1.45]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tireRubber} castShadow>
            <cylinderGeometry args={[0.37, 0.37, 0.3, 32]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={materials.wheelRim}>
            <cylinderGeometry args={[0.27, 0.27, 0.31, 24]} />
          </mesh>
          <mesh position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.brakeRotor}>
            <cylinderGeometry args={[0.19, 0.19, 0.02, 24]} />
          </mesh>
          <mesh position={[-0.05, 0.11, 0]} material={materials.brakeCaliper}>
            <boxGeometry args={[0.06, 0.11, 0.13]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default VehicleModel3D;

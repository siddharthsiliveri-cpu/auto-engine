import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ComponentDetailData } from './ComponentTechPanel';

export interface VehicleCustomizationState {
  paintColor: string;
  paintFinish: 'metallic' | 'gloss' | 'matte' | 'carbon';
  wheelStyle: 'forged5' | 'centerlock' | 'multispoke' | 'carbonaero' | 'beadlock';
  tyreStyle: 'cup2r' | 'pzero' | 'potenza' | 'allterrain';
  spoilerStyle: 'gt3' | 'ducktail' | 'lip' | 'active' | 'none';
  caliperColor: string;
  interiorTrim: 'nappa' | 'alcantara' | 'cognac' | 'carbonbucket';
  exhaustStyle: 'akrapovic' | 'quadblack';
  isXRay: boolean;
  explodedProgress: number; // 0 = assembled, 1 = exploded
  isolatedComponent: string | null;
  hiddenComponents: string[];
}

interface Vehicle3DViewerProps {
  modelCode: string;
  customization: VehicleCustomizationState;
  onSelectComponent: (comp: ComponentDetailData) => void;
  selectedComponent: string | null;
  hoveredComponent: string | null;
  setHoveredComponent: (name: string | null) => void;
  cameraPreset: 'front' | 'rear' | 'side' | 'top' | 'cockpit' | 'isometric' | null;
  resetCameraTrigger: number;
  autoRotate?: boolean;
}

// Camera Preset Controller Component
const CameraController: React.FC<{
  preset: 'front' | 'rear' | 'side' | 'top' | 'cockpit' | 'isometric' | null;
  resetTrigger: number;
  controlsRef: React.RefObject<any>;
}> = ({ preset, resetTrigger, controlsRef }) => {
  const { camera } = useThree();
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(3.8, 1.8, 4.8));
  const targetLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.3, 0));

  useEffect(() => {
    if (!preset) return;
    switch (preset) {
      case 'front':
        targetPos.current.set(0, 1.1, 4.8);
        targetLook.current.set(0, 0.4, 0);
        break;
      case 'rear':
        targetPos.current.set(0, 1.1, -4.8);
        targetLook.current.set(0, 0.4, 0);
        break;
      case 'side':
        targetPos.current.set(4.8, 1.1, 0);
        targetLook.current.set(0, 0.4, 0);
        break;
      case 'top':
        targetPos.current.set(0, 6.2, 0.05);
        targetLook.current.set(0, 0, 0);
        break;
      case 'cockpit':
        targetPos.current.set(0.35, 0.82, 0.1);
        targetLook.current.set(0.35, 0.78, 1.2);
        break;
      case 'isometric':
        targetPos.current.set(3.8, 1.8, 4.8);
        targetLook.current.set(0, 0.3, 0);
        break;
    }
  }, [preset]);

  useEffect(() => {
    // Reset camera on demand
    targetPos.current.set(3.8, 1.8, 4.8);
    targetLook.current.set(0, 0.3, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.3, 0);
    }
  }, [resetTrigger, controlsRef]);

  useFrame((_, delta) => {
    camera.position.lerp(targetPos.current, delta * 3.5);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, delta * 3.5);
      controlsRef.current.update();
    }
  });

  return null;
};

// Main 3D Vehicle Geometry Renderer
const VehicleMeshScene: React.FC<{
  modelCode: string;
  customization: VehicleCustomizationState;
  onSelectComponent: (comp: ComponentDetailData) => void;
  selectedComponent: string | null;
  hoveredComponent: string | null;
  setHoveredComponent: (name: string | null) => void;
  autoRotate: boolean;
}> = ({
  modelCode,
  customization,
  onSelectComponent,
  selectedComponent,
  hoveredComponent,
  setHoveredComponent,
  autoRotate,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentExploded = useRef(0);

  // Model-specific silhouette parameters
  const isPorsche = modelCode.includes('POR') || modelCode.includes('911');
  const isBenz = modelCode.includes('MB') || modelCode.includes('AMG');
  const isBMW = modelCode.includes('BMW') || modelCode.includes('M4');
  const isAudi = modelCode.includes('AUDI') || modelCode.includes('R8');
  const isThar = modelCode.includes('MAH') || modelCode.includes('THAR') || modelCode.includes('TERRA');
  const isMustang = modelCode.includes('FORD') || modelCode.includes('MUST');
  const isRolls = modelCode.includes('RR') || modelCode.includes('PHAN') || modelCode.includes('PULSE');
  const isFerrari = modelCode.includes('FER') || modelCode.includes('SF90');
  const isLambo = modelCode.includes('LAM') || modelCode.includes('HUR');

  // Realistic Materials with PBR & finishes
  const materials = useMemo(() => {
    const isTranslucent = customization.isXRay;
    const bodyColor = new THREE.Color(customization.paintColor);

    let metalness = 0.85;
    let roughness = 0.18;
    let clearcoat = 1.0;
    let clearcoatRoughness = 0.08;

    if (customization.paintFinish === 'matte') {
      metalness = 0.25;
      roughness = 0.75;
      clearcoat = 0.1;
    } else if (customization.paintFinish === 'gloss') {
      metalness = 0.45;
      roughness = 0.12;
      clearcoat = 1.0;
    } else if (customization.paintFinish === 'carbon') {
      bodyColor.set('#18181B');
      metalness = 0.3;
      roughness = 0.45;
      clearcoat = 0.9;
    }

    // Interior leather/trim colors
    let interiorColor = '#18181B';
    if (customization.interiorTrim === 'cognac') interiorColor = '#9A5B32';
    else if (customization.interiorTrim === 'alcantara') interiorColor = '#27272A';
    else if (customization.interiorTrim === 'carbonbucket') interiorColor = '#0F0F12';

    return {
      body: new THREE.MeshPhysicalMaterial({
        color: bodyColor,
        metalness: isTranslucent ? 0.2 : metalness,
        roughness: isTranslucent ? 0.3 : roughness,
        clearcoat: isTranslucent ? 0.2 : clearcoat,
        clearcoatRoughness,
        transparent: isTranslucent,
        opacity: isTranslucent ? 0.25 : 1.0,
      }),
      carbon: new THREE.MeshStandardMaterial({
        color: '#121214',
        metalness: 0.35,
        roughness: 0.4,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#08080A',
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        transparent: true,
        opacity: customization.isXRay ? 0.15 : 0.72,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: '#E5E7EB',
        metalness: 0.95,
        roughness: 0.08,
      }),
      wheelRim: new THREE.MeshStandardMaterial({
        color: customization.wheelStyle === 'carbonaero' ? '#18181B' : '#2D3139',
        metalness: customization.wheelStyle === 'carbonaero' ? 0.4 : 0.92,
        roughness: customization.wheelStyle === 'carbonaero' ? 0.35 : 0.22,
      }),
      tireRubber: new THREE.MeshStandardMaterial({
        color: customization.tyreStyle === 'allterrain' ? '#141416' : '#0B0B0C',
        roughness: customization.tyreStyle === 'allterrain' ? 0.95 : 0.85,
        metalness: 0.05,
      }),
      brakeRotor: new THREE.MeshStandardMaterial({
        color: '#4B5563',
        metalness: 0.95,
        roughness: 0.32,
      }),
      brakeCaliper: new THREE.MeshStandardMaterial({
        color: customization.caliperColor,
        metalness: 0.75,
        roughness: 0.2,
      }),
      cockpit: new THREE.MeshStandardMaterial({
        color: interiorColor,
        roughness: 0.65,
      }),
      engineMetal: new THREE.MeshStandardMaterial({
        color: isPorsche || isAudi ? '#D1D5DB' : '#374151',
        metalness: 0.88,
        roughness: 0.28,
      }),
      engineCovers: new THREE.MeshStandardMaterial({
        color: isFerrari ? '#DC2626' : isBMW ? '#1E3A8A' : '#111827',
        metalness: 0.4,
        roughness: 0.35,
      }),
      exhaust: new THREE.MeshStandardMaterial({
        color: customization.exhaustStyle === 'akrapovic' ? '#93C5FD' : '#18181B',
        metalness: 0.9,
        roughness: customization.exhaustStyle === 'akrapovic' ? 0.25 : 0.4,
      }),
      headlights: new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
      taillights: new THREE.MeshBasicMaterial({ color: '#FF1133' }),
      glowHighlight: new THREE.MeshBasicMaterial({ color: '#00E5FF', wireframe: true }),
    };
  }, [
    customization.paintColor,
    customization.paintFinish,
    customization.wheelStyle,
    customization.tyreStyle,
    customization.caliperColor,
    customization.interiorTrim,
    customization.exhaustStyle,
    customization.isXRay,
    isFerrari,
    isBMW,
    isPorsche,
    isAudi,
  ]);

  useFrame((_, delta) => {
    // Lerp exploded progress smoothly
    currentExploded.current = THREE.MathUtils.lerp(
      currentExploded.current,
      customization.explodedProgress,
      delta * 4.5
    );

    // Auto rotate when requested
    if (autoRotate && groupRef.current && customization.explodedProgress === 0) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const ep = currentExploded.current;

  // Visibility and Isolation check
  const isPartVisible = (partKey: string) => {
    if (customization.hiddenComponents.includes(partKey)) return false;
    if (customization.isolatedComponent && customization.isolatedComponent !== partKey) return false;
    return true;
  };

  const isPartHighlighted = (partKey: string) => {
    return selectedComponent === partKey || hoveredComponent === partKey;
  };

  const handlePartClick = (e: any, partKey: string, compData: ComponentDetailData) => {
    e.stopPropagation();
    onSelectComponent(compData);
  };

  // Dimensions adjusted by vehicle class
  const bodyLength = isRolls ? 5.2 : isThar ? 3.9 : isLambo || isFerrari ? 4.5 : 4.6;
  const bodyWidth = isRolls ? 2.1 : isThar ? 1.85 : isLambo || isFerrari ? 2.05 : 1.95;
  const bodyHeight = isThar ? 0.9 : isLambo || isFerrari ? 0.35 : isRolls ? 0.6 : 0.45;
  const groundOffset = isThar ? 0.35 : isLambo || isFerrari ? 0.05 : 0.15;

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} dispose={null}>
      {/* ======================================================== */}
      {/* 1. BODY MONOCOQUE & PANELS (Explodes Upwards)            */}
      {/* ======================================================== */}
      {isPartVisible('BODY') && (
        <group
          position={[0, ep * 1.5, 0]}
          onClick={(e) =>
            handlePartClick(e, 'BODY', {
              name: `${isPorsche ? 'Porsche Aerodynamic' : isFerrari ? 'Ferrari Carbon' : isMustang ? 'Mustang Fastback' : 'Aerodynamic Precision'} Monocoque Body Shell`,
              category: 'BODY & AERO',
              partNumber: `CMP-BDY-${modelCode.replace(/[^A-Z0-9]/g, '').slice(0, 8)}`,
              manufacturer: isPorsche ? 'Porsche Motorsport' : isFerrari ? 'Scuderia Ferrari' : 'AutoEngine Engineering',
              supplier: 'Bosch Mobility Solutions',
              material: 'Toray T1000 Autoclave Carbon Fiber',
              weight: '198.0 kg',
              cost: 14500,
              specs: `Class-A surfacing with Cd 0.28. Integrated aero venting channels for high-speed lateral stability.`,
              status: 'APPROVED',
              compatibleAlternatives: [
                { id: 'alt-body-carbon', name: 'Raw Exposed 3K Carbon Weave Package', partNumber: 'CMP-BDY-RAW-3K', costUsd: 18900, manufacturer: 'AutoEngine Tech' },
                { id: 'alt-body-track', name: 'Clubsport Widebody Fender Package', partNumber: 'CMP-BDY-WIDE-GT', costUsd: 16200, manufacturer: 'AutoEngine Motorsport' },
              ],
            })
          }
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('BODY');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          {/* Main Body Silhouette */}
          <mesh position={[0, 0.45 + groundOffset, 0]} material={materials.body} castShadow receiveShadow>
            <boxGeometry args={[bodyWidth, bodyHeight, bodyLength]} />
          </mesh>

          {/* Vehicle Specific Hood Slope */}
          <mesh
            position={[0, 0.45 + groundOffset + (isThar ? 0.25 : 0.05), bodyLength * 0.28]}
            rotation={[isThar ? 0 : -0.14, 0, 0]}
            material={materials.body}
            castShadow
          >
            <boxGeometry args={[bodyWidth * 0.94, bodyHeight * 0.6, bodyLength * 0.35]} />
          </mesh>

          {/* Roof & Greenhouse (Cabin Glass) */}
          <mesh
            position={[0, 0.82 + groundOffset + (isThar ? 0.4 : 0), -0.1]}
            rotation={[isMustang || isPorsche ? 0.09 : 0.02, 0, 0]}
            material={materials.glass}
            castShadow
          >
            <boxGeometry
              args={[
                bodyWidth * (isThar ? 0.88 : 0.78),
                isThar ? 0.65 : 0.45,
                bodyLength * (isRolls ? 0.55 : 0.48),
              ]}
            />
          </mesh>

          {/* Front Bumper & Splitter */}
          <mesh position={[0, 0.15 + groundOffset, bodyLength * 0.51]} material={materials.carbon} castShadow>
            <boxGeometry args={[bodyWidth * 1.02, 0.08, 0.35]} />
          </mesh>

          {/* Rear Diffuser */}
          <mesh position={[0, 0.2 + groundOffset, -bodyLength * 0.51]} material={materials.carbon} castShadow>
            <boxGeometry args={[bodyWidth * 0.98, 0.12, 0.35]} />
          </mesh>

          {/* Distinctive Grille */}
          <mesh position={[0, 0.35 + groundOffset, bodyLength * 0.52]} material={isRolls ? materials.chrome : materials.carbon}>
            <boxGeometry args={[isRolls ? 0.9 : isBMW ? 1.2 : 1.4, isRolls ? 0.5 : 0.22, 0.04]} />
          </mesh>

          {/* Headlights */}
          <mesh position={[-bodyWidth * 0.38, 0.5 + groundOffset, bodyLength * 0.49]} material={materials.headlights}>
            <boxGeometry args={[0.32, 0.06, 0.06]} />
          </mesh>
          <mesh position={[bodyWidth * 0.38, 0.5 + groundOffset, bodyLength * 0.49]} material={materials.headlights}>
            <boxGeometry args={[0.32, 0.06, 0.06]} />
          </mesh>

          {/* Taillights */}
          <mesh position={[0, 0.55 + groundOffset, -bodyLength * 0.51]} material={materials.taillights}>
            <boxGeometry args={[bodyWidth * 0.9, 0.04, 0.04]} />
          </mesh>

          {/* Selected Component Wireframe Glow */}
          {isPartHighlighted('BODY') && (
            <mesh position={[0, 0.45 + groundOffset, 0]} material={materials.glowHighlight}>
              <boxGeometry args={[bodyWidth * 1.02, bodyHeight * 1.02, bodyLength * 1.02]} />
            </mesh>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 2. BONNET / HOOD (Explodes Forward and Up)              */}
      {/* ======================================================== */}
      {isPartVisible('HOOD') && (
        <group
          position={[0, ep * 1.8 + groundOffset, ep * 0.9]}
          onClick={(e) =>
            handlePartClick(e, 'HOOD', {
              name: `${isMustang ? 'Vented Heat Extraction' : isPorsche ? 'Front Luggage' : 'Lightweight Carbon'} Bonnet`,
              category: 'EXTERIOR / HOOD',
              partNumber: `CMP-HOD-${modelCode.replace(/[^A-Z0-9]/g, '').slice(0, 6)}`,
              manufacturer: 'AutoEngine Precision Labs',
              supplier: 'Continental Autonomous Optics',
              material: 'Dry Vacuum Carbon Composite',
              weight: '11.5 kg',
              cost: 3800,
              specs: 'Includes dual inverted air extractors and quick-release titanium latches.',
              status: 'APPROVED',
              compatibleAlternatives: [
                { id: 'alt-hood-vented', name: 'Aggressive GT3 Vented Carbon Bonnet', partNumber: 'CMP-HOD-GT3', costUsd: 4600, manufacturer: 'AutoEngine Tech' },
                { id: 'alt-hood-poly', name: 'Transparent Polycarbonate Center Window', partNumber: 'CMP-HOD-CLEAR', costUsd: 3900, manufacturer: 'AutoEngine Tech' },
              ],
            })
          }
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('HOOD');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          <mesh position={[0, 0.62, bodyLength * 0.28]} rotation={[-0.14, 0, 0]} material={materials.body} castShadow>
            <boxGeometry args={[bodyWidth * 0.88, 0.03, bodyLength * 0.32]} />
          </mesh>

          {isPartHighlighted('HOOD') && (
            <mesh position={[0, 0.62, bodyLength * 0.28]} rotation={[-0.14, 0, 0]} material={materials.glowHighlight}>
              <boxGeometry args={[bodyWidth * 0.9, 0.05, bodyLength * 0.34]} />
            </mesh>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 3. SPOILER / WING (Swappable & Explodes Upwards)         */}
      {/* ======================================================== */}
      {isPartVisible('SPOILER') && customization.spoilerStyle !== 'none' && (
        <group
          position={[0, ep * 2.3 + groundOffset, -ep * 0.6]}
          onClick={(e) =>
            handlePartClick(e, 'SPOILER', {
              name:
                customization.spoilerStyle === 'gt3'
                  ? 'GT3 Swan-Neck Carbon Aerodynamic Wing'
                  : customization.spoilerStyle === 'ducktail'
                  ? 'Heritage Carbon Ducktail Spoiler'
                  : customization.spoilerStyle === 'lip'
                  ? 'Low-Drag OEM Carbon Lip'
                  : 'Active Speed-Deployable Aerodynamic DRS Wing',
              category: 'AERODYNAMICS / SPOILER',
              partNumber: `CMP-SPL-${customization.spoilerStyle.toUpperCase()}`,
              manufacturer: 'Brembo Racing & Aero Tech',
              supplier: 'Bosch Mobility Solutions',
              material: 'Autoclave Carbon Weave & Billet Aluminum Pylons',
              weight: customization.spoilerStyle === 'gt3' ? '12.0 kg' : '4.5 kg',
              cost: customization.spoilerStyle === 'gt3' ? 5400 : 2200,
              specs: 'Tested up to 330 km/h with wind tunnel verified downforce.',
              status: 'APPROVED',
              compatibleAlternatives: [
                { id: 'alt-spoiler-gt3', name: 'GT3 Swan-Neck Carbon Aerodynamic Wing', partNumber: 'CMP-SPOILER-GT3', costUsd: 5400, manufacturer: 'AutoEngine' },
                { id: 'alt-spoiler-ducktail', name: 'Heritage Carbon Ducktail Spoiler', partNumber: 'CMP-SPOILER-DUCKTAIL', costUsd: 2200, manufacturer: 'AutoEngine' },
                { id: 'alt-spoiler-lip', name: 'Low-Drag OEM Carbon Lip', partNumber: 'CMP-SPOILER-LIP', costUsd: 1200, manufacturer: 'AutoEngine' },
              ],
            })
          }
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('SPOILER');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          {customization.spoilerStyle === 'gt3' ? (
            <group position={[0, 0.95, -bodyLength * 0.48]}>
              {/* Twin Pylons */}
              <mesh position={[-0.45, -0.15, 0]} material={materials.carbon}>
                <boxGeometry args={[0.04, 0.35, 0.12]} />
              </mesh>
              <mesh position={[0.45, -0.15, 0]} material={materials.carbon}>
                <boxGeometry args={[0.04, 0.35, 0.12]} />
              </mesh>
              {/* Top Airfoil */}
              <mesh material={materials.carbon} castShadow>
                <boxGeometry args={[bodyWidth * 0.92, 0.04, 0.35]} />
              </mesh>
            </group>
          ) : customization.spoilerStyle === 'ducktail' ? (
            <mesh position={[0, 0.78, -bodyLength * 0.49]} rotation={[-0.35, 0, 0]} material={materials.body} castShadow>
              <boxGeometry args={[bodyWidth * 0.78, 0.12, 0.2]} />
            </mesh>
          ) : (
            <mesh position={[0, 0.72, -bodyLength * 0.5]} material={materials.carbon} castShadow>
              <boxGeometry args={[bodyWidth * 0.85, 0.04, 0.18]} />
            </mesh>
          )}

          {isPartHighlighted('SPOILER') && (
            <mesh position={[0, 0.85, -bodyLength * 0.48]} material={materials.glowHighlight}>
              <boxGeometry args={[bodyWidth * 0.95, 0.4, 0.4]} />
            </mesh>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 4. ENGINE & POWERTRAIN (Explodes Center-Forward)         */}
      {/* ======================================================== */}
      {isPartVisible('ENGINE') && (
        <group
          position={[0, ep * 0.9 + groundOffset, (isPorsche ? -1.4 : isFerrari || isAudi || isLambo ? -0.8 : 1.2) * (1 - ep * 0.4)]}
          onClick={(e) =>
            handlePartClick(e, 'ENGINE', {
              name: isPorsche
                ? '3.7L Twin-Turbo Flat-Six Boxer Engine'
                : isFerrari
                ? 'Ferrari 4.0L V8 Twin-Turbo + Tri-Motor PHEV'
                : isAudi || isLambo
                ? '5.2L Naturally Aspirated V10 FSI Engine'
                : isMustang
                ? 'Gen-4 5.0L Coyote Naturally Aspirated V8'
                : isRolls
                ? '6.75L Twin-Turbo V12 Engine'
                : isThar
                ? 'mHawk 2.2L All-Terrain Turbo Diesel'
                : isBMW
                ? '3.0L BMW M TwinPower Turbo Inline-6 (S58)'
                : 'Handcrafted AMG 4.0L V8 Biturbo Powertrain',
              category: 'POWERTRAIN / ENGINE',
              partNumber: `CMP-ENG-${modelCode.replace(/[^A-Z0-9]/g, '').slice(0, 6)}`,
              manufacturer: 'Magna Steyr Vehicle Powertrains',
              supplier: 'Bosch Mobility Solutions',
              material: 'Die-cast Aluminum Crankcase & Forged Titanium Internals',
              weight: '215.0 kg',
              cost: 32000,
              specs: `Peak Power: ${isFerrari ? '986 hp' : isPorsche ? '640 hp' : isMustang ? '486 hp' : '577 hp'}. Dynamometer calibrated with titanium intake valves.`,
              status: 'APPROVED',
              compatibleAlternatives: [
                { id: 'alt-eng-stage2', name: 'Stage 2 Twin-Scroll Turbo Upgrade Package', partNumber: 'CMP-ENG-STG2-BOOST', costUsd: 12500, manufacturer: 'AutoEngine Power' },
                { id: 'alt-eng-titanium', name: 'Titanium Billet Rods & Forged High-Rev Camshaft', partNumber: 'CMP-ENG-BILLET-CAM', costUsd: 8400, manufacturer: 'AutoEngine Power' },
              ],
            })
          }
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('ENGINE');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          {/* Main Engine Block */}
          <mesh material={materials.engineMetal} castShadow>
            <boxGeometry args={[0.75, 0.45, 0.95]} />
          </mesh>
          {/* Valve / Cam Covers */}
          <mesh position={[0, 0.28, 0]} material={materials.engineCovers}>
            <boxGeometry args={[0.72, 0.14, 0.9]} />
          </mesh>
          {/* Intake Plenum */}
          <mesh position={[0, 0.38, 0]} material={materials.carbon}>
            <boxGeometry args={[0.55, 0.12, 0.7]} />
          </mesh>

          {isPartHighlighted('ENGINE') && (
            <mesh material={materials.glowHighlight}>
              <boxGeometry args={[0.8, 0.55, 1.05]} />
            </mesh>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 5. COCKPIT & INTERIOR (Explodes Mid-Upper)               */}
      {/* ======================================================== */}
      {isPartVisible('INTERIOR') && (
        <group
          position={[0, ep * 0.75 + groundOffset, 0]}
          onClick={(e) =>
            handlePartClick(e, 'INTERIOR', {
              name:
                customization.interiorTrim === 'alcantara'
                  ? 'Full Race Alcantara Interior with Matte Carbon Trim'
                  : customization.interiorTrim === 'cognac'
                  ? 'Hand-Stitched Cognac Tan Luxury Leather'
                  : customization.interiorTrim === 'carbonbucket'
                  ? 'Full Carbon Monocoque Bucket Racing Shells'
                  : 'Obsidian Nappa Leather Interior with Cyan Stitching',
              category: 'INTERIOR / COCKPIT',
              partNumber: `CMP-INT-${customization.interiorTrim.toUpperCase()}`,
              manufacturer: 'Recaro Automotive Engineering',
              supplier: 'Continental Autonomous Optics',
              material: customization.interiorTrim === 'alcantara' ? 'Track-spec Alcantara' : 'Semi-Aniline Nappa Leather',
              weight: '34.0 kg',
              cost: 5200,
              specs: 'Includes 18-way pneumatic posture bolsters and 37" panoramic digital driver instrumentation.',
              status: 'APPROVED',
              compatibleAlternatives: [
                { id: 'alt-int-alcantara', name: 'Full Race Alcantara Interior with Matte Carbon', partNumber: 'CMP-INT-TRACK-ALCANTARA', costUsd: 4800, manufacturer: 'Recaro' },
                { id: 'alt-int-cognac', name: 'Hand-Stitched Cognac Tan Luxury Leather', partNumber: 'CMP-INT-COGNAC-LEATHER', costUsd: 6800, manufacturer: 'Recaro' },
                { id: 'alt-int-nappa', name: 'Obsidian Nappa Leather with Cyan Stitching', partNumber: 'CMP-INT-OBSIDIAN-NAPPA', costUsd: 5200, manufacturer: 'Recaro' },
              ],
            })
          }
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('INTERIOR');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          {/* Driver & Passenger Bucket Seats */}
          <mesh position={[-0.45, 0.45, -0.1]} material={materials.cockpit} castShadow>
            <boxGeometry args={[0.42, 0.55, 0.5]} />
          </mesh>
          <mesh position={[0.45, 0.45, -0.1]} material={materials.cockpit} castShadow>
            <boxGeometry args={[0.42, 0.55, 0.5]} />
          </mesh>
          {/* Steering Wheel & Column */}
          <mesh position={[0.45, 0.55, 0.45]} rotation={[-0.2, 0, 0]} material={materials.carbon}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
          </mesh>
          {/* Dashboard Curved Display */}
          <mesh position={[0, 0.6, 0.6]} rotation={[-0.15, 0, 0]} material={materials.glass}>
            <boxGeometry args={[1.25, 0.12, 0.04]} />
          </mesh>

          {isPartHighlighted('INTERIOR') && (
            <mesh position={[0, 0.5, 0.1]} material={materials.glowHighlight}>
              <boxGeometry args={[1.4, 0.7, 1.2]} />
            </mesh>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 6. WHEELS & TYRES (4 Corners, Expand Laterally)          */}
      {/* ======================================================== */}
      {isPartVisible('WHEELS') && (
        <group>
          {[
            { id: 'FL', pos: [bodyWidth * 0.48 + ep * 1.4, 0.32 + groundOffset, bodyLength * 0.32], isFront: true },
            { id: 'FR', pos: [-(bodyWidth * 0.48 + ep * 1.4), 0.32 + groundOffset, bodyLength * 0.32], isFront: true },
            { id: 'RL', pos: [bodyWidth * 0.49 + ep * 1.4, 0.34 + groundOffset, -bodyLength * 0.32], isFront: false },
            { id: 'RR', pos: [-(bodyWidth * 0.49 + ep * 1.4), 0.34 + groundOffset, -bodyLength * 0.32], isFront: false },
          ].map((wheel) => (
            <group
              key={wheel.id}
              position={wheel.pos as [number, number, number]}
              onClick={(e) =>
                handlePartClick(e, 'WHEELS', {
                  name:
                    customization.wheelStyle === 'centerlock'
                      ? 'Centerlock Monoblock GT Wheels'
                      : customization.wheelStyle === 'forged5'
                      ? 'Forged 5-Spoke Lightweight Wheels'
                      : customization.wheelStyle === 'carbonaero'
                      ? 'Carbon Aero Disc Wheels'
                      : customization.wheelStyle === 'beadlock'
                      ? '17" Rugged Beadlock Off-Road Wheels'
                      : 'Multi-Spoke Competition Alloy Wheels',
                  category: 'WHEELS & TYRES',
                  partNumber: `CMP-WHL-${customization.wheelStyle.toUpperCase()}`,
                  manufacturer: 'Bosch Mobility Solutions',
                  supplier: 'Michelin EV Motorsport',
                  material: customization.wheelStyle === 'carbonaero' ? 'Carbon + Forged Aluminum' : '6061-T6 Forged Aluminum',
                  weight: '34.0 kg per axle',
                  cost: 3800,
                  specs: `Paired with ${customization.tyreStyle === 'cup2r' ? 'Michelin Pilot Sport Cup 2 R Semi-Slicks' : 'Pirelli P-Zero Corsa Tyres'}.`,
                  status: 'APPROVED',
                  compatibleAlternatives: [
                    { id: 'alt-whl-centerlock', name: 'Centerlock Monoblock GT Wheels', partNumber: 'CMP-WHL-CENTERLOCK', costUsd: 5800, manufacturer: 'Brembo Racing' },
                    { id: 'alt-whl-forged5', name: 'Forged 5-Spoke Lightweight Wheels', partNumber: 'CMP-WHL-FORGED-5SPK', costUsd: 3200, manufacturer: 'Bosch' },
                    { id: 'alt-whl-carbonaero', name: 'Carbon Aero Disc Wheels', partNumber: 'CMP-WHL-CARBON-AERO', costUsd: 6400, manufacturer: 'Bosch' },
                    { id: 'alt-whl-multi', name: 'Multi-Spoke Competition Alloy Wheels', partNumber: 'CMP-WHL-COMP-MULTI', costUsd: 2800, manufacturer: 'Bosch' },
                  ],
                })
              }
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredComponent('WHEELS');
              }}
              onPointerOut={() => setHoveredComponent(null)}
            >
              {/* Outer Tyre Rubber */}
              <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tireRubber} castShadow>
                <cylinderGeometry args={[wheel.isFront ? 0.34 : 0.36, wheel.isFront ? 0.34 : 0.36, 0.28, 24]} />
              </mesh>

              {/* Inner Forged Wheel Rim */}
              <mesh rotation={[0, 0, Math.PI / 2]} material={materials.wheelRim}>
                <cylinderGeometry args={[0.26, 0.26, 0.29, 20]} />
              </mesh>

              {/* Center Cap Detail */}
              <mesh rotation={[0, 0, Math.PI / 2]} position={[wheel.pos[0] > 0 ? 0.15 : -0.15, 0, 0]} material={materials.chrome}>
                <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
              </mesh>

              {isPartHighlighted('WHEELS') && (
                <mesh rotation={[0, 0, Math.PI / 2]} material={materials.glowHighlight}>
                  <cylinderGeometry args={[0.38, 0.38, 0.32, 24]} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )}

      {/* ======================================================== */}
      {/* 7. BRAKES & CALIPERS (Decouples Inside Wheels)          */}
      {/* ======================================================== */}
      {isPartVisible('BRAKES') && (
        <group>
          {[
            { id: 'B-FL', pos: [bodyWidth * 0.44 + ep * 0.8, 0.32 + groundOffset, bodyLength * 0.32] },
            { id: 'B-FR', pos: [-(bodyWidth * 0.44 + ep * 0.8), 0.32 + groundOffset, bodyLength * 0.32] },
            { id: 'B-RL', pos: [bodyWidth * 0.45 + ep * 0.8, 0.34 + groundOffset, -bodyLength * 0.32] },
            { id: 'B-RR', pos: [-(bodyWidth * 0.45 + ep * 0.8), 0.34 + groundOffset, -bodyLength * 0.32] },
          ].map((brake) => (
            <group
              key={brake.id}
              position={brake.pos as [number, number, number]}
              onClick={(e) =>
                handlePartClick(e, 'BRAKES', {
                  name: `Brembo Carbon-Ceramic Matrix Brakes (${customization.caliperColor === '#00E5FF' ? 'Electric Cyan' : customization.caliperColor === '#EAB308' ? 'Speed Yellow' : customization.caliperColor === '#EF4444' ? 'Racing Red' : 'Stealth Black'})`,
                  category: 'CHASSIS / BRAKES',
                  partNumber: `CMP-BRK-${customization.caliperColor.replace('#', '').toUpperCase()}`,
                  manufacturer: 'Brembo Racing & Performance',
                  supplier: 'Brembo Racing & Performance',
                  material: 'Carbon-Silicon-Carbide (C/SiC) Matrix & Monobloc 6-Piston Caliper',
                  weight: '32.0 kg total setup',
                  cost: 8900,
                  specs: 'Front 410mm & rear 390mm cross-drilled composite discs operating up to 1,000°C without brake fade.',
                  status: 'APPROVED',
                  compatibleAlternatives: [
                    { id: 'alt-brk-cc-yellow', name: 'Porsche PCCB Carbon-Ceramic (Speed Yellow)', partNumber: 'CMP-BRK-CC-YELLOW', costUsd: 9800, manufacturer: 'Brembo' },
                    { id: 'alt-brk-cc-cyan', name: 'Brembo Carbon-Ceramic Matrix (Electric Cyan)', partNumber: 'CMP-BRK-BREMBO-CC', costUsd: 8900, manufacturer: 'Brembo' },
                    { id: 'alt-brk-red', name: 'High-Friction Slotted Steel Brakes (Racing Red)', partNumber: 'CMP-BRK-SLOTTED-RED', costUsd: 4600, manufacturer: 'Brembo' },
                    { id: 'alt-brk-black', name: 'Heavy-Duty Ventilated Brakes (Stealth Black)', partNumber: 'CMP-BRK-STEALTH-BLK', costUsd: 3900, manufacturer: 'Brembo' },
                  ],
                })
              }
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredComponent('BRAKES');
              }}
              onPointerOut={() => setHoveredComponent(null)}
            >
              {/* Brake Rotor Disc */}
              <mesh rotation={[0, 0, Math.PI / 2]} material={materials.brakeRotor}>
                <cylinderGeometry args={[0.22, 0.22, 0.03, 20]} />
              </mesh>
              {/* Monobloc Caliper */}
              <mesh position={[0, 0.12, 0]} material={materials.brakeCaliper}>
                <boxGeometry args={[0.07, 0.14, 0.2]} />
              </mesh>

              {isPartHighlighted('BRAKES') && (
                <mesh position={[0, 0.06, 0]} material={materials.glowHighlight}>
                  <boxGeometry args={[0.12, 0.28, 0.28]} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )}

      {/* ======================================================== */}
      {/* 8. EXHAUST & DIFFUSER (Explodes Down and Rearward)       */}
      {/* ======================================================== */}
      {isPartVisible('EXHAUST') && (
        <group
          position={[0, -ep * 0.4 + groundOffset, -bodyLength * 0.52 - ep * 1.1]}
          onClick={(e) =>
            handlePartClick(e, 'EXHAUST', {
              name:
                customization.exhaustStyle === 'akrapovic'
                  ? 'Akrapovič Ultralight Titanium Valved Performance Exhaust'
                  : 'Black Chrome Quad-Exit Venturi Sport Exhaust',
              category: 'POWERTRAIN / EXHAUST',
              partNumber: `CMP-EXH-${customization.exhaustStyle.toUpperCase()}`,
              manufacturer: 'Akrapovič Titanium Engineering',
              supplier: 'Akrapovič Titanium Engineering',
              material: 'Hydroformed Aerospace-Grade Titanium',
              weight: customization.exhaustStyle === 'akrapovic' ? '14.5 kg' : '22.0 kg',
              cost: customization.exhaustStyle === 'akrapovic' ? 7900 : 3400,
              specs: 'Includes dual pneumatic sound valves for switchable acoustic resonance.',
              status: 'APPROVED',
              compatibleAlternatives: [
                { id: 'alt-exh-akrap', name: 'Akrapovič Ultralight Titanium Valved Exhaust', partNumber: 'CMP-EXH-AKRAP-TITAN', costUsd: 7900, manufacturer: 'Akrapovič' },
                { id: 'alt-exh-quad', name: 'Black Chrome Quad-Exit Venturi Exhaust', partNumber: 'CMP-EXH-QUAD-BLACK', costUsd: 3400, manufacturer: 'Akrapovič' },
              ],
            })
          }
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('EXHAUST');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          {/* Dual Twin Exhaust Tips */}
          <mesh position={[-bodyWidth * 0.25, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.exhaust}>
            <cylinderGeometry args={[0.07, 0.07, 0.25, 16]} />
          </mesh>
          <mesh position={[bodyWidth * 0.25, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.exhaust}>
            <cylinderGeometry args={[0.07, 0.07, 0.25, 16]} />
          </mesh>

          {isPartHighlighted('EXHAUST') && (
            <mesh position={[0, 0.12, 0]} material={materials.glowHighlight}>
              <boxGeometry args={[bodyWidth * 0.7, 0.2, 0.3]} />
            </mesh>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 9. SUSPENSION & AXLES (Explodes Downward)                */}
      {/* ======================================================== */}
      {isPartVisible('SUSPENSION') && (
        <group
          position={[0, -ep * 0.7 + groundOffset, 0]}
          onClick={(e) =>
            handlePartClick(e, 'SUSPENSION', {
              name: 'Bilstein Adaptive Air Suspension & Anti-Roll Bars',
              category: 'CHASSIS / SUSPENSION',
              partNumber: 'CMP-SUSP-ADAPT',
              manufacturer: 'Bilstein Performance Suspension',
              supplier: 'Bilstein Performance Suspension',
              material: 'Forged Aluminum Double Wishbone & Pneumatic Air Chambers',
              weight: '44.0 kg',
              cost: 5800,
              specs: 'Triple-chamber pneumatic air springs with 12 ms response time and 85mm height range.',
              status: 'APPROVED',
              compatibleAlternatives: [
                { id: 'alt-susp-clubsport', name: 'Clubsport 3-Way Adjustable Coilover Suspension', partNumber: 'CMP-SUSP-CLUBSPORT', costUsd: 6800, manufacturer: 'Bilstein' },
                { id: 'alt-susp-air', name: 'Bilstein Adaptive Air Suspension System', partNumber: 'CMP-SUSP-ADAPT', costUsd: 5800, manufacturer: 'Bilstein' },
              ],
            })
          }
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('SUSPENSION');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          {/* Front Axle Bar */}
          <mesh position={[0, 0.32, bodyLength * 0.32]} rotation={[0, 0, Math.PI / 2]} material={materials.carbon}>
            <cylinderGeometry args={[0.04, 0.04, bodyWidth * 0.85, 12]} />
          </mesh>
          {/* Rear Axle Bar */}
          <mesh position={[0, 0.34, -bodyLength * 0.32]} rotation={[0, 0, Math.PI / 2]} material={materials.carbon}>
            <cylinderGeometry args={[0.04, 0.04, bodyWidth * 0.85, 12]} />
          </mesh>

          {isPartHighlighted('SUSPENSION') && (
            <mesh position={[0, 0.33, 0]} material={materials.glowHighlight}>
              <boxGeometry args={[bodyWidth * 0.9, 0.15, bodyLength * 0.7]} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};

export const Vehicle3DViewer: React.FC<Vehicle3DViewerProps> = ({
  modelCode,
  customization,
  onSelectComponent,
  selectedComponent,
  hoveredComponent,
  setHoveredComponent,
  cameraPreset,
  resetCameraTrigger,
  autoRotate = false,
}) => {
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none bg-[#08090B]">
      <Canvas
        camera={{ position: [3.8, 1.8, 4.8], fov: 42 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Studio Lighting Architecture */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[6, 9, 6]}
          intensity={2.0}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-6, 5, -5]} intensity={0.9} color="#00E5FF" />
        <directionalLight position={[0, 6, -6]} intensity={1.2} color="#FFFFFF" />
        <hemisphereLight intensity={0.4} groundColor="#08090B" color="#FFFFFF" />

        {/* Subtle Cyan Underglow Rim Light */}
        <pointLight position={[0, -0.15, 0]} intensity={2.8} color="#00E5FF" distance={5} />

        {/* Camera Preset Animation Controller */}
        <CameraController
          preset={cameraPreset}
          resetTrigger={resetCameraTrigger}
          controlsRef={controlsRef}
        />

        {/* 3D Vehicle Model Scene */}
        <VehicleMeshScene
          modelCode={modelCode}
          customization={customization}
          onSelectComponent={onSelectComponent}
          selectedComponent={selectedComponent}
          hoveredComponent={hoveredComponent}
          setHoveredComponent={setHoveredComponent}
          autoRotate={autoRotate}
        />

        {/* Studio Floor Contact Shadows */}
        <ContactShadows
          position={[0, -0.21, 0]}
          opacity={0.85}
          scale={11}
          blur={1.6}
          far={4.5}
          color="#000000"
        />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={2.0}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
};

export default Vehicle3DViewer;

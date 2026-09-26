import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import VehicleModel3D, { VehicleCustomization } from './VehicleModel3D';

interface AutomotiveCanvasProps {
  customization: VehicleCustomization;
  onSelectComponent?: (name: string, meta: any) => void;
  hoveredComponent?: string | null;
  setHoveredComponent?: (name: string | null) => void;
  enableControls?: boolean;
  autoRotate?: boolean;
  cameraPosition?: [number, number, number];
}

export const AutomotiveCanvas: React.FC<AutomotiveCanvasProps> = ({
  customization,
  onSelectComponent,
  hoveredComponent,
  setHoveredComponent,
  enableControls = true,
  autoRotate = false,
  cameraPosition = [3.8, 1.8, 4.8],
}) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: cameraPosition, fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[6, 8, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-6, 5, -5]} intensity={0.8} color="#00F0FF" />
        <hemisphereLight intensity={0.4} groundColor="#000000" color="#FFFFFF" />

        {/* Cyan Underglow Rim Light */}
        <pointLight position={[0, -0.4, 0]} intensity={2.5} color="#00F0FF" distance={4} />

        <Suspense fallback={null}>
          <VehicleModel3D
            customization={customization}
            onSelectComponent={onSelectComponent}
            hoveredComponent={hoveredComponent}
            setHoveredComponent={setHoveredComponent}
            autoRotate={autoRotate}
          />

          {/* Contact Shadows on Studio Floor */}
          <ContactShadows
            position={[0, -0.22, 0]}
            opacity={0.85}
            scale={10}
            blur={1.8}
            far={4}
            color="#000000"
          />
        </Suspense>

        {enableControls && (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below floor
            minDistance={2.5}
            maxDistance={12}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
          />
        )}
      </Canvas>
    </div>
  );
};

export default AutomotiveCanvas;

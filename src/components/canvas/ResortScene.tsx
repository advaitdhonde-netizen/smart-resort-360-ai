import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ArchitecturalModel } from './ArchitecturalModel';
import { LightingMode, ZoneId } from '../../types';
import { RESORT_ZONES } from '../../data/resortData';
import { useTheme } from '../../context/ThemeContext';

interface ResortSceneProps {
  lightingMode: LightingMode;
  activeZone: ZoneId | null;
  onSelectZone: (zone: ZoneId) => void;
  scrollProgressRef: React.MutableRefObject<number>;
  isFreeOrbit: boolean;
}

// Camera choreography controller
const CameraDirector: React.FC<{
  scrollProgressRef: React.MutableRefObject<number>;
  activeZone: ZoneId | null;
  isFreeOrbit: boolean;
}> = ({ scrollProgressRef, activeZone, isFreeOrbit }) => {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0.5, 0));

  // Keyframe points along scroll progress [0, 1]
  const cameraTrajectory = useMemo(() => {
    return [
      { progress: 0.0, pos: new THREE.Vector3(7.2, 5.2, 9.4), target: new THREE.Vector3(0, 0.4, 0) },
      { progress: 0.25, pos: new THREE.Vector3(3.6, 2.4, 5.4), target: new THREE.Vector3(-0.6, 0.5, 0.4) },
      { progress: 0.52, pos: new THREE.Vector3(-4.8, 1.9, 3.6), target: new THREE.Vector3(-3.2, 0.3, 1.4) },
      { progress: 0.76, pos: new THREE.Vector3(1.0, 7.8, 5.2), target: new THREE.Vector3(0, 0.2, 0) },
      { progress: 1.0, pos: new THREE.Vector3(5.8, 2.6, 7.0), target: new THREE.Vector3(0, 0.8, -0.6) },
    ];
  }, []);

  useFrame((_, delta) => {
    if (isFreeOrbit) return;

    const p = Math.max(0, Math.min(1, scrollProgressRef.current));

    // If a zone is explicitly selected, prioritize looking at that zone
    if (activeZone) {
      const zoneData = RESORT_ZONES.find((z) => z.id === activeZone);
      if (zoneData) {
        const targetPos = new THREE.Vector3(
          zoneData.position[0] * 0.9 + 3.0,
          zoneData.position[1] + 2.5,
          zoneData.position[2] * 0.9 + 3.5
        );
        const lookTarget = new THREE.Vector3(...zoneData.position);
        camera.position.lerp(targetPos, 0.05);
        currentLookAt.current.lerp(lookTarget, 0.05);
        camera.lookAt(currentLookAt.current);
        return;
      }
    }

    // Otherwise follow the cinematic scroll spline
    // Find surrounding keyframes
    let startIndex = 0;
    for (let i = 0; i < cameraTrajectory.length - 1; i++) {
      if (p >= cameraTrajectory[i].progress && p <= cameraTrajectory[i + 1].progress) {
        startIndex = i;
        break;
      }
    }
    const k1 = cameraTrajectory[startIndex];
    const k2 = cameraTrajectory[startIndex + 1] || k1;
    const span = k2.progress - k1.progress || 1;
    const factor = (p - k1.progress) / span;
    // Smooth easeInOut curve
    const smoothT = factor * factor * (3 - 2 * factor);

    const desiredPos = new THREE.Vector3().lerpVectors(k1.pos, k2.pos, smoothT);
    const desiredTarget = new THREE.Vector3().lerpVectors(k1.target, k2.target, smoothT);

    camera.position.lerp(desiredPos, 0.045);
    currentLookAt.current.lerp(desiredTarget, 0.045);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

// Atmospheric Lighting Rig with calibrated intensity and architectural shadows
const AtmosphereLighting: React.FC<{ lightingMode: LightingMode; isLight?: boolean }> = ({
  lightingMode,
  isLight = false,
}) => {
  const lightConfig = useMemo(() => {
    if (isLight) {
      // Warm natural daylight with soft shadows for Sage / Sand / Ink Light Theme
      return {
        ambient: '#dcd9cc',
        ambientIntensity: 0.82,
        keyLight: '#fff6e5',
        keyIntensity: 1.25,
        keyPos: [9, 11, 7] as [number, number, number],
        fillLight: '#7d8c7c',
        fillIntensity: 0.52,
        warmAccentLight: '#b8ad9b',
        warmAccentIntensity: 0.4,
        fogColor: '#E5E2D6', // Sage/Sand main background #E5E2D6
        fogNear: 16,
        fogFar: 50,
      };
    }

    switch (lightingMode) {
      case 'dawn':
        return {
          ambient: '#1e2229',
          ambientIntensity: 0.7,
          keyLight: '#f5d6ab',
          keyIntensity: 1.3,
          keyPos: [8, 9, 6] as [number, number, number],
          fillLight: '#46566b',
          fillIntensity: 0.5,
          warmAccentLight: '#e09848',
          warmAccentIntensity: 0.6,
          fogColor: '#07090d',
          fogNear: 12,
          fogFar: 42,
        };
      case 'midnight':
        return {
          ambient: '#0b0e14',
          ambientIntensity: 0.5,
          keyLight: '#4a6282',
          keyIntensity: 0.9,
          keyPos: [6, 10, 8] as [number, number, number],
          fillLight: '#182230',
          fillIntensity: 0.4,
          warmAccentLight: '#d48835',
          warmAccentIntensity: 0.8,
          fogColor: '#030508',
          fogNear: 10,
          fogFar: 38,
        };
      case 'twilight':
      default:
        return {
          ambient: '#15181e',
          ambientIntensity: 0.6,
          keyLight: '#e8be8b',
          keyIntensity: 1.25,
          keyPos: [9, 8, 7] as [number, number, number],
          fillLight: '#3a4454',
          fillIntensity: 0.55,
          warmAccentLight: '#e89e43',
          warmAccentIntensity: 0.7,
          fogColor: '#05070a',
          fogNear: 11,
          fogFar: 40,
        };
    }
  }, [lightingMode, isLight]);

  return (
    <>
      <color attach="background" args={[lightConfig.fogColor]} />
      <fog attach="fog" args={[lightConfig.fogColor, lightConfig.fogNear, lightConfig.fogFar]} />

      <ambientLight color={lightConfig.ambient} intensity={lightConfig.ambientIntensity} />
      
      {/* Primary Directional Key Light with calibrated shadow map */}
      <directionalLight
        position={lightConfig.keyPos}
        intensity={lightConfig.keyIntensity}
        color={lightConfig.keyLight}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0003}
      />

      {/* Cool Atmospheric Sky Fill Light (prevents pitch-black voids while preserving contrast) */}
      <directionalLight
        position={[-8, 7, -8]}
        intensity={lightConfig.fillIntensity}
        color={lightConfig.fillLight}
      />

      {/* Warm Architectural Ground/Reflective Bounce Light */}
      <directionalLight
        position={[2, -4, 3]}
        intensity={lightConfig.warmAccentIntensity}
        color={lightConfig.warmAccentLight}
      />
    </>
  );
};

export const ResortScene: React.FC<ResortSceneProps> = ({
  lightingMode,
  activeZone,
  onSelectZone,
  scrollProgressRef,
  isFreeOrbit,
}) => {
  const { isLight } = useTheme();

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        shadows
        className={isFreeOrbit ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-auto'}
        camera={{ position: [7.2, 5.2, 9.4], fov: 42, near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isLight ? 0.92 : 1.0,
        }}
      >
        <AtmosphereLighting lightingMode={lightingMode} isLight={isLight} />

        <ArchitecturalModel
          lightingMode={lightingMode}
          activeZone={activeZone}
          onSelectZone={onSelectZone}
          scrollProgressRef={scrollProgressRef}
          isLight={isLight}
        />

        <CameraDirector
          scrollProgressRef={scrollProgressRef}
          activeZone={activeZone}
          isFreeOrbit={isFreeOrbit}
        />

        {isFreeOrbit && (
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={4}
            maxDistance={22}
          />
        )}
      </Canvas>
    </div>
  );
};

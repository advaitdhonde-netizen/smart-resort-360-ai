import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LightingMode, ZoneId } from '../../types';

interface ArchitecturalModelProps {
  lightingMode: LightingMode;
  activeZone: ZoneId | null;
  onSelectZone: (zone: ZoneId) => void;
  scrollProgressRef: React.MutableRefObject<number>;
  isLight?: boolean;
}

export const ArchitecturalModel: React.FC<ArchitecturalModelProps> = ({
  lightingMode,
  activeZone,
  onSelectZone,
  scrollProgressRef,
  isLight = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Group>(null);

  // Exact materials matching user specification:
  // - Buildings: warm beige/stone
  // - Large slabs: dark charcoal
  // - Roofs: dark graphite
  // - Roads/pathways: dark stone
  // Materials:
  // Dark Theme: warm beige/stone buildings, dark charcoal slabs, dark graphite roofs, dark stone roads, dark green terrain, deep blue pool, smoked glass windows, subtle warm gold accents.
  // Light Theme (Sage / Sand / Ink luxury resort):
  // - Buildings: warm limestone / sandstone / muted beige
  // - Roofs: deep charcoal / dark bronze
  // - Large architectural slabs: dark stone / graphite
  // - Terrain: sage green / muted olive
  // - Vegetation: natural deep green
  // - Pool: deep teal / blue-green water
  // - Windows: dark smoked glass
  // - Paths: warm gray stone
  // - Accent lighting: restrained champagne gold
  const materials = useMemo(() => {
    const isDark = lightingMode === 'midnight' || lightingMode === 'twilight';
    const glowIntensity = isLight ? 0.45 : isDark ? 1.0 : 0.8;

    if (isLight) {
      return {
        // 1. Terrain: sage green / muted olive
        terrain: new THREE.MeshStandardMaterial({
          color: '#566b56',
          roughness: 0.9,
          metalness: 0.04,
        }),

        // Vegetation: natural deep green
        vegetation: new THREE.MeshStandardMaterial({
          color: '#24402a',
          roughness: 0.85,
          metalness: 0.05,
        }),

        // 2. Buildings: warm limestone / sandstone / muted beige
        buildingStone: new THREE.MeshStandardMaterial({
          color: '#c4ad8d',
          roughness: 0.65,
          metalness: 0.08,
        }),

        // 3. Large architectural slabs: dark stone / graphite
        largeSlabs: new THREE.MeshStandardMaterial({
          color: '#2d3330',
          roughness: 0.58,
          metalness: 0.22,
        }),

        // 4. Roofs: deep charcoal / dark bronze
        roofGraphite: new THREE.MeshStandardMaterial({
          color: '#1c201e',
          roughness: 0.48,
          metalness: 0.32,
        }),

        // 5. Roads/pathways: warm gray stone
        pathwaysDarkStone: new THREE.MeshStandardMaterial({
          color: '#7a7469',
          roughness: 0.76,
          metalness: 0.12,
        }),

        // 6. Pool/water: deep teal / blue-green water with subtle reflections
        poolDeepBlue: new THREE.MeshStandardMaterial({
          color: '#0f4a56',
          emissive: '#072b33',
          emissiveIntensity: 0.3,
          roughness: 0.08,
          metalness: 0.5,
          transparent: true,
          opacity: 0.92,
        }),

        // 7. Windows: dark smoked glass
        windowsSmokedGlass: new THREE.MeshPhysicalMaterial({
          color: '#141c19',
          roughness: 0.12,
          metalness: 0.25,
          transmission: 0.65,
          transparent: true,
          opacity: 0.82,
          ior: 1.5,
        }),

        // 8. Architectural accents: restrained champagne gold
        accentsWarmGold: new THREE.MeshStandardMaterial({
          color: '#b58a52',
          roughness: 0.35,
          metalness: 0.82,
        }),

        // Deep Ocean water: slate teal coastal water complementing sage/sand landscape
        oceanWater: new THREE.MeshStandardMaterial({
          color: '#162a33',
          roughness: 0.2,
          metalness: 0.32,
          transparent: true,
          opacity: 0.95,
        }),

        // Warm Interior Glow behind smoked glass
        interiorWarmGlow: new THREE.MeshStandardMaterial({
          color: '#d4a362',
          emissive: '#aa7834',
          emissiveIntensity: glowIntensity,
          roughness: 0.4,
        }),

        // Operational Telemetry Beacons: aged champagne gold
        beaconActive: new THREE.MeshStandardMaterial({
          color: '#b58a52',
          emissive: '#c5a66a',
          emissiveIntensity: 1.6,
        }),
        beaconAttention: new THREE.MeshStandardMaterial({
          color: '#c25736',
          emissive: '#c25736',
          emissiveIntensity: 1.8,
        }),

        // Subtle CAD grid overlay in muted olive
        wireframeAccent: new THREE.MeshBasicMaterial({
          color: '#4d5c4d',
          wireframe: true,
        }),
      };
    }

    // Default Dark Theme materials (completely preserved):
    return {
      // 1. Terrain: dark green/charcoal
      terrain: new THREE.MeshStandardMaterial({
        color: '#1a241e',
        roughness: 0.85,
        metalness: 0.05,
      }),

      // Vegetation: deep natural forest foliage
      vegetation: new THREE.MeshStandardMaterial({
        color: '#16291a',
        roughness: 0.85,
        metalness: 0.05,
      }),

      // 2. Buildings: warm beige/stone
      buildingStone: new THREE.MeshStandardMaterial({
        color: '#bda382',
        roughness: 0.65,
        metalness: 0.12,
      }),

      // 3. Large slabs: dark charcoal
      largeSlabs: new THREE.MeshStandardMaterial({
        color: '#23262c',
        roughness: 0.55,
        metalness: 0.25,
      }),

      // 4. Roofs: dark graphite
      roofGraphite: new THREE.MeshStandardMaterial({
        color: '#17191d',
        roughness: 0.45,
        metalness: 0.35,
      }),

      // 5. Roads/pathways: dark stone
      pathwaysDarkStone: new THREE.MeshStandardMaterial({
        color: '#2e2c28',
        roughness: 0.72,
        metalness: 0.15,
      }),

      // 6. Pool: deep blue
      poolDeepBlue: new THREE.MeshStandardMaterial({
        color: '#0f3d63',
        emissive: '#082542',
        emissiveIntensity: 0.45,
        roughness: 0.08,
        metalness: 0.5,
        transparent: true,
        opacity: 0.92,
      }),

      // 7. Windows: dark smoked glass
      windowsSmokedGlass: new THREE.MeshPhysicalMaterial({
        color: '#131b24',
        roughness: 0.12,
        metalness: 0.2,
        transmission: 0.7,
        transparent: true,
        opacity: 0.78,
        ior: 1.5,
      }),

      // 8. Accents: subtle warm gold
      accentsWarmGold: new THREE.MeshStandardMaterial({
        color: '#c5a059',
        roughness: 0.35,
        metalness: 0.82,
      }),

      // Deep Ocean water
      oceanWater: new THREE.MeshStandardMaterial({
        color: '#071018',
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.95,
      }),

      // Warm Amber Interior Glow behind smoked glass
      interiorWarmGlow: new THREE.MeshStandardMaterial({
        color: '#e6a455',
        emissive: '#bd7024',
        emissiveIntensity: glowIntensity,
        roughness: 0.4,
      }),

      // Operational Telemetry Beacons
      beaconActive: new THREE.MeshStandardMaterial({
        color: '#c5a059',
        emissive: '#d4af37',
        emissiveIntensity: 2.2,
      }),
      beaconAttention: new THREE.MeshStandardMaterial({
        color: '#df6d4d',
        emissive: '#df6d4d',
        emissiveIntensity: 2.6,
      }),

      // Subtle CAD grid overlay
      wireframeAccent: new THREE.MeshBasicMaterial({
        color: '#28362d',
        wireframe: true,
      }),
    };
  }, [lightingMode, isLight]);

  // Subtle continuous motion & scroll response
  useFrame((state) => {
    if (groupRef.current) {
      const scroll = scrollProgressRef.current;
      const targetRotationY = scroll * Math.PI * 0.45;
      const targetRotationX = Math.sin(scroll * Math.PI) * 0.06;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.04);

      const targetScale = 1 + scroll * 0.06;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.04);
    }

    if (waterRef.current) {
      waterRef.current.position.y = 0.06 + Math.sin(state.clock.elapsedTime * 0.8) * 0.008;
    }

    if (pulseRef.current) {
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.15;
      pulseRef.current.scale.set(pulseScale, 1, pulseScale);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Subtle Architectural Localized Warm Accent Lights */}
      <pointLight position={[0, 1.2, -1.0]} color="#f5c078" intensity={0.9} distance={6} decay={2} />
      <pointLight position={[0.2, 0.4, 1.8]} color="#e89e43" intensity={0.7} distance={5} decay={2} />
      <pointLight position={[-3.6, 0.8, 1.6]} color="#f0b875" intensity={0.6} distance={6} decay={2} />
      <pointLight position={[3.8, 0.8, 0.8]} color="#f5c078" intensity={0.6} distance={5} decay={2} />

      {/* ============================================================ */}
      {/* 1. TERRAIN / ARCHITECTURAL CONTOUR PLATES (Dark green/charcoal) */}
      {/* ============================================================ */}
      {/* Base Ocean Plane */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.oceanWater}>
        <planeGeometry args={[70, 70]} />
      </mesh>

      {/* Stepped Architectural Terrain Contours - Dark green/charcoal */}
      <mesh position={[0.2, -0.4, -0.5]} receiveShadow castShadow material={materials.terrain}>
        <boxGeometry args={[14, 0.4, 12]} />
      </mesh>

      <mesh position={[0, -0.15, -0.8]} receiveShadow castShadow material={materials.terrain}>
        <boxGeometry args={[12, 0.35, 10]} />
      </mesh>

      <mesh position={[-0.4, 0.15, -1.2]} receiveShadow castShadow material={materials.terrain}>
        <boxGeometry args={[9.5, 0.3, 7.5]} />
      </mesh>

      {/* CAD Gridlines on terrain */}
      <mesh position={[0, -0.19, -0.8]} material={materials.wireframeAccent}>
        <boxGeometry args={[12.02, 0.36, 10.02]} />
      </mesh>

      {/* ============================================================ */}
      {/* 2. CENTRAL GRAND RESORT PAVILION                             */}
      {/* ============================================================ */}
      <group 
        position={[0, 0.3, -1.0]} 
        onClick={(e) => { e.stopPropagation(); onSelectZone('central-pavilion'); }}
      >
        {/* Tier 1 - Grand Plinth: Warm beige/stone */}
        <mesh position={[0, 0.15, 0]} receiveShadow castShadow material={materials.buildingStone}>
          <boxGeometry args={[4.2, 0.3, 3.4]} />
        </mesh>

        {/* Tier 1 - Windows: Dark smoked glass */}
        <mesh position={[0, 0.65, 0]} material={materials.windowsSmokedGlass}>
          <boxGeometry args={[3.8, 0.7, 3.0]} />
        </mesh>

        {/* Interior Warm Illumination */}
        <mesh position={[0, 0.65, 0]} material={materials.interiorWarmGlow}>
          <boxGeometry args={[2.0, 0.6, 1.6]} />
        </mesh>

        {/* Large slab: Dark charcoal */}
        <mesh position={[0, 1.05, 0]} receiveShadow castShadow material={materials.largeSlabs}>
          <boxGeometry args={[4.6, 0.1, 3.8]} />
        </mesh>

        {/* Tier 2 - Upper Level Windows: Dark smoked glass */}
        <mesh position={[0, 1.45, 0]} material={materials.windowsSmokedGlass}>
          <boxGeometry args={[3.2, 0.7, 2.6]} />
        </mesh>

        {/* Tier 2 Inner Core */}
        <mesh position={[0, 1.45, 0]} material={materials.interiorWarmGlow}>
          <boxGeometry args={[1.6, 0.6, 1.2]} />
        </mesh>

        {/* Roof: Dark graphite */}
        <mesh position={[0, 1.85, 0]} receiveShadow castShadow material={materials.roofGraphite}>
          <boxGeometry args={[5.2, 0.12, 4.2]} />
        </mesh>

        {/* Roof Fascia Accent: Subtle warm gold */}
        <mesh position={[0, 1.83, 0]} material={materials.accentsWarmGold}>
          <boxGeometry args={[5.26, 0.03, 4.26]} />
        </mesh>
        
        {/* Slender Structural Columns: Large slabs / dark charcoal */}
        {[-1.9, 1.9].map((x) =>
          [-1.5, 1.5].map((z) => (
            <mesh key={`col-${x}-${z}`} position={[x, 0.8, z]} castShadow material={materials.largeSlabs}>
              <cylinderGeometry args={[0.04, 0.04, 1.6, 12]} />
            </mesh>
          ))
        )}

        {/* Zone Marker */}
        <mesh position={[0, 2.2, 0]} material={materials.beaconActive}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. INFINITY POOL & HORIZON WELLNESS BASIN (Deep blue)        */}
      {/* ============================================================ */}
      <group 
        position={[0.2, 0.05, 1.8]}
        onClick={(e) => { e.stopPropagation(); onSelectZone('infinity-pool'); }}
      >
        {/* Pool Structure Basin: Large slabs / dark charcoal */}
        <mesh position={[0, -0.05, 0]} receiveShadow castShadow material={materials.largeSlabs}>
          <boxGeometry args={[5.6, 0.25, 2.4]} />
        </mesh>

        {/* Pool Water: Deep blue */}
        <mesh ref={waterRef} position={[0, 0.06, 0]} receiveShadow material={materials.poolDeepBlue}>
          <boxGeometry args={[5.2, 0.02, 2.0]} />
        </mesh>

        {/* Sunken Lounge Pavilion / Firepit: Buildings warm stone */}
        <mesh position={[1.4, 0.08, 0]} receiveShadow castShadow material={materials.buildingStone}>
          <cylinderGeometry args={[0.65, 0.65, 0.16, 24]} />
        </mesh>
        {/* Firepit inner hearth */}
        <mesh position={[1.4, 0.17, 0]} material={materials.interiorWarmGlow}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
        </mesh>

        {/* Sundeck Platform: Roads/pathways dark stone */}
        <mesh position={[-1.6, 0.1, 0.4]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
          <boxGeometry args={[2.2, 0.08, 1.4]} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 4. OVERWATER PRIVATE VILLAS CLUSTER                          */}
      {/* ============================================================ */}
      <group 
        position={[-3.8, -0.1, 1.6]}
        onClick={(e) => { e.stopPropagation(); onSelectZone('ocean-villas'); }}
      >
        {/* Access Boardwalk / Pathways: Dark stone */}
        <mesh position={[1.5, -0.05, -0.6]} rotation={[0, 0.35, 0]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
          <boxGeometry args={[3.6, 0.08, 0.6]} />
        </mesh>

        <mesh position={[0, -0.05, 0]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
          <boxGeometry args={[3.2, 0.08, 0.6]} />
        </mesh>

        {/* 4 Individual Cantilevered Water Villas */}
        {[
          { x: -1.2, z: -1.4, rot: 0.1, isVilla12: false, id: 'v1' },
          { x: -2.0, z: 0.2, rot: -0.15, isVilla12: true, id: 'v12' },
          { x: -0.8, z: 1.4, rot: 0.2, isVilla12: false, id: 'v3' },
          { x: 0.8, z: 2.2, rot: -0.25, isVilla12: false, id: 'v4' },
        ].map((v) => (
          <group key={v.id} position={[v.x, 0, v.z]} rotation={[0, v.rot, 0]}>
            {/* Pier stilts: Dark graphite */}
            <mesh position={[-0.4, -0.3, -0.4]} castShadow material={materials.roofGraphite}>
              <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
            </mesh>
            <mesh position={[0.4, -0.3, 0.4]} castShadow material={materials.roofGraphite}>
              <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
            </mesh>

            {/* Villa Deck / Platform: Pathways dark stone */}
            <mesh position={[0, 0.05, 0]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
              <boxGeometry args={[1.5, 0.08, 1.3]} />
            </mesh>

            {/* Private Plunge Pool: Deep blue */}
            <mesh position={[0.4, 0.06, 0.35]} material={materials.poolDeepBlue}>
              <boxGeometry args={[0.5, 0.04, 0.45]} />
            </mesh>

            {/* Villa Building: Warm beige/stone */}
            <mesh position={[-0.2, 0.35, -0.15]} receiveShadow castShadow material={materials.buildingStone}>
              <boxGeometry args={[0.9, 0.5, 0.8]} />
            </mesh>

            {/* Windows: Dark smoked glass */}
            <mesh position={[-0.2, 0.35, 0.26]} material={materials.windowsSmokedGlass}>
              <boxGeometry args={[0.85, 0.48, 0.04]} />
            </mesh>

            {/* Interior Warm Illumination */}
            <mesh position={[-0.2, 0.35, 0]} material={materials.interiorWarmGlow}>
              <boxGeometry args={[0.5, 0.3, 0.4]} />
            </mesh>

            {/* Villa Roof: Dark graphite */}
            <mesh position={[-0.18, 0.65, 0]} rotation={[0.04, 0, 0]} receiveShadow castShadow material={materials.roofGraphite}>
              <boxGeometry args={[1.1, 0.05, 1.1]} />
            </mesh>

            {/* Roof Eaves Accent: Subtle warm gold */}
            <mesh position={[-0.18, 0.63, 0]} material={materials.accentsWarmGold}>
              <boxGeometry args={[1.14, 0.015, 1.14]} />
            </mesh>

            {/* Pulse on Villa 12 */}
            {v.isVilla12 && (
              <group position={[-0.2, 0.95, 0]}>
                <mesh material={materials.beaconAttention}>
                  <sphereGeometry args={[0.08, 16, 16]} />
                </mesh>
                <group ref={pulseRef}>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.beaconAttention}>
                    <ringGeometry args={[0.15, 0.22, 24]} />
                  </mesh>
                </group>
              </group>
            )}
          </group>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 5. THE OBSIDIAN CULINARY TERRACE                             */}
      {/* ============================================================ */}
      <group 
        position={[3.8, 0.1, 0.8]}
        onClick={(e) => { e.stopPropagation(); onSelectZone('culinary-pavilion'); }}
      >
        {/* Promontory Platform: Large slabs / dark charcoal */}
        <mesh position={[0, 0.05, 0]} receiveShadow castShadow material={materials.largeSlabs}>
          <cylinderGeometry args={[1.8, 1.9, 0.25, 32]} />
        </mesh>

        {/* Circular Windows: Dark smoked glass */}
        <mesh position={[0, 0.55, 0]} material={materials.windowsSmokedGlass}>
          <cylinderGeometry args={[1.4, 1.4, 0.75, 32]} />
        </mesh>

        {/* Inner Building Core: Warm beige/stone */}
        <mesh position={[0, 0.55, 0]} material={materials.buildingStone}>
          <cylinderGeometry args={[0.7, 0.7, 0.7, 24]} />
        </mesh>

        {/* Roof: Dark graphite */}
        <mesh position={[0, 0.95, 0]} receiveShadow castShadow material={materials.roofGraphite}>
          <cylinderGeometry args={[2.0, 2.0, 0.08, 32]} />
        </mesh>

        {/* Roof Ring Trim: Subtle warm gold */}
        <mesh position={[0, 0.93, 0]} material={materials.accentsWarmGold}>
          <cylinderGeometry args={[2.04, 2.04, 0.02, 32]} />
        </mesh>

        {/* Outdoor Dining Terrace Tables: Large slabs / dark charcoal */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI) / 3;
          const x = Math.cos(angle) * 1.5;
          const z = Math.sin(angle) * 1.5;
          return (
            <mesh key={`tbl-${i}`} position={[x, 0.25, z]} castShadow material={materials.largeSlabs}>
              <cylinderGeometry args={[0.09, 0.09, 0.12, 12]} />
            </mesh>
          );
        })}

        <mesh position={[0, 1.2, 0]} material={materials.beaconActive}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 6. WELLNESS & THERMAL SPA SANCTUARY                          */}
      {/* ============================================================ */}
      <group 
        position={[-3.2, 0.35, -2.8]}
        onClick={(e) => { e.stopPropagation(); onSelectZone('wellness-spa'); }}
      >
        {/* Spa Plinth / Slab: Large slabs / dark charcoal */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow material={materials.largeSlabs}>
          <boxGeometry args={[3.2, 0.2, 2.6]} />
        </mesh>

        {/* Central Zen Reflecting Pool: Deep blue */}
        <mesh position={[0, 0.21, 0]} receiveShadow material={materials.poolDeepBlue}>
          <boxGeometry args={[1.2, 0.03, 1.2]} />
        </mesh>

        {/* Treatment Pavilion Buildings: Warm beige/stone */}
        {/* West Wing */}
        <mesh position={[-1.1, 0.45, 0]} receiveShadow castShadow material={materials.buildingStone}>
          <boxGeometry args={[0.8, 0.55, 2.2]} />
        </mesh>
        {/* East Wing */}
        <mesh position={[1.1, 0.45, 0]} receiveShadow castShadow material={materials.buildingStone}>
          <boxGeometry args={[0.8, 0.55, 2.2]} />
        </mesh>
        {/* North Pavilion */}
        <mesh position={[0, 0.45, -0.9]} receiveShadow castShadow material={materials.buildingStone}>
          <boxGeometry args={[1.4, 0.55, 0.6]} />
        </mesh>

        {/* Spa Roofs: Dark graphite */}
        <mesh position={[-1.1, 0.75, 0]} receiveShadow castShadow material={materials.roofGraphite}>
          <boxGeometry args={[0.9, 0.05, 2.3]} />
        </mesh>
        <mesh position={[1.1, 0.75, 0]} receiveShadow castShadow material={materials.roofGraphite}>
          <boxGeometry args={[0.9, 0.05, 2.3]} />
        </mesh>

        {/* Slatted Pergola across Central Courtyard: Subtle warm gold accents */}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((zOffset) => (
          <mesh key={`slat-${zOffset}`} position={[0, 0.75, zOffset]} castShadow material={materials.accentsWarmGold}>
            <boxGeometry args={[1.8, 0.03, 0.06]} />
          </mesh>
        ))}

        {/* Hydro Glow */}
        <mesh position={[0, 0.3, 0]} material={materials.interiorWarmGlow}>
          <sphereGeometry args={[0.25, 16, 16]} />
        </mesh>

        <mesh position={[0, 1.0, 0]} material={materials.beaconActive}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 7. NORTH ARRIVAL PIER & TRANSIT JETTY                        */}
      {/* ============================================================ */}
      <group 
        position={[3.4, -0.15, -3.2]}
        onClick={(e) => { e.stopPropagation(); onSelectZone('arrival-pier'); }}
      >
        {/* Pier Walkways: Pathways dark stone */}
        <mesh position={[0, 0, 0]} rotation={[0, 0.4, 0]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
          <boxGeometry args={[4.2, 0.1, 0.8]} />
        </mesh>

        {/* Pier Pilings: Dark graphite */}
        {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => (
          <mesh key={`pier-pile-${x}`} position={[x * 0.9, -0.3, -x * 0.4]} castShadow material={materials.roofGraphite}>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          </mesh>
        ))}

        {/* Arrival Terminal Pavilion Windows: Dark smoked glass */}
        <mesh position={[1.4, 0.3, -0.6]} material={materials.windowsSmokedGlass}>
          <boxGeometry args={[1.2, 0.45, 0.8]} />
        </mesh>
        {/* Roof: Dark graphite */}
        <mesh position={[1.4, 0.55, -0.6]} receiveShadow castShadow material={materials.roofGraphite}>
          <boxGeometry args={[1.5, 0.06, 1.0]} />
        </mesh>
        {/* Roof trim: Subtle warm gold */}
        <mesh position={[1.4, 0.53, -0.6]} material={materials.accentsWarmGold}>
          <boxGeometry args={[1.54, 0.02, 1.04]} />
        </mesh>

        {/* Docked Luxury Electric Tender: Large slabs / dark charcoal */}
        <mesh position={[-1.2, 0.06, 0.6]} rotation={[0, 0.4, 0]} castShadow material={materials.largeSlabs}>
          <boxGeometry args={[1.4, 0.16, 0.45]} />
        </mesh>

        <mesh position={[1.4, 0.8, -0.6]} material={materials.beaconActive}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 8. CONNECTING BRIDGES, WALKWAYS & ARCHITECTURAL ELEMENTS     */}
      {/* ============================================================ */}
      {/* Main Spine Walkway / Road: Pathways dark stone */}
      <mesh position={[0.1, 0.12, 0.4]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
        <boxGeometry args={[1.2, 0.05, 1.6]} />
      </mesh>

      {/* East Bridge: Pathways dark stone */}
      <mesh position={[2.0, 0.18, -0.1]} rotation={[0, -0.35, 0]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
        <boxGeometry args={[2.4, 0.06, 0.7]} />
      </mesh>

      {/* West Bridge: Pathways dark stone */}
      <mesh position={[-1.8, 0.28, -1.8]} rotation={[0, 0.55, 0]} receiveShadow castShadow material={materials.pathwaysDarkStone}>
        <boxGeometry args={[2.5, 0.06, 0.7]} />
      </mesh>

      {/* Cypress Columns / Trees: Foliage in dark green/charcoal, trunk in dark graphite */}
      {[
        [-1.6, 0.15, 0.8],
        [-2.0, 0.2, 0.5],
        [1.8, 0.2, 0.6],
        [2.2, 0.25, -0.6],
        [-1.4, 0.4, -2.4],
        [1.2, 0.35, -2.6],
        [0.4, 0.4, -2.8],
      ].map(([tx, ty, tz], i) => (
        <group key={`tree-${i}`} position={[tx, ty, tz]}>
          <mesh position={[0, 0.2, 0]} castShadow material={materials.roofGraphite}>
            <cylinderGeometry args={[0.02, 0.03, 0.4, 8]} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow material={materials.vegetation}>
            <coneGeometry args={[0.18, 0.65, 10]} />
          </mesh>
        </group>
      ))}

      {/* Ambient Pathway Ground Markers: Subtle warm gold / amber */}
      {[
        [-0.4, 0.14, 0.2],
        [0.6, 0.14, 0.2],
        [-0.4, 0.14, 0.8],
        [0.6, 0.14, 0.8],
        [1.2, 0.2, 0.1],
        [2.8, 0.18, 0.4],
      ].map(([lx, ly, lz], i) => (
        <mesh key={`pathlight-${i}`} position={[lx, ly, lz]} material={materials.accentsWarmGold}>
          <boxGeometry args={[0.04, 0.03, 0.04]} />
        </mesh>
      ))}
    </group>
  );
};

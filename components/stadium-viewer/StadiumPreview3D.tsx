'use client';

import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, Sky, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import type { StadiumConfig, EnvironmentBackground, LandscapeConfig } from '@/types/stadium';
import { DEFAULT_STADIUM_CONFIG, BACKGROUND_PRESETS, LANDSCAPE_STYLES } from '@/constants/stadium';
import { useStadiumStore } from '@/stores/stadiumStore';
import {
  RotateCcw,
  Box,
  Grid3x3,
  Info,
  Camera as CameraIcon,
  Building2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// CAMERA VIEW PRESETS
// =============================================================================
export type ViewerView =
  | 'perspective'
  | 'aerial'
  | 'top'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'pitch'
  | 'entry';

const CAMERA_VIEWS: Record<ViewerView, { pos: [number, number, number]; target: [number, number, number] }> = {
  perspective: { pos: [132, 82, 132], target: [0, 4, 0] },
  aerial: { pos: [158, 138, 158], target: [0, 0, 0] },
  top: { pos: [0, 205, 0.01], target: [0, 0, 0] },
  front: { pos: [0, 26, 198], target: [0, 12, 0] },
  back: { pos: [0, 26, -198], target: [0, 12, 0] },
  left: { pos: [-198, 26, 0], target: [0, 12, 0] },
  right: { pos: [198, 26, 0], target: [0, 12, 0] },
  pitch: { pos: [0, 6, 26], target: [0, 2, -20] },
  entry: { pos: [0, 12, 155], target: [0, 10, 66] },
};

// =============================================================================
// 0. SKY, ATMOSPHERE & STUDIO ENVIRONMENT
// =============================================================================
function GradientSkyDome({ top, horizon }: { top: string; horizon: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: new THREE.Color(top) },
          horizonColor: { value: new THREE.Color(horizon) },
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 horizonColor;
          varying vec3 vPos;
          void main() {
            float h = normalize(vPos).y;
            float m = pow(max(h, 0.0), 0.62);
            gl_FragColor = vec4(mix(horizonColor, topColor, m), 1.0);
          }
        `,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [top, horizon]
  );

  return (
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[460, 32, 20]} />
    </mesh>
  );
}

function AtmosphereFog({ color, near, far }: { color: string; near: number; far: number }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.fog = new THREE.Fog(color, near, far);
    return () => {
      scene.fog = null;
    };
  }, [scene, color, near, far]);
  return null;
}

/** Procedural image-based-lighting for premium reflections (no external assets). */
function StudioEnvironment({ warm }: { warm: boolean }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.environmentIntensity = 0.5;
  }, [scene]);
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={warm ? 2.2 : 1.6} color={warm ? '#ffe4c0' : '#dce8f5'} position={[0, 60, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[120, 120, 1]} />
      <Lightformer intensity={0.8} color={warm ? '#ff9d5c' : '#9db8d8'} position={[-40, 18, 30]} scale={[60, 30, 1]} />
      <Lightformer intensity={0.8} color={warm ? '#ffc98a' : '#b8cee8'} position={[40, 18, -30]} scale={[60, 30, 1]} />
      <Lightformer intensity={0.35} color="#7d8ba0" position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[120, 120, 1]} />
    </Environment>
  );
}

function DynamicEnvironmentSky({
  background = 'night',
  mini = false,
}: {
  background?: EnvironmentBackground;
  mini?: boolean;
}) {
  const isNight = background === 'night';
  const isSunset = background === 'sunset';
  const isDay = background === 'day';
  const isCyber = background === 'cyberpunk';
  const isDesert = background === 'desert';

  const preset = BACKGROUND_PRESETS.find((p) => p.value === background) ?? BACKGROUND_PRESETS[0];
  const warm = isSunset || isDesert;

  return (
    <group>
      {/* Sky backdrop: physically-inspired Sky for bright presets, gradient dome for night */}
      {(isDay || isSunset || isDesert) && (
        <Sky
          distance={4500}
          sunPosition={isDay ? [90, 70, 55] : isSunset ? [-190, 8, 120] : [170, 14, -110]}
          turbidity={isDay ? 5 : isSunset ? 9 : 11}
          rayleigh={isDay ? 1.1 : isSunset ? 3 : 2.4}
          mieCoefficient={0.006}
          mieDirectionalG={0.82}
        />
      )}
      {(isNight || isCyber) && (
        <GradientSkyDome top={preset.skyColor} horizon={preset.horizonColor} />
      )}

      <AtmosphereFog
        color={preset.horizonColor}
        near={isDay ? 260 : 190}
        far={isDay ? 620 : 470}
      />

      {/* Image-based lighting for reflections (skipped in mini mode) */}
      {!mini && <StudioEnvironment warm={warm} />}

      {/* Key light with tuned soft shadows */}
      <directionalLight
        position={isDay ? [70, 130, 60] : isSunset ? [-150, 30, 110] : [70, 105, 80]}
        intensity={isDay ? 2.6 : isSunset ? 2.4 : isCyber ? 1.4 : 1.6}
        color={isDay ? '#fdf6e8' : isSunset ? '#ffb066' : isCyber ? '#7fb4ff' : isDesert ? '#ffce8f' : '#dfe8f5'}
        castShadow={!mini}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-140}
        shadow-camera-right={140}
        shadow-camera-top={140}
        shadow-camera-bottom={-140}
        shadow-camera-near={10}
        shadow-camera-far={450}
        shadow-bias={-0.00035}
      />

      {/* Sky bounce fill */}
      <hemisphereLight
        args={[preset.skyColor, '#1a1812', isDay ? 0.85 : isSunset ? 0.5 : 0.35]}
      />

      {/* Cool counter-light for depth separation */}
      <directionalLight
        position={[-80, 70, -70]}
        intensity={isCyber ? 1.3 : 0.55}
        color={isCyber ? '#d946ef' : isSunset ? '#c084fc' : '#8fb3d9'}
      />

      {(isSunset || isDesert) && !mini && (
        <pointLight
          position={[isSunset ? -180 : 170, 22, isSunset ? 120 : -110]}
          intensity={300}
          distance={300}
          color={isSunset ? '#ff9d4d' : '#e8a04d'}
        />
      )}

      {/* Pitch floodlighting — a ring of lights under the roof opening (no shadows,
          so the pitch glows at night the way a lit stadium reads from outside) */}
      {!mini &&
        Array.from({ length: 4 }).map((_, i) => {
          const rad = (i * Math.PI * 2) / 4 + Math.PI / 4;
          return (
            <pointLight
              key={i}
              position={[Math.sin(rad) * 16, 23, Math.cos(rad) * 16]}
              intensity={isDay ? 0 : isCyber ? 1300 : 1400}
              distance={85}
              color={isCyber ? '#06b6d4' : '#fff3d6'}
            />
          );
        })}

      {!isDay && !mini && (
        <Stars
          radius={300}
          depth={50}
          count={isNight ? 3800 : isCyber ? 2600 : isDesert ? 2200 : 1400}
          factor={isCyber ? 5 : 3.6}
          fade
          speed={0.25}
        />
      )}
    </group>
  );
}

// =============================================================================
// VIEWER UTILITIES: WIREFRAME OVERRIDE, GRID HELPER, CAMERA RIG
// =============================================================================
function WireframeOverride({ active }: { active: boolean }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const mat = m as THREE.MeshStandardMaterial;
          if ('wireframe' in mat) mat.wireframe = active;
        });
      }
    });
  }, [active, scene]);
  return null;
}

function SceneGrid({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <Grid
      position={[0, 0.06, 0]}
      args={[440, 440]}
      cellSize={4}
      cellThickness={0.5}
      cellColor="#3a4150"
      sectionSize={20}
      sectionThickness={1}
      sectionColor="#5a6578"
      fadeDistance={480}
      fadeStrength={1.4}
      infiniteGrid
    />
  );
}

function CameraRig({ view }: { view: ViewerView }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as {
    target: THREE.Vector3;
    update: () => void;
  } | null;

  const goal = useMemo(() => {
    const v = CAMERA_VIEWS[view];
    return { pos: new THREE.Vector3(...v.pos), target: new THREE.Vector3(...v.target) };
  }, [view]);

  const animating = useRef(true);
  useEffect(() => {
    animating.current = true;
  }, [goal]);

  useFrame(() => {
    if (!animating.current || !controls) return;
    camera.position.lerp(goal.pos, 0.085);
    controls.target.lerp(goal.target, 0.085);
    controls.update();
    if (camera.position.distanceTo(goal.pos) < 0.6) animating.current = false;
  });

  return null;
}

// =============================================================================
// 1. DYNAMIC PROCEDURAL LANDSCAPE & SURROUNDING GROUND
// =============================================================================
function DynamicLandscapeGround({ landscape, background = 'night' }: { landscape?: LandscapeConfig; background?: EnvironmentBackground }) {
  const style = landscape?.landscapeStyle ?? 'olympic';
  const hasTrees = landscape?.hasTrees ?? true;
  const hasWater = landscape?.hasWaterFeatures ?? true;
  const hasLighting = landscape?.hasPlazaLighting ?? true;
  const hasAvenues = landscape?.hasPedestrianAvenues ?? true;

  // Preset-aware surface palette: night presets stay dark, bright presets read as daylight paving
  const bright = background === 'day' || background === 'desert';
  const dusk = background === 'sunset';
  const cyber = background === 'cyberpunk';
  const G = bright
    ? {
        base: style === 'desert' ? '#d3b98c' : style === 'park' ? '#85a364' : '#c8c1ab',
        plaza: ['#c1baa4', '#aca590', '#9e9782', '#8e8773'],
        avenue: '#a9a28c',
        lawn: '#647f45',
        parkRing: '#79a058',
        parkPath: '#b3ab95',
        waterOuter: '#aca48e',
        urban: '#b4ac96',
        fountain: '#8f887a',
        podium: '#c5bda7',
      }
    : dusk
      ? {
          base: style === 'desert' ? '#6b502c' : style === 'park' ? '#1d2f1e' : '#2b2620',
          plaza: ['#2a2320', '#332a24', '#2e2622', '#261f1c'],
          avenue: '#3d332a',
          lawn: '#243620',
          parkRing: '#28422a',
          parkPath: '#453b30',
          waterOuter: '#2e2823',
          urban: '#332c26',
          fountain: '#211c18',
          podium: '#2c251f',
        }
      : cyber
        ? {
            base: style === 'desert' ? '#4a3a22' : style === 'park' ? '#14211c' : '#0d0a18',
            plaza: ['#14102a', '#1a1438', '#120e26', '#0e0a1e'],
            avenue: '#1c1540',
            lawn: '#16302a',
            parkRing: '#1a2c3a',
            parkPath: '#241b4a',
            waterOuter: '#181236',
            urban: '#1a1436',
            fountain: '#120e28',
            podium: '#12101f',
          }
        : {
            base: style === 'desert' ? '#5c421f' : style === 'park' ? '#16281a' : '#0b0d13',
            plaza: ['#131720', '#1a2029', '#151a24', '#10141c'],
            avenue: '#20283a',
            lawn: '#1c2e1f',
            parkRing: '#1e3a26',
            parkPath: '#39404a',
            waterOuter: '#20242c',
            urban: '#20242e',
            fountain: '#171b24',
            podium: '#17191d',
          };

  const treeData = useMemo(() => {
    if (!hasTrees) return [];
    const list: { pos: [number, number, number]; scale: number; type: 'pine' | 'palm' }[] = [];
    const count = style === 'park' ? 72 : style === 'desert' ? 36 : 48;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = style === 'waterfront' ? 142 + (i % 3) * 12 : 104 + (i % 4) * 14;
      const x = Math.sin(angle) * r;
      const z = Math.cos(angle) * r;
      list.push({
        pos: [x, 0.4, z],
        scale: 0.8 + (i % 4) * 0.18,
        type: style === 'desert' ? 'palm' : 'pine',
      });
    }
    return list;
  }, [hasTrees, style]);

  const trunkMeshRef = useRef<THREE.InstancedMesh>(null);
  const canopyLowRef = useRef<THREE.InstancedMesh>(null);
  const canopyHighRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!trunkMeshRef.current || !canopyLowRef.current || !canopyHighRef.current || treeData.length === 0) return;
    const dummy = new THREE.Object3D();

    treeData.forEach((t, i) => {
      const isPalm = t.type === 'palm';
      // Trunk
      dummy.position.set(t.pos[0], t.pos[1] + (isPalm ? 2.4 : 1.4) * t.scale, t.pos[2]);
      dummy.scale.set(t.scale, t.scale * (isPalm ? 1.9 : 1.05), t.scale);
      dummy.rotation.set(isPalm ? 0.07 : 0, i * 0.7, 0);
      dummy.updateMatrix();
      trunkMeshRef.current?.setMatrixAt(i, dummy.matrix);

      // Lower canopy
      dummy.position.set(t.pos[0], t.pos[1] + (isPalm ? 4.4 : 2.6) * t.scale, t.pos[2]);
      dummy.scale.set(t.scale * (isPalm ? 1.7 : 1.15), t.scale * (isPalm ? 0.7 : 0.85), t.scale * (isPalm ? 1.7 : 1.15));
      dummy.updateMatrix();
      canopyLowRef.current?.setMatrixAt(i, dummy.matrix);

      // Upper canopy
      dummy.position.set(t.pos[0], t.pos[1] + (isPalm ? 5.6 : 3.9) * t.scale, t.pos[2]);
      dummy.scale.set(t.scale * (isPalm ? 1.35 : 0.8), t.scale * (isPalm ? 0.8 : 1.0), t.scale * (isPalm ? 1.35 : 0.8));
      dummy.updateMatrix();
      canopyHighRef.current?.setMatrixAt(i, dummy.matrix);
    });

    trunkMeshRef.current.instanceMatrix.needsUpdate = true;
    canopyLowRef.current.instanceMatrix.needsUpdate = true;
    canopyHighRef.current.instanceMatrix.needsUpdate = true;
  }, [treeData]);

  const waterMeshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (waterMeshRef.current && style === 'waterfront') {
      const t = clock.getElapsedTime();
      waterMeshRef.current.rotation.z = Math.sin(t * 0.4) * 0.02;
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      {/* Base Ground Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[460, 460]} />
        <meshStandardMaterial
          color={G.base}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Olympic Plaza */}
      {style === 'olympic' && (
        <group>
          {[
            { inner: 60, outer: 76, color: '#131720' },
            { inner: 76, outer: 98, color: '#1a2029' },
            { inner: 98, outer: 126, color: '#151a24' },
            { inner: 126, outer: 160, color: '#10141c' },
          ].map((ring, idx) => (
            <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15 + idx * 0.02, 0]} receiveShadow>
              <ringGeometry args={[ring.inner, ring.outer, 80]} />
              <meshStandardMaterial color={ring.color} roughness={0.88} metalness={0.12} side={THREE.DoubleSide} />
            </mesh>
          ))}

          {hasAvenues &&
            [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
              <group key={i} rotation={[0, rot, 0]}>
                <mesh position={[0, -0.08, 108]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[18, 75]} />
                  <meshStandardMaterial color="#20283a" roughness={0.72} metalness={0.2} />
                </mesh>
                {[-8.5, 8.5].map((lx, j) => (
                  <mesh key={j} position={[lx, -0.06, 108]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.35, 75]} />
                    <meshBasicMaterial color="#c9a25e" transparent opacity={0.75} />
                  </mesh>
                ))}
              </group>
            ))}

          {[
            { start: Math.PI * 0.1, end: Math.PI * 0.4 },
            { start: Math.PI * 0.6, end: Math.PI * 0.9 },
            { start: Math.PI * 1.1, end: Math.PI * 1.4 },
            { start: Math.PI * 1.6, end: Math.PI * 1.9 },
          ].map((s, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow>
              <ringGeometry args={[84, 118, 24, 1, s.start, s.end - s.start]} />
              <meshStandardMaterial color="#1c2e1f" roughness={0.92} metalness={0.04} />
            </mesh>
          ))}
        </group>
      )}

      {/* Botanical Park */}
      {style === 'park' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
            <ringGeometry args={[68, 175, 80]} />
            <meshStandardMaterial color="#1e3a26" roughness={0.9} metalness={0.03} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const rot = (i * Math.PI * 2) / 8;
            return (
              <mesh key={i} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, rot]}>
                <ringGeometry args={[75 + i * 10, 80 + i * 10, 64, 1, 0, Math.PI * 0.45]} />
                <meshStandardMaterial color="#39404a" roughness={0.8} side={THREE.DoubleSide} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Waterfront Lagoon */}
      {style === 'waterfront' && (
        <group>
          {hasWater && (
            <mesh ref={waterMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
              <ringGeometry args={[70, 155, 80]} />
              <meshStandardMaterial
                color="#0d4a63"
                roughness={0.06}
                metalness={0.9}
                transparent
                opacity={0.88}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
            <group key={i} rotation={[0, rot, 0]}>
              <mesh position={[0, 0.15, 112]} receiveShadow>
                <boxGeometry args={[14, 0.6, 85]} />
                <meshStandardMaterial color="#4a3520" roughness={0.7} metalness={0.15} />
              </mesh>
              {[-6.8, 6.8].map((rx, j) => (
                <mesh key={j} position={[rx, 0.7, 112]}>
                  <boxGeometry args={[0.3, 0.7, 85]} />
                  <meshStandardMaterial color="#c9a25e" emissive="#8a6a30" emissiveIntensity={0.5} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
            <ringGeometry args={[155, 190, 80]} />
            <meshStandardMaterial color="#20242c" roughness={0.82} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Urban Civic Esplanade */}
      {style === 'urban' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
            <ringGeometry args={[68, 160, 64]} />
            <meshStandardMaterial color="#20242e" roughness={0.72} metalness={0.22} side={THREE.DoubleSide} />
          </mesh>
          {hasWater &&
            Array.from({ length: 8 }).map((_, i) => {
              const rad = (i * Math.PI * 2) / 8 + Math.PI / 8;
              return (
                <group key={i} position={[Math.sin(rad) * 96, 0, Math.cos(rad) * 96]}>
                  <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[5, 5.5, 0.6, 24]} />
                    <meshStandardMaterial color="#171b24" roughness={0.55} />
                  </mesh>
                  <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[4.8, 24]} />
                    <meshStandardMaterial color="#9ec8dd" roughness={0.08} metalness={0.85} transparent opacity={0.85} />
                  </mesh>
                  <mesh position={[0, 2.5, 0]}>
                    <cylinderGeometry args={[0.3, 0.9, 4.5, 12]} />
                    <meshBasicMaterial color="#e8f1f8" transparent opacity={0.65} />
                  </mesh>
                </group>
              );
            })}
        </group>
      )}

      {/* Desert Oasis */}
      {style === 'desert' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
            <ringGeometry args={[68, 92, 64]} />
            <meshStandardMaterial color="#7a5c33" roughness={0.85} metalness={0.08} side={THREE.DoubleSide} />
          </mesh>
          {[
            { inner: 92, outer: 120, col: '#8d6d3e' },
            { inner: 120, outer: 155, col: '#a3824c' },
            { inner: 155, outer: 190, col: '#6f5430' },
          ].map((dune, idx) => (
            <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15 + idx * 0.04, 0]} receiveShadow>
              <ringGeometry args={[dune.inner, dune.outer, 64]} />
              <meshStandardMaterial color={dune.col} roughness={0.95} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* Stadium Podium Rim — open-ended wall (no solid cap!) + flat ring for the walkable top */}
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <cylinderGeometry args={[68, 70, 0.9, 72, 1, true]} />
        <meshStandardMaterial color="#17191d" roughness={0.6} metalness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.85, 0]} receiveShadow>
        <ringGeometry args={[68, 70, 72]} />
        <meshStandardMaterial color="#17191d" roughness={0.6} metalness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.88, 0]}>
        <ringGeometry args={[67.2, 68.2, 72]} />
        <meshBasicMaterial color={style === 'desert' ? '#c9a25e' : '#c9a25e'} side={THREE.DoubleSide} />
      </mesh>

      {/* Instanced Trees: trunk + two-layer canopy */}
      {hasTrees && treeData.length > 0 && (
        <group>
          <instancedMesh ref={trunkMeshRef} args={[new THREE.CylinderGeometry(0.14, 0.24, 2.8, 6), undefined, treeData.length]} castShadow>
            <meshStandardMaterial color={style === 'desert' ? '#4a3520' : '#33261a'} roughness={0.92} />
          </instancedMesh>
          <instancedMesh
            ref={canopyLowRef}
            args={[style === 'desert' ? new THREE.SphereGeometry(2.0, 8, 8) : new THREE.ConeGeometry(1.7, 3.6, 7), undefined, treeData.length]}
            castShadow
          >
            <meshStandardMaterial color={style === 'desert' ? '#2d5a33' : '#1e4428'} roughness={0.85} />
          </instancedMesh>
          <instancedMesh
            ref={canopyHighRef}
            args={[style === 'desert' ? new THREE.SphereGeometry(1.5, 8, 8) : new THREE.ConeGeometry(1.2, 3.0, 7), undefined, treeData.length]}
            castShadow
          >
            <meshStandardMaterial color={style === 'desert' ? '#3a6b40' : '#285732'} roughness={0.85} />
          </instancedMesh>
        </group>
      )}

      {/* Plaza Lighting Bollards */}
      {hasLighting &&
        Array.from({ length: 32 }).map((_, i) => {
          const rad = (i * Math.PI * 2) / 32;
          return (
            <group key={i} position={[Math.sin(rad) * 73, 0.4, Math.cos(rad) * 73]}>
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
                <meshStandardMaterial color="#3c4149" metalness={0.9} />
              </mesh>
              <mesh position={[0, 1.25, 0]}>
                <sphereGeometry args={[0.18, 12, 12]} />
                <meshBasicMaterial color="#ffdf9e" />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}

// =============================================================================
// 2. FOOTBALL PITCH & OLYMPIC ATHLETICS TRACK
// =============================================================================
function MasterPitchAndTrack({
  type = 'football',
  pitchDesign = 'modern',
  hasPlayerTunnel = true,
  hasScoreboard = true,
}: {
  type?: string;
  pitchDesign?: string;
  hasPlayerTunnel?: boolean;
  hasScoreboard?: boolean;
}) {
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#f5f7f5', linewidth: 2 }), []);

  const lines = useMemo(() => {
    const p = (coords: [number, number, number][]) => coords.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return [
      p([[-34, 1.09, -52.5], [34, 1.09, -52.5], [34, 1.09, 52.5], [-34, 1.09, 52.5], [-34, 1.09, -52.5]]),
      p([[-34, 1.09, 0], [34, 1.09, 0]]),
      p([[-20.16, 1.09, -52.5], [-20.16, 1.09, -36], [20.16, 1.09, -36], [20.16, 1.09, -52.5]]),
      p([[-20.16, 1.09, 52.5], [-20.16, 1.09, 36], [20.16, 1.09, 36], [20.16, 1.09, 52.5]]),
      p([[-9.16, 1.09, -52.5], [-9.16, 1.09, -47], [9.16, 1.09, -47], [9.16, 1.09, -52.5]]),
      p([[-9.16, 1.09, 52.5], [-9.16, 1.09, 47], [9.16, 1.09, 47], [9.16, 1.09, 52.5]]),
    ];
  }, []);

  const grassPrimary = pitchDesign === 'heated' ? '#2d6b34' : pitchDesign === 'classic' ? '#276030' : '#2a6a35';
  const grassSecondary = pitchDesign === 'heated' ? '#255c2c' : pitchDesign === 'classic' ? '#1e5228' : '#1f5a2b';

  // Scale the pitch/track ensemble so it fits inside the bowl:
  // pitch corners reach radius ≈ 62.6 while tier 1 starts at radius 44.
  const fitScale = type === 'olympic' ? 0.62 : 0.73;

  return (
    <group scale={fitScale}>
      {/* ── Olympic 400m Athletics Running Track (elliptical, around the pitch) ── */}
      {type === 'olympic' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.0, 0]} scale={[1, 1.42, 1]} receiveShadow>
            <ringGeometry args={[41, 51, 72]} />
            <meshStandardMaterial color="#8e3b2f" roughness={0.88} metalness={0.06} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const r = 42.2 + i * 1.22;
            return (
              <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.05, 0]} scale={[1, 1.42, 1]}>
                <ringGeometry args={[r - 0.08, r + 0.08, 72]} />
                <meshBasicMaterial color="#f5f2e8" transparent opacity={0.55} side={THREE.DoubleSide} />
              </mesh>
            );
          })}
          {/* Olympic Cauldron Tower */}
          <group position={[0, 1.0, -56]}>
            <mesh position={[0, 12, 0]}>
              <cylinderGeometry args={[0.6, 1.6, 24, 8]} />
              <meshStandardMaterial color="#e8e5dd" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 24.5, 0]}>
              <coneGeometry args={[3.2, 2.5, 16]} />
              <meshStandardMaterial color="#d9a24a" metalness={0.9} roughness={0.15} />
            </mesh>
            <pointLight position={[0, 26, 0]} intensity={350} distance={120} color="#ff8c3a" />
            <mesh position={[0, 26, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshBasicMaterial color="#ff8c3a" />
            </mesh>
          </group>
        </group>
      )}

      {/* Turf Stripes */}
      {Array.from({ length: 11 }).map((_, i) => {
        const z = -50 + i * 10;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.06, z]} receiveShadow>
            <planeGeometry args={[68, 10]} />
            <meshStandardMaterial
              color={i % 2 === 1 ? grassPrimary : grassSecondary}
              roughness={0.85}
              metalness={0.03}
            />
          </mesh>
        );
      })}

      {/* Pitch Safety Run-off */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.97, 0]} receiveShadow>
        <planeGeometry args={[84, 120]} />
        <meshStandardMaterial color="#12291a" roughness={0.92} />
      </mesh>

      {/* Field Lines */}
      {lines.map((pts, i) => (
        <primitive key={i} object={new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMaterial)} />
      ))}

      {/* Center Circle & Spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.09, 0]}>
        <ringGeometry args={[9.0, 9.25, 64]} />
        <meshBasicMaterial color="#f5f7f5" side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.09, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#f5f7f5" />
      </mesh>

      {/* Penalty spots */}
      {[-41.5, 41.5].map((z, i) => (
        <mesh key={`pspot-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.09, z]}>
          <circleGeometry args={[0.35, 20]} />
          <meshBasicMaterial color="#f5f7f5" />
        </mesh>
      ))}

      {/* Penalty arcs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.09, -41.5]}>
        <ringGeometry args={[8.95, 9.2, 32, 1, Math.PI * 7 / 6, Math.PI * 2 / 3]} />
        <meshBasicMaterial color="#f5f7f5" side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.09, 41.5]}>
        <ringGeometry args={[8.95, 9.2, 32, 1, Math.PI / 6, Math.PI * 2 / 3]} />
        <meshBasicMaterial color="#f5f7f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Corner arcs */}
      {[
        { x: -34, z: -52.5, start: Math.PI * 1.5 },
        { x: 34, z: -52.5, start: Math.PI },
        { x: 34, z: 52.5, start: Math.PI * 0.5 },
        { x: -34, z: 52.5, start: 0 },
      ].map((c, i) => (
        <mesh key={`carc-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[c.x, 1.09, c.z]}>
          <ringGeometry args={[0.8, 1.0, 16, 1, c.start, Math.PI / 2]} />
          <meshBasicMaterial color="#f5f7f5" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ── 3D Goals with Nets ── */}
      {[[-52.5, 0], [52.5, Math.PI]].map(([gz, rot], i) => (
        <group key={`goal-${i}`} position={[0, 1.0, gz]} rotation={[0, rot, 0]}>
          <mesh position={[0, 2.44, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 7.32, 16]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.2} metalness={0.8} />
          </mesh>
          {[-3.66, 3.66].map((gx, j) => (
            <mesh key={j} position={[gx, 1.22, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 2.44, 16]} />
              <meshStandardMaterial color="#f2f2f2" roughness={0.2} metalness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 0.05, -1.9]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 7.32, 10]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 1.22, -1.85]}>
            <planeGeometry args={[7.32, 2.44]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} wireframe />
          </mesh>
          <mesh position={[0, 2.42, -0.95]} rotation={[Math.PI / 2.6, 0, 0]}>
            <planeGeometry args={[7.32, 2.2]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.14} side={THREE.DoubleSide} wireframe />
          </mesh>
          {[-3.66, 3.66].map((gx, j) => (
            <mesh key={`side-${j}`} position={[gx, 1.22, -0.95]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[1.9, 2.44]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.12} side={THREE.DoubleSide} wireframe />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Corner Flags ── */}
      {[[-34, -52.5], [34, -52.5], [34, 52.5], [-34, 52.5]].map(([cx, cz], i) => (
        <group key={`flag-${i}`} position={[cx, 1.0, cz]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
            <meshStandardMaterial color="#e8e5dd" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.22, 1.32, 0]} rotation={[0, i * Math.PI / 2, 0]}>
            <planeGeometry args={[0.44, 0.3]} />
            <meshStandardMaterial color="#c9a25e" side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ── Animated Perimeter LED Ribbon ── */}
      <AnimatedLedRibbon />

      {/* ── North Stand Scoreboard Tower ── */}
      {hasScoreboard && (
        <group position={[0, 1.0, -59]}>
          <mesh position={[0, 6, -1.5]}>
            <cylinderGeometry args={[0.35, 0.55, 12, 10]} />
            <meshStandardMaterial color="#3c4149" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, 12.5, 0]}>
            <boxGeometry args={[16, 7, 1.2]} />
            <meshStandardMaterial color="#0a0c10" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 12.5, 0.65]}>
            <planeGeometry args={[15, 6.2]} />
            <meshStandardMaterial color="#0f1420" emissive="#8a1f1f" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 8.6, 0]}>
            <boxGeometry args={[17, 0.3, 2]} />
            <meshStandardMaterial color="#2c3138" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* ── Player Tunnel ── */}
      {hasPlayerTunnel && (
        <group position={[0, 1.0, -56.5]}>
          <mesh position={[0, 1.5, -1]}>
            <boxGeometry args={[6.5, 3, 3.6]} />
            <meshStandardMaterial color="#22262d" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.35, 0.85]}>
            <boxGeometry args={[5, 2.7, 0.3]} />
            <meshBasicMaterial color="#050608" />
          </mesh>
          <mesh position={[0, 3.1, 0.85]}>
            <boxGeometry args={[5.4, 0.25, 0.4]} />
            <meshStandardMaterial color="#e8e5dd" emissive="#c9a25e" emissiveIntensity={0.7} />
          </mesh>
        </group>
      )}

      {/* ── Dugouts ── */}
      {[-12, 12].map((dx, i) => (
        <group key={i} position={[dx, 1.0, -56]}>
          {[-4, -2, 0, 2, 4].map((sx, j) => (
            <mesh key={j} position={[sx, 0.55, 0.3]}>
              <boxGeometry args={[1.1, 0.5, 0.9]} />
              <meshStandardMaterial color={i === 0 ? '#8e3b2f' : '#25405c'} roughness={0.45} />
            </mesh>
          ))}
          <mesh position={[0, 2.3, 0.4]}>
            <boxGeometry args={[11, 0.15, 2.8]} />
            <meshStandardMaterial color="#cfe0ec" transparent opacity={0.32} roughness={0.05} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.4, 1.7]}>
            <boxGeometry args={[11, 1.8, 0.12]} />
            <meshStandardMaterial color="#cfe0ec" transparent opacity={0.28} roughness={0.05} metalness={0.6} />
          </mesh>
          {[-5.2, 0, 5.2].map((fx, j) => (
            <mesh key={j} position={[fx, 1.2, 1.6]}>
              <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
              <meshStandardMaterial color="#3c4149" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 2b. ANIMATED PERIMETER LED RIBBON
// =============================================================================
function AnimatedLedRibbon() {
  const matsRef = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    matsRef.current.forEach((m, i) => {
      if (m) {
        const phase = Math.sin(t * 0.8 + i * Math.PI / 2) * 0.5 + 0.5;
        m.emissive.setHSL(0.1 - phase * 0.04, 0.7, 0.32 + phase * 0.1);
      }
    });
  });

  return (
    <group position={[0, 1.0, 0]}>
      {[-37, 37].map((bx, i) => (
        <mesh key={i} position={[bx, 0.5, 0]}>
          <boxGeometry args={[0.5, 1.0, 110]} />
          <meshStandardMaterial
            ref={(m) => { matsRef.current[i] = m as THREE.MeshStandardMaterial | null; }}
            color="#1a1408"
            emissive="#8a6a30"
            emissiveIntensity={0.9}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

// =============================================================================
// 3. GRANDSTAND BOWL & INSTANCED SEATS
// =============================================================================
function RealisticGrandstands({
  type = 'football',
  tiers = 3,
  seatColor = '#6366f1',
  capacity = 65000,
  hasVip = true,
}: {
  type?: string;
  tiers: number;
  seatColor: string;
  capacity: number;
  hasVip: boolean;
}) {
  const actualTiers = Math.min(Math.max(tiers, 1), 4);
  const isOlympic = type === 'olympic';
  const isMulti = type === 'multi-purpose';
  const rOffset = isOlympic ? 10 : 0;

  const tierConfigs = useMemo(() => {
    return [
      { index: 0, innerR: 44 + rOffset, outerR: 53 + rOffset, yStart: 1.6, yEnd: 6.8, steps: 6 },
      { index: 1, innerR: 54 + rOffset, outerR: 62 + rOffset, yStart: 8.0, yEnd: 14.5, steps: 7 },
      { index: 2, innerR: 63 + rOffset, outerR: 70 + rOffset, yStart: 15.6, yEnd: 22.8, steps: 8 },
      { index: 3, innerR: 71 + rOffset, outerR: 77 + rOffset, yStart: 23.8, yEnd: 30.0, steps: 8 },
    ].slice(0, actualTiers);
  }, [actualTiers, rOffset]);

  const seatPositions = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number }[] = [];
    const capacityScalar = Math.min(Math.max(capacity / 65000, 0.7), 1.4);

    tierConfigs.forEach((tier) => {
      const stepCount = tier.steps;
      for (let s = 0; s < stepCount; s++) {
        const frac = s / stepCount;
        const radius = tier.innerR + frac * (tier.outerR - tier.innerR);
        const y = tier.yStart + frac * (tier.yEnd - tier.yStart);
        const count = Math.floor(((2 * Math.PI * radius) / 2.1) * capacityScalar);

        for (let c = 0; c < count; c++) {
          const angle = (c / count) * Math.PI * 2;
          const deg = (angle * 180) / Math.PI;
          if (deg % 30 < 2.4) continue;

          const scaleX = isMulti ? 1.0 : isOlympic ? 0.94 : 0.90;
          const scaleZ = isMulti ? 1.0 : isOlympic ? 1.18 : 1.15;

          const x = Math.sin(angle) * (radius * scaleX);
          const z = Math.cos(angle) * (radius * scaleZ);

          list.push({ pos: [x, y + 0.35, z], rotY: angle + Math.PI });
        }
      }
    });

    return list;
  }, [tierConfigs, capacity, isMulti, isOlympic]);

  const seatGeometry = useMemo(() => new THREE.BoxGeometry(0.75, 0.7, 0.65), []);
  const seatMeshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!seatMeshRef.current) return;
    const dummy = new THREE.Object3D();

    seatPositions.forEach((seat, i) => {
      dummy.position.set(seat.pos[0], seat.pos[1], seat.pos[2]);
      dummy.rotation.set(0, seat.rotY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      seatMeshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    seatMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [seatPositions]);

  return (
    <group>
      {tierConfigs.map((t, idx) => {
        const h = t.yEnd - t.yStart;
        const midY = t.yStart + h / 2;
        return (
          <group key={idx}>
            <mesh position={[0, midY, 0]} receiveShadow>
              <cylinderGeometry args={[t.outerR * 1.05, t.innerR * 0.98, h, 64, 1, true]} />
              <meshStandardMaterial color="#20242c" roughness={0.92} metalness={0.08} side={THREE.DoubleSide} />
            </mesh>

            {Array.from({ length: t.steps }).map((_, stepIdx) => {
              const frac = stepIdx / t.steps;
              const r = t.innerR + frac * (t.outerR - t.innerR);
              const y = t.yStart + frac * h;
              return (
                <mesh key={stepIdx} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
                  <ringGeometry args={[r - 0.4, r + 0.8, 64]} />
                  <meshStandardMaterial color="#15181e" roughness={0.95} />
                </mesh>
              );
            })}

            <mesh position={[0, t.yStart + 0.7, 0]}>
              <cylinderGeometry args={[t.innerR * 0.98, t.innerR * 0.98, 1.2, 64, 1, true]} />
              <meshStandardMaterial color="#c9a25e" transparent opacity={0.28} roughness={0.1} metalness={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}

      {hasVip && actualTiers >= 2 && (
        <group position={[0, 7.4, 0]}>
          <mesh>
            <cylinderGeometry args={[56 + rOffset, 54 + rOffset, 1.6, 64, 1, true]} />
            <meshStandardMaterial color="#c9a25e" emissive="#7a5c28" emissiveIntensity={0.5} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.9, 0]}>
            <cylinderGeometry args={[53.8 + rOffset, 53.8 + rOffset, 0.6, 64, 1, true]} />
            <meshStandardMaterial color="#8a6a30" emissive="#6a4e1e" emissiveIntensity={0.7} />
          </mesh>
        </group>
      )}

      <instancedMesh ref={seatMeshRef} args={[seatGeometry, undefined, seatPositions.length]} receiveShadow>
        <meshStandardMaterial color={seatColor} roughness={0.55} metalness={0.08} />
      </instancedMesh>
    </group>
  );
}

// =============================================================================
// 4. STADIUM ENTRANCES & VIP PORTALS
// =============================================================================
function VisibleStadiumEntrances({ config }: { config: StadiumConfig }) {
  const entranceStyle = config.entry?.mainEntrance ?? 'glass';
  const hasVip = config.entry?.hasVipEntrance ?? true;
  const hasParking = config.entry?.hasParking ?? true;

  return (
    <group>
      {/* ── South Grand Entrance ── */}
      <group position={[0, 0, 68]}>
        <group position={[0, 0.35, 6]}>
          {Array.from({ length: 6 }).map((_, step) => (
            <mesh key={step} position={[0, step * 0.22, -step * 1.4]} receiveShadow>
              <boxGeometry args={[32 - step * 1.5, 0.25, 2.2]} />
              <meshStandardMaterial color="#22262d" roughness={0.72} metalness={0.25} />
            </mesh>
          ))}
          <mesh position={[0, 0.6, -3.5]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[6, 0.1, 9]} />
            <meshStandardMaterial color="#15181e" roughness={0.85} />
          </mesh>
        </group>

        {/* 1. GLASS GRAND PAVILION */}
        {entranceStyle === 'glass' && (
          <group position={[0, 1.4, 0]}>
            <mesh position={[0, 7, 0]} castShadow>
              <boxGeometry args={[28, 14, 8]} />
              <meshStandardMaterial color="#9ec8dd" transparent opacity={0.5} roughness={0.05} metalness={0.9} />
            </mesh>
            <mesh position={[0, 8.5, 6]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[32, 0.6, 9]} />
              <meshStandardMaterial color="#31363e" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 11, 3.5]}>
              <boxGeometry args={[20, 1.8, 0.4]} />
              <meshStandardMaterial color="#15181e" emissive="#c9a25e" emissiveIntensity={0.8} />
            </mesh>
          </group>
        )}

        {/* 2. MONUMENTAL ARCH GATEWAY */}
        {entranceStyle === 'arch' && (
          <group position={[0, 1.4, 0]}>
            <mesh position={[0, 12, 0]} castShadow>
              <torusGeometry args={[13, 2.2, 16, 32, Math.PI]} />
              <meshStandardMaterial color="#e8e5dd" roughness={0.3} metalness={0.45} />
            </mesh>
            <mesh position={[0, 12, 0.2]}>
              <torusGeometry args={[11.8, 0.35, 16, 32, Math.PI]} />
              <meshBasicMaterial color="#c9a25e" />
            </mesh>
            {[-9, 9].map((px, i) => (
              <mesh key={i} position={[px, 6, 0]}>
                <boxGeometry args={[3.5, 12, 4]} />
                <meshStandardMaterial color="#22262d" metalness={0.7} />
              </mesh>
            ))}
          </group>
        )}

        {/* 3. TWIN ILLUMINATED PYLON TOWERS */}
        {entranceStyle === 'tower' && (
          <group position={[0, 1.4, 0]}>
            {[-15, 15].map((tx, i) => (
              <group key={i} position={[tx, 0, 0]}>
                <mesh position={[0, 20, 0]} castShadow>
                  <cylinderGeometry args={[0.8, 2.2, 40, 8]} />
                  <meshStandardMaterial color="#e8e5dd" metalness={0.85} roughness={0.25} />
                </mesh>
                <mesh position={[0, 20, 1.2]}>
                  <boxGeometry args={[0.3, 38, 0.2]} />
                  <meshBasicMaterial color="#c9a25e" />
                </mesh>
                <mesh position={[-tx * 0.4, 18, 0]} rotation={[0, 0, (tx > 0 ? -1 : 1) * Math.PI / 6]}>
                  <cylinderGeometry args={[0.08, 0.08, 28, 8]} />
                  <meshStandardMaterial color="#8a8f98" metalness={0.9} />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 12, 0]}>
              <boxGeometry args={[30, 2.4, 3.5]} />
              <meshStandardMaterial color="#15181e" emissive="#8a6a30" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}

        {/* 4. CLASSICAL MONUMENTAL PORTICO */}
        {entranceStyle === 'classic' && (
          <group position={[0, 1.4, 0]}>
            {[-12, -7.2, -2.4, 2.4, 7.2, 12].map((cx, i) => (
              <mesh key={i} position={[cx, 8, 2]} castShadow>
                <cylinderGeometry args={[1.1, 1.3, 16, 16]} />
                <meshStandardMaterial color="#d9c6a0" roughness={0.8} />
              </mesh>
            ))}
            <mesh position={[0, 18, 2]}>
              <coneGeometry args={[16, 5, 3]} />
              <meshStandardMaterial color="#bfa678" roughness={0.85} />
            </mesh>
          </group>
        )}
      </group>

      {/* ── West VIP Arrival Porte-Cochère ── */}
      {hasVip && (
        <group position={[-68, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 4.5, 3]} castShadow>
            <boxGeometry args={[16, 0.6, 10]} />
            <meshStandardMaterial color="#22262d" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.08, 8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 16]} />
            <meshStandardMaterial color="#6e1f1f" roughness={0.85} />
          </mesh>
          <mesh position={[0, 4.5, -4]}>
            <boxGeometry args={[6, 3.2, 8]} />
            <meshStandardMaterial color="#9ec8dd" transparent opacity={0.45} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* ── Parking Portal Ramps ── */}
      {hasParking && (
        <group position={[68, 0, 24]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, -0.6, 6]} rotation={[0.2, 0, 0]}>
            <planeGeometry args={[10, 14]} />
            <meshStandardMaterial color="#15181e" roughness={0.92} />
          </mesh>
          {[-5.2, 5.2].map((wx, i) => (
            <mesh key={i} position={[wx, 0.4, 6]}>
              <boxGeometry args={[0.4, 2.2, 14]} />
              <meshStandardMaterial color="#33383f" roughness={0.82} />
            </mesh>
          ))}
          <mesh position={[0, 2.0, 1]}>
            <boxGeometry args={[11, 1.0, 1]} />
            <meshStandardMaterial color="#15181e" emissive="#4a6748" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 5. SIGNATURE ARCHITECTURAL FACADE (reacts to material palette)
// =============================================================================
function ArchitecturalFacade({ config }: { config: StadiumConfig }) {
  const facade = config.facade;
  const isIndoor = config.type === 'indoor';
  const topR = 76;
  const botR = 64;
  const height = isIndoor ? 32 : 26;
  const centerY = height / 2;
  const { primaryColor, secondaryColor, accentColor } = config.materials;

  const diagridBeams = useMemo(() => {
    const beams: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [];
    const numStruts = 36;
    for (let i = 0; i < numStruts; i++) {
      const theta1 = (i / numStruts) * Math.PI * 2;
      const theta2 = ((i + 1.2) / numStruts) * Math.PI * 2;
      const theta3 = ((i - 1.2) / numStruts) * Math.PI * 2;

      const bx = Math.sin(theta1) * botR;
      const bz = Math.cos(theta1) * botR;
      const txCW = Math.sin(theta2) * topR;
      const tzCW = Math.cos(theta2) * topR;
      const txCCW = Math.sin(theta3) * topR;
      const tzCCW = Math.cos(theta3) * topR;

      const midCW = new THREE.Vector3((bx + txCW) / 2, centerY, (bz + tzCW) / 2);
      const midCCW = new THREE.Vector3((bx + txCCW) / 2, centerY, (bz + tzCCW) / 2);

      const dirCW = new THREE.Vector3(txCW - bx, height, tzCW - bz);
      const dirCCW = new THREE.Vector3(txCCW - bx, height, tzCCW - bz);

      beams.push({
        pos: [midCW.x, midCW.y, midCW.z],
        rot: [-Math.atan2(Math.sqrt(dirCW.x * dirCW.x + dirCW.z * dirCW.z), dirCW.y) + Math.PI / 2, Math.atan2(dirCW.x, dirCW.z), 0],
        len: dirCW.length(),
      });
      beams.push({
        pos: [midCCW.x, midCCW.y, midCCW.z],
        rot: [-Math.atan2(Math.sqrt(dirCCW.x * dirCCW.x + dirCCW.z * dirCCW.z), dirCCW.y) + Math.PI / 2, Math.atan2(dirCCW.x, dirCCW.z), 0],
        len: dirCCW.length(),
      });
    }
    return beams;
  }, [botR, topR, height, centerY]);

  return (
    <group>
      {/* Inner Concourse Drum — tinted by structure color */}
      <mesh position={[0, centerY, 0]}>
        <cylinderGeometry args={[topR - 2.5, botR - 2.5, height - 1.5, 64, 1, true]} />
        <meshStandardMaterial
          color="#1c1913"
          emissive={secondaryColor}
          emissiveIntensity={0.18}
          roughness={0.58}
          metalness={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[centerY - 6, centerY + 2, centerY + 8].map((yLevel, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, yLevel, 0]}>
          <ringGeometry args={[botR - 3, topR - 2, 64]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 1. Lattice Diagrid */}
      {facade === 'lattice' && (
        <group>
          {diagridBeams.map((beam, i) => (
            <mesh key={i} position={beam.pos} rotation={beam.rot} castShadow>
              <boxGeometry args={[1.1, beam.len, 1.4]} />
              <meshStandardMaterial color="#e8e5dd" roughness={0.3} metalness={0.35} />
            </mesh>
          ))}
          {[1.2, centerY, centerY + 12].map((yPos, i) => {
            const r = botR + ((topR - botR) * (yPos / height));
            return (
              <mesh key={i} position={[0, yPos, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[r - 0.7, r + 0.7, 72]} />
                <meshStandardMaterial color={primaryColor} roughness={0.25} metalness={0.5} side={THREE.DoubleSide} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 2. Fluted Slats */}
      {facade === 'slats' && (
        <group>
          {Array.from({ length: 64 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 64;
            return (
              <group key={i} position={[Math.sin(rad) * (botR + 1.2), centerY, Math.cos(rad) * (botR + 1.2)]} rotation={[0, -rad, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.5, height, 2.6]} />
                  <meshStandardMaterial color={i % 2 === 0 ? secondaryColor : accentColor} roughness={0.4} metalness={0.6} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* 3. Geometric Origami — driven by the material palette */}
      {facade === 'geometric' && (
        <group>
          {Array.from({ length: 28 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 28;
            return (
              <group key={i} position={[Math.sin(rad) * (botR + 2.5), centerY, Math.cos(rad) * (botR + 2.5)]} rotation={[0, -rad, 0]}>
                <mesh position={[0, 6, 0]} rotation={[0.2, 0, 0]} castShadow>
                  <coneGeometry args={[7, 13, 3]} />
                  <meshStandardMaterial color={secondaryColor} metalness={0.65} roughness={0.25} />
                </mesh>
                <mesh position={[0, -6, 0]} rotation={[-0.2, Math.PI, 0]} castShadow>
                  <coneGeometry args={[6.5, 13, 3]} />
                  <meshStandardMaterial color={primaryColor} metalness={0.6} roughness={0.3} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* 4. Perforated Kinetic Skin */}
      {facade === 'perforated' && (
        <group position={[0, centerY, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[topR, botR, height, 72, 8, true]} />
            <meshStandardMaterial color="#dfe4ea" metalness={0.75} roughness={0.22} wireframe side={THREE.DoubleSide} />
          </mesh>
          {[-8, -3, 2, 7, 12].map((yOff, i) => (
            <mesh key={i} position={[0, yOff, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[botR + 1.5, botR + 2.4, 72]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.55} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. Glazed Glass */}
      {facade === 'glass' && (
        <group position={[0, centerY, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[topR, botR, height, 64, 4, true]} />
            <meshStandardMaterial color={accentColor} transparent opacity={0.45} roughness={0.05} metalness={0.95} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 48 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 48;
            return (
              <mesh key={i} position={[Math.sin(rad) * (botR + 0.5), 0, Math.cos(rad) * (botR + 0.5)]} rotation={[0, -rad, 0]}>
                <boxGeometry args={[0.3, height, 0.6]} />
                <meshStandardMaterial color={secondaryColor} metalness={0.9} roughness={0.12} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 6. Spaceframe Steel */}
      {facade === 'steel' && (
        <group position={[0, centerY, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[topR, botR, height, 48, 6, true]} />
            <meshStandardMaterial color={secondaryColor} metalness={0.95} roughness={0.32} wireframe side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 24 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 24;
            return (
              <mesh key={i} position={[Math.sin(rad) * (botR + 1.5), 0, Math.cos(rad) * (botR + 1.5)]} castShadow>
                <cylinderGeometry args={[0.6, 0.8, height, 12]} />
                <meshStandardMaterial color={primaryColor} metalness={0.9} roughness={0.25} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 7. Travertine Stone Colonnade */}
      {facade === 'traditional' && (
        <group position={[0, centerY, 0]}>
          {Array.from({ length: 32 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 32;
            return (
              <mesh key={i} position={[Math.sin(rad) * (botR + 1.8), 0, Math.cos(rad) * (botR + 1.8)]} rotation={[0, -rad, 0]} castShadow>
                <cylinderGeometry args={[1.2, 1.4, height, 16]} />
                <meshStandardMaterial color="#d9c6a0" roughness={0.82} metalness={0.1} />
              </mesh>
            );
          })}
          <mesh position={[0, centerY - 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[topR - 1.0, topR + 2.5, 64]} />
            <meshStandardMaterial color="#bfa678" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      <mesh position={[0, centerY + height / 2 + 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[topR - 1.5, topR + 2.2, 72]} />
        <meshStandardMaterial color="#15181e" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// =============================================================================
// 6. MASTER ROOF & DOME ENCLOSURE
// =============================================================================
function MasterRoofCanopy({ config }: { config: StadiumConfig }) {
  const roof = config.roof;
  const isIndoor = config.type === 'indoor';
  const secColor = config.materials.secondaryColor;
  const roofY = isIndoor ? 33 : 27;

  if (isIndoor) {
    return (
      <group position={[0, 16, 0]}>
        <mesh>
          <sphereGeometry args={[82, 64, 48, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial
            color="#9ec8dd"
            metalness={0.85}
            roughness={0.12}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[82.4, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial color="#e8e5dd" metalness={0.9} roughness={0.22} wireframe />
        </mesh>
        <mesh position={[0, 81.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[18, 32]} />
          <meshBasicMaterial color="#dcebf5" />
        </mesh>
      </group>
    );
  }

  if (roof === 'open') {
    return (
      <group position={[0, roofY, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[62, 78, 64]} />
          <meshStandardMaterial color="#2c3138" metalness={0.9} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, roofY, 0]}>
      {/* Outer Sweeping Canopy (translucent-ish: does not cast a full shadow) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <ringGeometry args={[46, 78, 72]} />
        <meshStandardMaterial color="#e8e5dd" roughness={0.35} metalness={0.28} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[78.2, 76.5, 1.2, 72, 1, true]} />
        <meshStandardMaterial color="#d5d2c8" metalness={0.5} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Radial Cantilever Trusses — structure color */}
      {Array.from({ length: 24 }).map((_, i) => {
        const rad = (i * Math.PI * 2) / 24;
        return (
          <mesh
            key={i}
            position={[Math.sin(rad) * 62, 1.2, Math.cos(rad) * 62]}
            rotation={[0, -rad + Math.PI / 2, Math.PI / 16]}
            castShadow
          >
            <boxGeometry args={[30, 0.8, 0.8]} />
            <meshStandardMaterial color={secColor} metalness={0.85} roughness={0.25} />
          </mesh>
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[44.8, 46.2, 72]} />
        <meshBasicMaterial color="#c9a25e" side={THREE.DoubleSide} />
      </mesh>

      {/* Retractable Sliding Petal Panels */}
      {roof === 'retractable' && (
        <group>
          {[-20, 0, 20].map((gx, i) => (
            <mesh key={i} position={[gx, 2.2, 0]}>
              <boxGeometry args={[0.8, 1.2, 88]} />
              <meshStandardMaterial color={secColor} metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
            <ringGeometry args={[20, 46, 64]} />
            <meshStandardMaterial
              color={secColor}
              transparent
              opacity={0.28}
              roughness={0.15}
              metalness={0.6}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.4, 0]}>
            <ringGeometry args={[19.4, 20.4, 64]} />
            <meshBasicMaterial color="#c9a25e" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Translucent ETFE Cushions */}
      {roof === 'transparent' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
          <ringGeometry args={[26, 46, 64]} />
          <meshStandardMaterial
            color="#cfe4f2"
            transparent
            opacity={0.32}
            roughness={0.08}
            metalness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Geodesic Dome */}
      {roof === 'dome' && (
        <group>
          <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[78, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2.8]} />
            <meshStandardMaterial
              color="#9ec8dd"
              metalness={0.85}
              roughness={0.16}
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <sphereGeometry args={[78.2, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2.8]} />
            <meshStandardMaterial color="#e8e5dd" metalness={0.9} roughness={0.22} wireframe />
          </mesh>
        </group>
      )}

      {/* Fixed Halo Canopy with lighting pods */}
      {roof === 'fixed' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.6, 0]} castShadow>
            <ringGeometry args={[30, 46, 64]} />
            <meshStandardMaterial color="#22262d" metalness={0.8} roughness={0.32} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 16 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 16;
            return (
              <mesh key={i} position={[Math.sin(rad) * 38, -0.2, Math.cos(rad) * 38]}>
                <boxGeometry args={[1.6, 0.4, 2.8]} />
                <meshBasicMaterial color="#fff3d6" />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 7. CORNER FLOODLIGHT TOWERS (lattice masts)
// =============================================================================
function FloodlightTowers({ background }: { background: EnvironmentBackground }) {
  const isDay = background === 'day';
  // Off the default 45° camera diagonal so the masts never block the hero sightline
  const positions: [number, number, number][] = [
    [84, 0.4, 22],
    [22, 0.4, 84],
    [-84, 0.4, -22],
    [-22, 0.4, -84],
  ];

  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p} rotation={[0, Math.atan2(-p[0], -p[2]), 0]}>
          <mesh position={[0, 14, 0]}>
            <cylinderGeometry args={[0.45, 0.95, 28, 10]} />
            <meshStandardMaterial color="#565c66" metalness={0.9} roughness={0.32} />
          </mesh>
          {[5, 11, 17, 23].map((y, j) => (
            <mesh key={j} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[(0.95 - (y / 28) * 0.42) * 1.15, 0.07, 8, 20]} />
              <meshStandardMaterial color="#8a8f98" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
          <group position={[0, 29, 0]} rotation={[0.5, 0, 0]}>
            <mesh>
              <boxGeometry args={[6.5, 3.6, 0.7]} />
              <meshStandardMaterial color="#2c3138" metalness={0.85} roughness={0.3} />
            </mesh>
            {Array.from({ length: 8 }).map((_, l) => (
              <mesh key={l} position={[-2.4 + (l % 4) * 1.6, l < 4 ? 0.85 : -0.85, 0.42]}>
                <boxGeometry args={[1.1, 1.1, 0.25]} />
                <meshBasicMaterial color={isDay ? '#b8bdc4' : '#fff3d6'} />
              </mesh>
            ))}
          </group>
          <pointLight position={[0, 26, 3]} intensity={isDay ? 25 : 120} distance={60} color="#fff3d6" />
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 8. JUMBOTRONS, SOLAR, KIOSKS & FLAG AVENUE
// =============================================================================
function StadiumAddons({ config }: { config: StadiumConfig }) {
  const hasFanZone = config.addons.hasFanZone;
  const hasFoodCourts = config.addons.hasFoodCourts;
  const accent = config.materials.accentColor;

  return (
    <group>
      {config.addons.hasLedScreens && (
        <group>
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <group
                key={i}
                position={[Math.sin(rad) * 44, 18, Math.cos(rad) * 44]}
                rotation={[0, rad + Math.PI, 0]}
              >
                <mesh castShadow>
                  <boxGeometry args={[16, 8.5, 0.8]} />
                  <meshStandardMaterial color="#0a0c10" roughness={0.22} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0.45]}>
                  <planeGeometry args={[15.2, 7.8]} />
                  <meshStandardMaterial color="#101820" emissive={accent} emissiveIntensity={0.7} />
                </mesh>
                {[-6, 6].map((cx, j) => (
                  <mesh key={j} position={[cx, 5.6, 0]} rotation={[0, 0, cx > 0 ? -0.35 : 0.35]}>
                    <cylinderGeometry args={[0.04, 0.04, 6, 6]} />
                    <meshStandardMaterial color="#8a8f98" metalness={0.9} />
                  </mesh>
                ))}
              </group>
            );
          })}
        </group>
      )}

      {/* Photovoltaic solar arrays */}
      {config.addons.hasSolarPanels && (
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 27.6, 0]}>
          {Array.from({ length: 4 }).map((_, ring) => (
            <mesh key={ring}>
              <ringGeometry args={[54 + ring * 5.5, 58 + ring * 5.5, 48]} />
              <meshStandardMaterial color="#14181f" metalness={0.95} roughness={0.18} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* Fan plaza & food kiosks */}
      {(hasFanZone || hasFoodCourts) && (
        <group>
          {Array.from({ length: 10 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 10 + Math.PI / 10;
            const r = hasFanZone ? 88 : 84;
            const isFood = hasFoodCourts && i % 2 === 0;
            return (
              <group
                key={i}
                position={[Math.sin(rad) * r, 0.4, Math.cos(rad) * r]}
                rotation={[0, -rad + Math.PI, 0]}
              >
                <mesh position={[0, 1.4, 0]} castShadow>
                  <boxGeometry args={[4.2, 2.6, 2.4]} />
                  <meshStandardMaterial color={isFood ? '#5c3218' : '#22262d'} roughness={0.62} metalness={0.2} />
                </mesh>
                <mesh position={[0, 1.0, 1.45]}>
                  <boxGeometry args={[4.2, 0.25, 0.8]} />
                  <meshStandardMaterial color="#d5d2c8" roughness={0.5} />
                </mesh>
                <mesh position={[0, 3.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                  <coneGeometry args={[3.2, 1.4, 4]} />
                  <meshStandardMaterial color={isFood ? '#8a5a24' : '#2c3138'} roughness={0.58} />
                </mesh>
                <pointLight position={[0, 2.4, 1.4]} intensity={9} distance={14} color="#ffdf9e" />
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}

function PlazaFlagRow() {
  const flagsRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    flagsRef.current.forEach((f, i) => {
      if (f) f.rotation.y = Math.sin(t * 1.6 + i * 0.7) * 0.28;
    });
  });

  return (
    <group>
      {[-1, 1].map((side) =>
        Array.from({ length: 5 }).map((_, i) => {
          const z = 76 + i * 7;
          return (
            <group key={`${side}-${i}`} position={[side * 11, 0.4, z]}>
              <mesh position={[0, 5, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.1, 10, 8]} />
                <meshStandardMaterial color="#d5d2c8" metalness={0.85} roughness={0.28} />
              </mesh>
              <mesh position={[0, 10, 0]}>
                <sphereGeometry args={[0.12, 10, 10]} />
                <meshStandardMaterial color="#c9a25e" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh
                ref={(m) => { flagsRef.current[i * 2 + (side === 1 ? 0 : 1)] = m as THREE.Mesh | null; }}
                position={[0.75, 9.1, 0]}
              >
                <planeGeometry args={[1.5, 1.0]} />
                <meshStandardMaterial color="#8a5a24" side={THREE.DoubleSide} roughness={0.8} />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}

// =============================================================================
// 9. MASTER ASSEMBLED STADIUM
// =============================================================================
function MasterStadiumModel({ config, mini = false }: { config: StadiumConfig; mini?: boolean }) {
  const landscape = config.landscape ?? DEFAULT_STADIUM_CONFIG.landscape;
  const background = landscape?.background ?? 'night';

  return (
    <group>
      <DynamicLandscapeGround landscape={landscape} />
      <MasterPitchAndTrack
        type={config.type}
        pitchDesign={config.interior.pitchDesign}
        hasPlayerTunnel={config.interior.hasPlayerTunnel}
        hasScoreboard={config.interior.hasScoreboard}
      />
      <RealisticGrandstands
        type={config.type}
        tiers={config.seating.tiers}
        seatColor={config.seating.primaryColor}
        capacity={config.seating.capacity}
        hasVip={config.seating.hasVip}
      />
      <ArchitecturalFacade config={config} />
      <MasterRoofCanopy config={config} />
      <VisibleStadiumEntrances config={config} />
      {!mini && <FloodlightTowers background={background} />}
      <StadiumAddons config={config} />
      <PlazaFlagRow />
    </group>
  );
}

/** Rotates only the stadium model on a slow turntable — sky and lighting stay fixed. */
function TurntableGroup({ active, children }: { active: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (active && ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

// =============================================================================
// 10. EXPORTED STADIUM 3D PREVIEW + PROFESSIONAL VIEWER UI
// =============================================================================
interface Props {
  config?: StadiumConfig;
  interactive?: boolean;
  autoRotate?: boolean;
  className?: string;
  presetCamera?: ViewerView;
  showQuickControls?: boolean;
  /** 'mini' renders a lightweight version (no shadows, 1x dpr) for multi-canvas pages. */
  quality?: 'full' | 'mini';
}

const VIEW_BUTTONS: Array<{ id: ViewerView; label: string }> = [
  { id: 'perspective', label: '3D' },
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'top', label: 'Top' },
  { id: 'aerial', label: 'Aerial' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'entry', label: 'Entry' },
];

export function StadiumPreview3D({
  config: configProp,
  interactive = false,
  autoRotate = false,
  className,
  presetCamera = 'perspective',
  showQuickControls = true,
  quality = 'full',
}: Props) {
  const storeConfig = useStadiumStore((s) => s.config);
  const updateLandscape = useStadiumStore((s) => s.updateLandscape);
  const activeConfig = configProp ?? storeConfig ?? DEFAULT_STADIUM_CONFIG;

  const currentBg = activeConfig.landscape?.background ?? 'night';
  const currentLandscape = activeConfig.landscape?.landscapeStyle ?? 'olympic';

  const [view, setView] = useState<ViewerView>(presetCamera);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const isMini = quality === 'mini';

  return (
    <div className={`relative w-full h-full select-none ${className ?? ''}`}>
      <Canvas
        shadows={!isMini}
        dpr={isMini ? 1 : [1, 2]}
        camera={{ position: CAMERA_VIEWS[presetCamera].pos, fov: 42, near: 1, far: 1600 }}
        gl={{
          antialias: !isMini,
          alpha: true,
          powerPreference: isMini ? 'low-power' : 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <DynamicEnvironmentSky background={currentBg} mini={isMini} />

          <TurntableGroup active={!interactive && autoRotate}>
            <MasterStadiumModel config={activeConfig} mini={isMini} />
          </TurntableGroup>

          <SceneGrid visible={showGrid} />
          <WireframeOverride active={wireframe} />
          <CameraRig view={view} />

          {interactive && (
            <OrbitControls
              makeDefault
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={22}
              maxDistance={260}
              maxPolarAngle={Math.PI / 2.04}
              autoRotate={autoRotate}
              autoRotateSpeed={0.55}
              dampingFactor={0.07}
            />
          )}
        </Suspense>
      </Canvas>

      {/* ── Viewer overlay chrome ── */}
      {showQuickControls && (
        <div className="absolute top-3 right-4 z-20 flex flex-col gap-1.5 items-end max-w-[calc(100%-2rem)] pointer-events-auto">
          {/* Sky */}
          <div className="flex items-center gap-0.5 p-1 vp-chip overflow-x-auto">
            <span className="text-[9px] font-mono uppercase tracking-widest text-chip/40 px-2 shrink-0">Sky</span>
            {BACKGROUND_PRESETS.map((preset) => {
              const isActive = currentBg === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => updateLandscape({ background: preset.value })}
                  title={`${preset.label}: ${preset.description}`}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono transition-colors shrink-0',
                    isActive ? 'bg-brass text-chip-ink' : 'text-chip/55 hover:text-chip hover:bg-white/[0.07]'
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/25 shrink-0"
                    style={{ background: `linear-gradient(135deg, ${preset.skyColor}, ${preset.horizonColor})` }}
                  />
                  <span className="capitalize hidden sm:inline">{preset.value}</span>
                </button>
              );
            })}
          </div>

          {/* Plaza */}
          <div className="flex items-center gap-0.5 p-1 vp-chip overflow-x-auto">
            <span className="text-[9px] font-mono uppercase tracking-widest text-chip/40 px-2 shrink-0">Plaza</span>
            {LANDSCAPE_STYLES.map((land) => {
              const isActive = currentLandscape === land.value;
              return (
                <button
                  key={land.value}
                  onClick={() => updateLandscape({ landscapeStyle: land.value })}
                  title={`${land.label}: ${land.description}`}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono transition-colors shrink-0',
                    isActive ? 'bg-chip text-chip-ink font-medium' : 'text-chip/55 hover:text-chip hover:bg-white/[0.07]'
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/25 shrink-0"
                    style={{ backgroundColor: land.accent }}
                  />
                  <span className="capitalize hidden sm:inline">{land.value}</span>
                </button>
              );
            })}
          </div>

          {/* Camera views */}
          <div className="flex items-center gap-0.5 p-1 vp-chip overflow-x-auto">
            <span className="text-[9px] font-mono uppercase tracking-widest text-chip/40 px-2 shrink-0">View</span>
            {VIEW_BUTTONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  'px-2 py-1 text-[10px] font-mono uppercase tracking-wide transition-colors shrink-0',
                  view === v.id ? 'bg-chip text-chip-ink font-medium' : 'text-chip/55 hover:text-chip hover:bg-white/[0.07]'
                )}
              >
                {v.label}
              </button>
            ))}
            <button
              onClick={() => setView('perspective')}
              title="Reset camera"
              className="px-1.5 py-1 text-chip/55 hover:text-chip hover:bg-white/[0.07] transition-colors shrink-0"
            >
              <RotateCcw size={11} />
            </button>
          </div>

          {/* Display toggles */}
          <div className="flex items-center gap-0.5 p-1 vp-chip">
            {[
              { active: wireframe, toggle: () => setWireframe((w) => !w), icon: Box, title: 'Wireframe mode' },
              { active: showGrid, toggle: () => setShowGrid((g) => !g), icon: Grid3x3, title: 'Grid helper' },
              { active: showInfo, toggle: () => setShowInfo((i) => !i), icon: Info, title: 'Model information' },
            ].map(({ active, toggle, icon: Icon, title }) => (
              <button
                key={title}
                onClick={toggle}
                title={title}
                className={cn(
                  'p-1.5 transition-colors',
                  active ? 'bg-brass text-chip-ink' : 'text-chip/55 hover:text-chip hover:bg-white/[0.07]'
                )}
              >
                <Icon size={12} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Model information panel */}
      {showQuickControls && showInfo && (
        <div className="absolute bottom-3 left-4 z-20 vp-chip px-4 py-3 pointer-events-auto max-w-[240px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <Eye size={12} className="text-brass shrink-0" />
            <span className="text-[11px] font-medium text-chip/90 truncate">{activeConfig.name}</span>
          </div>
          <dl className="space-y-1 text-[10px] font-mono">
            {[
              ['Type', activeConfig.type.replace('-', ' ')],
              ['Facade', activeConfig.facade],
              ['Roof', activeConfig.roof],
              ['Capacity', `${activeConfig.seating.capacity.toLocaleString()} seats`],
              ['Tiers', String(activeConfig.seating.tiers)],
              ['Est. diameter', '≈ 152 m'],
              ['Est. height', activeConfig.type === 'indoor' ? '≈ 33 m' : '≈ 27 m'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-chip/45 uppercase tracking-wider">{k}</dt>
                <dd className="text-chip/85 capitalize text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[9px] font-mono text-chip/40">
            <CameraIcon size={10} />
            <span>Procedural WebGL model · scale 1:500</span>
            <Building2 size={10} className="ml-auto" />
          </div>
        </div>
      )}
    </div>
  );
}

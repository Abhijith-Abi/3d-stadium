'use client';

import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { StadiumConfig, EnvironmentBackground, LandscapeStyle, LandscapeConfig } from '@/types/stadium';
import { DEFAULT_STADIUM_CONFIG, BACKGROUND_PRESETS, LANDSCAPE_STYLES } from '@/constants/stadium';
import { useStadiumStore } from '@/stores/stadiumStore';
import { Landmark, Camera, Building2, RotateCw, Maximize2 } from 'lucide-react';

// =============================================================================
// 1. DYNAMIC PROCEDURAL LANDSCAPE & SURROUNDING GROUND
// =============================================================================
function DynamicLandscapeGround({ landscape }: { landscape?: LandscapeConfig }) {
  const style = landscape?.landscapeStyle ?? 'olympic';
  const hasTrees = landscape?.hasTrees ?? true;
  const hasWater = landscape?.hasWaterFeatures ?? true;
  const hasLighting = landscape?.hasPlazaLighting ?? true;
  const hasAvenues = landscape?.hasPedestrianAvenues ?? true;

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

  const foliageMeshRef = useRef<THREE.InstancedMesh>(null);
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!foliageMeshRef.current || !trunkMeshRef.current || treeData.length === 0) return;
    const dummy = new THREE.Object3D();

    treeData.forEach((t, i) => {
      dummy.position.set(t.pos[0], t.pos[1] + (t.type === 'palm' ? 2.2 : 1.2) * t.scale, t.pos[2]);
      dummy.scale.set(t.scale, t.scale * (t.type === 'palm' ? 1.8 : 1.0), t.scale);
      dummy.rotation.set(t.type === 'palm' ? 0.08 : 0, 0, 0);
      dummy.updateMatrix();
      trunkMeshRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + (t.type === 'palm' ? 4.2 : 3.0) * t.scale, t.pos[2]);
      dummy.scale.set(t.scale * (t.type === 'palm' ? 1.6 : 1.0), t.scale * (t.type === 'palm' ? 0.6 : 1.4), t.scale * (t.type === 'palm' ? 1.6 : 1.0));
      dummy.updateMatrix();
      foliageMeshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    trunkMeshRef.current.instanceMatrix.needsUpdate = true;
    foliageMeshRef.current.instanceMatrix.needsUpdate = true;
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
        <planeGeometry args={[440, 440]} />
        <meshStandardMaterial
          color={style === 'desert' ? '#78350f' : style === 'park' ? '#0f381e' : '#050811'}
          roughness={0.95}
          metalness={0.08}
        />
      </mesh>

      {/* Olympic Plaza */}
      {style === 'olympic' && (
        <group>
          {[
            { inner: 60, outer: 76, color: '#0d131f' },
            { inner: 76, outer: 98, color: '#131b2c' },
            { inner: 98, outer: 126, color: '#0f1728' },
            { inner: 126, outer: 160, color: '#0a0f1d' },
          ].map((ring, idx) => (
            <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15 + idx * 0.02, 0]} receiveShadow>
              <ringGeometry args={[ring.inner, ring.outer, 80]} />
              <meshStandardMaterial color={ring.color} roughness={0.85} metalness={0.2} side={THREE.DoubleSide} />
            </mesh>
          ))}

          {hasAvenues &&
            [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
              <group key={i} rotation={[0, rot, 0]}>
                <mesh position={[0, -0.08, 108]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[18, 75]} />
                  <meshStandardMaterial color="#1a233a" roughness={0.7} metalness={0.3} />
                </mesh>
                {[-8.5, 8.5].map((lx, j) => (
                  <mesh key={j} position={[lx, -0.06, 108]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.35, 75]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
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
              <meshStandardMaterial color="#0d3320" roughness={0.9} metalness={0.05} />
            </mesh>
          ))}
        </group>
      )}

      {/* Botanical Park */}
      {style === 'park' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
            <ringGeometry args={[68, 175, 80]} />
            <meshStandardMaterial color="#14532d" roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const rot = (i * Math.PI * 2) / 8;
            return (
              <mesh key={i} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, rot]}>
                <ringGeometry args={[75 + i * 10, 80 + i * 10, 64, 1, 0, Math.PI * 0.45]} />
                <meshStandardMaterial color="#334155" roughness={0.75} side={THREE.DoubleSide} />
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
                color="#0284c7"
                roughness={0.08}
                metalness={0.85}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
            <group key={i} rotation={[0, rot, 0]}>
              <mesh position={[0, 0.15, 112]} receiveShadow>
                <boxGeometry args={[14, 0.6, 85]} />
                <meshStandardMaterial color="#78350f" roughness={0.65} metalness={0.2} />
              </mesh>
              {[-6.8, 6.8].map((rx, j) => (
                <mesh key={j} position={[rx, 0.7, 112]}>
                  <boxGeometry args={[0.3, 0.7, 85]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
            <ringGeometry args={[155, 190, 80]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Urban Civic Esplanade */}
      {style === 'urban' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
            <ringGeometry args={[68, 160, 64]} />
            <meshStandardMaterial color="#181e2b" roughness={0.7} metalness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {hasWater &&
            Array.from({ length: 8 }).map((_, i) => {
              const rad = (i * Math.PI * 2) / 8 + Math.PI / 8;
              return (
                <group key={i} position={[Math.sin(rad) * 96, 0, Math.cos(rad) * 96]}>
                  <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[5, 5.5, 0.6, 24]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.5} />
                  </mesh>
                  <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[4.8, 24]} />
                    <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
                  </mesh>
                  <mesh position={[0, 2.5, 0]}>
                    <cylinderGeometry args={[0.3, 0.9, 4.5, 12]} />
                    <meshBasicMaterial color="#bae6fd" transparent opacity={0.7} />
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
            <meshStandardMaterial color="#9a3412" roughness={0.8} metalness={0.15} side={THREE.DoubleSide} />
          </mesh>
          {[
            { inner: 92, outer: 120, col: '#b45309' },
            { inner: 120, outer: 155, col: '#d97706' },
            { inner: 155, outer: 190, col: '#92400e' },
          ].map((dune, idx) => (
            <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15 + idx * 0.04, 0]} receiveShadow>
              <ringGeometry args={[dune.inner, dune.outer, 64]} />
              <meshStandardMaterial color={dune.col} roughness={0.95} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* Stadium Podium Rim */}
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <cylinderGeometry args={[68, 70, 0.9, 72]} />
        <meshStandardMaterial color={style === 'desert' ? '#78350f' : '#111827'} roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.88, 0]}>
        <ringGeometry args={[67.2, 68.2, 72]} />
        <meshBasicMaterial color={style === 'desert' ? '#f59e0b' : '#38bdf8'} side={THREE.DoubleSide} />
      </mesh>

      {/* Instanced Trees */}
      {hasTrees && treeData.length > 0 && (
        <group>
          <instancedMesh ref={trunkMeshRef} args={[new THREE.CylinderGeometry(0.14, 0.22, 2.8, 6), undefined, treeData.length]} castShadow>
            <meshStandardMaterial color={style === 'desert' ? '#78350f' : '#3d2817'} roughness={0.9} />
          </instancedMesh>
          <instancedMesh
            ref={foliageMeshRef}
            args={[style === 'desert' ? new THREE.SphereGeometry(2.0, 8, 8) : new THREE.ConeGeometry(1.5, 4.0, 7), undefined, treeData.length]}
            castShadow
          >
            <meshStandardMaterial color={style === 'desert' ? '#15803d' : '#14532d'} roughness={0.8} />
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
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>
              <mesh position={[0, 1.25, 0]}>
                <sphereGeometry args={[0.18, 12, 12]} />
                <meshBasicMaterial color={style === 'desert' ? '#f59e0b' : '#38bdf8'} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}

// =============================================================================
// 2. FOOTBALL PITCH & OLYMPIC ATHLETICS TRACK (Responsive to Stadium Type)
// =============================================================================
function MasterPitchAndTrack({
  type = 'football',
  pitchDesign = 'modern',
}: {
  type?: string;
  pitchDesign?: string;
}) {
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#ffffff', linewidth: 2 }), []);

  const lines = useMemo(() => {
    const p = (coords: [number, number, number][]) => coords.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return [
      p([[-34, 1.03, -52.5], [34, 1.03, -52.5], [34, 1.03, 52.5], [-34, 1.03, 52.5], [-34, 1.03, -52.5]]),
      p([[-34, 1.03, 0], [34, 1.03, 0]]),
      p([[-20.16, 1.03, -52.5], [-20.16, 1.03, -36], [20.16, 1.03, -36], [20.16, 1.03, -52.5]]),
      p([[-20.16, 1.03, 52.5], [-20.16, 1.03, 36], [20.16, 1.03, 36], [20.16, 1.03, 52.5]]),
      p([[-9.16, 1.03, -52.5], [-9.16, 1.03, -47], [9.16, 1.03, -47], [9.16, 1.03, -52.5]]),
      p([[-9.16, 1.03, 52.5], [-9.16, 1.03, 47], [9.16, 1.03, 47], [9.16, 1.03, 52.5]]),
    ];
  }, []);

  const grassPrimary = pitchDesign === 'heated' ? '#16a34a' : pitchDesign === 'classic' ? '#15803d' : '#147a38';
  const grassSecondary = pitchDesign === 'heated' ? '#15803d' : pitchDesign === 'classic' ? '#166534' : '#0f612d';

  return (
    <group position={[0, 0, 0]}>
      {/* ── Olympic 400m Athletics Running Track (Red with White Lane Markings) ── */}
      {type === 'olympic' && (
        <group>
          {/* Red Synthetic Polyurethane Track Base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.0, 0]} receiveShadow>
            <ringGeometry args={[36, 52, 64]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.85} metalness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {/* 8 Olympic Track Lanes */}
          {[38, 40, 42, 44, 46, 48, 50, 52].map((r, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.02, 0]}>
              <ringGeometry args={[r - 0.08, r + 0.08, 64]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* Olympic Cauldron Tower with Ceremonial Flame Light at North End */}
          <group position={[0, 1.0, -56]}>
            <mesh position={[0, 12, 0]}>
              <cylinderGeometry args={[0.6, 1.6, 24, 8]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Cauldron Bowl */}
            <mesh position={[0, 24.5, 0]}>
              <coneGeometry args={[3.2, 2.5, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Burning Olympic Flame Light */}
            <pointLight position={[0, 26, 0]} intensity={350} distance={120} color="#f97316" />
            <mesh position={[0, 26, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
          </group>
        </group>
      )}

      {/* Turf Stripes */}
      {Array.from({ length: 11 }).map((_, i) => {
        const z = -50 + i * 10;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.01, z]} receiveShadow>
            <planeGeometry args={[68, 10]} />
            <meshStandardMaterial
              color={i % 2 === 1 ? grassPrimary : grassSecondary}
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
        );
      })}

      {/* Pitch Safety Run-off */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.99, 0]} receiveShadow>
        <planeGeometry args={[84, 120]} />
        <meshStandardMaterial color="#0a2a16" roughness={0.9} />
      </mesh>

      {/* Field Lines */}
      {lines.map((pts, i) => (
        <primitive key={i} object={new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMaterial)} />
      ))}

      {/* Center Circle & Spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.03, 0]}>
        <ringGeometry args={[9.0, 9.25, 64]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.03, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 3D Goals */}
      {[[-52.5, 0], [52.5, Math.PI]].map(([gz, rot], i) => (
        <group key={i} position={[0, 1.0, gz]} rotation={[0, rot, 0]}>
          <mesh position={[0, 2.44, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 7.32, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
          </mesh>
          {[-3.66, 3.66].map((gx, j) => (
            <mesh key={j} position={[gx, 1.22, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 2.44, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 1.22, -1.2]}>
            <boxGeometry args={[7.32, 2.44, 2.4]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.2} wireframe />
          </mesh>
        </group>
      ))}

      {/* Digital Sideline Ribbon Boards */}
      <group position={[0, 1.0, 0]}>
        {[-37, 37].map((bx, i) => (
          <mesh key={i} position={[bx, 0.5, 0]}>
            <boxGeometry args={[0.5, 1.0, 110]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Dugouts */}
      {[-12, 12].map((dx, i) => (
        <group key={i} position={[dx, 1.0, -56]}>
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[11, 2.4, 2.8]} />
            <meshStandardMaterial color="#0f172a" transparent opacity={0.65} roughness={0.2} metalness={0.8} />
          </mesh>
          {[-4, -2, 0, 2, 4].map((sx, j) => (
            <mesh key={j} position={[sx, 0.6, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 3. DETAILED GRANDSTAND BOWL & INSTANCED SEATS (Adapts to Stadium Type)
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

  // Scale bowl outward for Olympic athletics track
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

          // Football is rectangular-oval; Multi-purpose is circular; Olympic is wide oval
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
              <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
            </mesh>

            {Array.from({ length: t.steps }).map((_, stepIdx) => {
              const frac = stepIdx / t.steps;
              const r = t.innerR + frac * (t.outerR - t.innerR);
              const y = t.yStart + frac * h;
              return (
                <mesh key={stepIdx} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
                  <ringGeometry args={[r - 0.4, r + 0.8, 64]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.95} />
                </mesh>
              );
            })}

            <mesh position={[0, t.yStart + 0.7, 0]}>
              <cylinderGeometry args={[t.innerR * 0.98, t.innerR * 0.98, 1.2, 64, 1, true]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.1} metalness={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}

      {hasVip && actualTiers >= 2 && (
        <group position={[0, 7.4, 0]}>
          <mesh>
            <cylinderGeometry args={[56 + rOffset, 54 + rOffset, 1.6, 64, 1, true]} />
            <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.6} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.9, 0]}>
            <cylinderGeometry args={[53.8 + rOffset, 53.8 + rOffset, 0.6, 64, 1, true]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      <instancedMesh ref={seatMeshRef} args={[seatGeometry, undefined, seatPositions.length]} castShadow receiveShadow>
        <meshStandardMaterial color={seatColor} roughness={0.4} metalness={0.25} />
      </instancedMesh>
    </group>
  );
}

// =============================================================================
// 4. VISIBLE 3D STADIUM ENTRANCES & VIP PORTALS (Entry & Plaza)
// =============================================================================
function VisibleStadiumEntrances({ config }: { config: StadiumConfig }) {
  const entranceStyle = config.entry?.mainEntrance ?? 'glass';
  const hasVip = config.entry?.hasVipEntrance ?? true;
  const hasParking = config.entry?.hasParking ?? true;

  return (
    <group>
      {/* ── South Grand Entrance (Main Public Gate) ── */}
      <group position={[0, 0, 68]}>
        {/* Grand Terraced Entrance Staircase leading up from plaza */}
        <group position={[0, 0.35, 6]}>
          {Array.from({ length: 6 }).map((_, step) => (
            <mesh key={step} position={[0, step * 0.22, -step * 1.4]} receiveShadow>
              <boxGeometry args={[32 - step * 1.5, 0.25, 2.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.3} />
            </mesh>
          ))}
          {/* Central Accessible Ramp */}
          <mesh position={[0, 0.6, -3.5]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[6, 0.1, 9]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        </group>

        {/* 1. GLASS GRAND PAVILION */}
        {entranceStyle === 'glass' && (
          <group position={[0, 1.4, 0]}>
            <mesh position={[0, 7, 0]} castShadow>
              <boxGeometry args={[28, 14, 8]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.55} roughness={0.05} metalness={0.9} />
            </mesh>
            {/* Cantilever Glass Canopy over entrance */}
            <mesh position={[0, 8.5, 6]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[32, 0.6, 9]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Illuminated Portal Turnstiles & Signage */}
            <mesh position={[0, 11, 3.5]}>
              <boxGeometry args={[20, 1.8, 0.4]} />
              <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.8} />
            </mesh>
          </group>
        )}

        {/* 2. MONUMENTAL ARCH GATEWAY */}
        {entranceStyle === 'arch' && (
          <group position={[0, 1.4, 0]}>
            {/* Monumental Soaring Arch */}
            <mesh position={[0, 12, 0]} castShadow>
              <torusGeometry args={[13, 2.2, 16, 32, Math.PI]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Glowing Inner Arch Contour Ribbon */}
            <mesh position={[0, 12, 0.2]}>
              <torusGeometry args={[11.8, 0.35, 16, 32, Math.PI]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Gate Portals */}
            {[-9, 9].map((px, i) => (
              <mesh key={i} position={[px, 6, 0]}>
                <boxGeometry args={[3.5, 12, 4]} />
                <meshStandardMaterial color="#1e293b" metalness={0.7} />
              </mesh>
            ))}
          </group>
        )}

        {/* 3. TWIN ILLUMINATED PYLON TOWERS */}
        {entranceStyle === 'tower' && (
          <group position={[0, 1.4, 0]}>
            {[-15, 15].map((tx, i) => (
              <group key={i} position={[tx, 0, 0]}>
                {/* 40m Soaring Pylon */}
                <mesh position={[0, 20, 0]} castShadow>
                  <cylinderGeometry args={[0.8, 2.2, 40, 8]} />
                  <meshStandardMaterial color="#f1f5f9" metalness={0.85} roughness={0.2} />
                </mesh>
                {/* Vertical Blue Laser Light Blade */}
                <mesh position={[0, 20, 1.2]}>
                  <boxGeometry args={[0.3, 38, 0.2]} />
                  <meshBasicMaterial color="#38bdf8" />
                </mesh>
                {/* Sky Tension Stay Cable */}
                <mesh position={[-tx * 0.4, 18, 0]} rotation={[0, 0, (tx > 0 ? -1 : 1) * Math.PI / 6]}>
                  <cylinderGeometry args={[0.08, 0.08, 28, 8]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                </mesh>
              </group>
            ))}
            {/* Crossbeam Welcome Bridge */}
            <mesh position={[0, 12, 0]}>
              <boxGeometry args={[30, 2.4, 3.5]} />
              <meshStandardMaterial color="#0f172a" emissive="#0284c7" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}

        {/* 4. CLASSICAL MONUMENTAL PORTICO */}
        {entranceStyle === 'classic' && (
          <group position={[0, 1.4, 0]}>
            {/* 6 Monumental Stone Colonnade Pillars */}
            {[-12, -7.2, -2.4, 2.4, 7.2, 12].map((cx, i) => (
              <mesh key={i} position={[cx, 8, 2]} castShadow>
                <cylinderGeometry args={[1.1, 1.3, 16, 16]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.8} />
              </mesh>
            ))}
            {/* Classical Triangular Pediment Gable */}
            <mesh position={[0, 18, 2]}>
              <coneGeometry args={[16, 5, 3]} />
              <meshStandardMaterial color="#d97706" roughness={0.85} />
            </mesh>
          </group>
        )}
      </group>

      {/* ── West VIP Arrival Porte-Cochère ── */}
      {hasVip && (
        <group position={[-68, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          {/* Cantilever Drop-off Canopy */}
          <mesh position={[0, 4.5, 3]} castShadow>
            <boxGeometry args={[16, 0.6, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* VIP Red Carpet Runway */}
          <mesh position={[0, 0.08, 8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 16]} />
            <meshStandardMaterial color="#991b1b" roughness={0.8} />
          </mesh>
          {/* Glass Skybridge Connecting to VIP Suites */}
          <mesh position={[0, 4.5, -4]}>
            <boxGeometry args={[6, 3.2, 8]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* ── Subterranean Parking Portal Ramps ── */}
      {hasParking && (
        <group position={[68, 0, 24]} rotation={[0, -Math.PI / 2, 0]}>
          {/* Downward Sloped Asphalt Ramp */}
          <mesh position={[0, -0.6, 6]} rotation={[0.2, 0, 0]}>
            <planeGeometry args={[10, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Concrete Retaining Walls */}
          {[-5.2, 5.2].map((wx, i) => (
            <mesh key={i} position={[wx, 0.4, 6]}>
              <boxGeometry args={[0.4, 2.2, 14]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
          ))}
          {/* Parking Portal Gate Header */}
          <mesh position={[0, 2.0, 1]}>
            <boxGeometry args={[11, 1.0, 1]} />
            <meshStandardMaterial color="#1e293b" emissive="#10b981" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 5. SIGNATURE ARCHITECTURAL FACADE
// =============================================================================
function ArchitecturalFacade({ config }: { config: StadiumConfig }) {
  const facade = config.facade;
  const isIndoor = config.type === 'indoor';
  const topR = 76;
  const botR = 64;
  const height = isIndoor ? 32 : 26;
  const centerY = height / 2;

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
      {/* Inner Concourse Drum */}
      <mesh position={[0, centerY, 0]}>
        <cylinderGeometry args={[topR - 2.5, botR - 2.5, height - 1.5, 64, 1, true]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive={facade === 'traditional' ? '#92400e' : '#b45309'}
          emissiveIntensity={0.65}
          roughness={0.4}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[centerY - 6, centerY + 2, centerY + 8].map((yLevel, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, yLevel, 0]}>
          <ringGeometry args={[botR - 3, topR - 2, 64]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 1. Lattice Diagrid */}
      {facade === 'lattice' && (
        <group>
          {diagridBeams.map((beam, i) => (
            <mesh key={i} position={beam.pos} rotation={beam.rot} castShadow>
              <boxGeometry args={[1.1, beam.len, 1.4]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.35} />
            </mesh>
          ))}
          {[1.2, centerY, centerY + 12].map((yPos, i) => {
            const r = botR + ((topR - botR) * (yPos / height));
            return (
              <mesh key={i} position={[0, yPos, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[r - 0.7, r + 0.7, 72]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.2} metalness={0.5} side={THREE.DoubleSide} />
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
                  <meshStandardMaterial color={i % 2 === 0 ? '#b45309' : '#d97706'} roughness={0.35} metalness={0.7} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* 3. Geometric Origami */}
      {facade === 'geometric' && (
        <group>
          {Array.from({ length: 28 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 28;
            return (
              <group key={i} position={[Math.sin(rad) * (botR + 2.5), centerY, Math.cos(rad) * (botR + 2.5)]} rotation={[0, -rad, 0]}>
                <mesh position={[0, 6, 0]} rotation={[0.2, 0, 0]} castShadow>
                  <coneGeometry args={[7, 13, 3]} />
                  <meshStandardMaterial color="#c084fc" metalness={0.7} roughness={0.2} />
                </mesh>
                <mesh position={[0, -6, 0]} rotation={[-0.2, Math.PI, 0]} castShadow>
                  <coneGeometry args={[6.5, 13, 3]} />
                  <meshStandardMaterial color="#9333ea" metalness={0.65} roughness={0.25} />
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
            <meshStandardMaterial color="#e0f2fe" metalness={0.75} roughness={0.2} wireframe side={THREE.DoubleSide} />
          </mesh>
          {[-8, -3, 2, 7, 12].map((yOff, i) => (
            <mesh key={i} position={[0, yOff, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[botR + 1.5, botR + 2.4, 72]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. Glazed Glass */}
      {facade === 'glass' && (
        <group position={[0, centerY, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[topR, botR, height, 64, 4, true]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.05} metalness={0.95} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 48 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 48;
            return (
              <mesh key={i} position={[Math.sin(rad) * (botR + 0.5), 0, Math.cos(rad) * (botR + 0.5)]} rotation={[0, -rad, 0]}>
                <boxGeometry args={[0.3, height, 0.6]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
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
            <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.3} wireframe side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 24 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 24;
            return (
              <mesh key={i} position={[Math.sin(rad) * (botR + 1.5), 0, Math.cos(rad) * (botR + 1.5)]} castShadow>
                <cylinderGeometry args={[0.6, 0.8, height, 12]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
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
                <meshStandardMaterial color="#f59e0b" roughness={0.8} metalness={0.15} />
              </mesh>
            );
          })}
          <mesh position={[0, centerY - 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[topR - 1.0, topR + 2.5, 64]} />
            <meshStandardMaterial color="#d97706" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      <mesh position={[0, centerY + height / 2 + 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[topR - 1.5, topR + 2.2, 72]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// =============================================================================
// 6. MASTER ROOF & DOME ENCLOSURE (Dynamic Variations)
// =============================================================================
function MasterRoofCanopy({ config }: { config: StadiumConfig }) {
  const roof = config.roof;
  const isIndoor = config.type === 'indoor';
  const secColor = config.materials.secondaryColor;
  const roofY = isIndoor ? 33 : 27;

  // Bio-Dome enclosure for Indoor Stadium Type
  if (isIndoor) {
    return (
      <group position={[0, 16, 0]}>
        {/* Full Geodesic Translucent Bio-Dome Shell */}
        <mesh castShadow>
          <sphereGeometry args={[82, 64, 48, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial
            color="#0ea5e9"
            metalness={0.85}
            roughness={0.1}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Bio-Structural Hexagonal Arches */}
        <mesh>
          <sphereGeometry args={[82.4, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.2} wireframe />
        </mesh>
        {/* Glowing Apex Skylight Oculus */}
        <mesh position={[0, 81.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[18, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>
    );
  }

  if (roof === 'open') {
    return (
      <group position={[0, roofY, 0]}>
        {/* Floating Structural Steel Tension Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[62, 78, 64]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, roofY, 0]}>
      {/* Outer Sweeping Aerodynamic Canopy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow receiveShadow>
        <ringGeometry args={[46, 78, 72]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[78.2, 76.5, 1.2, 72, 1, true]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Radial Cantilever Trusses */}
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
            <meshStandardMaterial color={secColor || '#475569'} metalness={0.85} roughness={0.2} />
          </mesh>
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[44.8, 46.2, 72]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
      </mesh>

      {/* Retractable Sliding Petal Panels & Guide Rails */}
      {roof === 'retractable' && (
        <group>
          {/* Motorized Guide Rails spanning across opening */}
          {[-20, 0, 20].map((gx, i) => (
            <mesh key={i} position={[gx, 2.2, 0]}>
              <boxGeometry args={[0.8, 1.2, 88]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {/* Half-Closed Sliding Petal Panels */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
            <ringGeometry args={[20, 46, 64]} />
            <meshStandardMaterial
              color="#0284c7"
              transparent
              opacity={0.7}
              roughness={0.2}
              metalness={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.4, 0]}>
            <ringGeometry args={[19.4, 20.4, 64]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Translucent ETFE Pneumatic Cushions */}
      {roof === 'transparent' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
          <ringGeometry args={[26, 46, 64]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.35}
            roughness={0.08}
            metalness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Geodesic Glass & Steel Arching Dome */}
      {roof === 'dome' && (
        <group>
          <mesh position={[0, 4, 0]} castShadow>
            <sphereGeometry args={[78, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2.8]} />
            <meshStandardMaterial
              color="#0ea5e9"
              metalness={0.85}
              roughness={0.15}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <sphereGeometry args={[78.2, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2.8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
        </group>
      )}

      {/* Fixed Full Canopy with Stadium Lighting Pods */}
      {roof === 'fixed' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.6, 0]} castShadow>
            <ringGeometry args={[30, 46, 64]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 16 }).map((_, i) => {
            const rad = (i * Math.PI * 2) / 16;
            return (
              <mesh key={i} position={[Math.sin(rad) * 38, -0.2, Math.cos(rad) * 38]}>
                <boxGeometry args={[1.6, 0.4, 2.8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 7. DYNAMIC ENVIRONMENT LIGHTING & SKY ATMOSPHERE
// =============================================================================
function DynamicEnvironmentSky({
  background = 'night',
  facade = 'lattice',
}: {
  background?: EnvironmentBackground;
  facade?: string;
}) {
  const isNight = background === 'night';
  const isSunset = background === 'sunset';
  const isDay = background === 'day';
  const isCyber = background === 'cyberpunk';
  const isDesert = background === 'desert';

  const sunPos: [number, number, number] = isSunset ? [180, 26, 130] : [150, 28, 110];

  return (
    <group>
      <ambientLight
        intensity={isDay ? 1.1 : isSunset ? 0.75 : isCyber ? 0.65 : 0.5}
        color={isDay ? '#bae6fd' : isSunset ? '#f472b6' : isCyber ? '#818cf8' : isDesert ? '#ca8a04' : '#64748b'}
      />

      <directionalLight
        position={isDay ? [60, 140, 70] : isSunset ? [160, 36, 120] : [70, 110, 80]}
        intensity={isDay ? 2.5 : isSunset ? 2.8 : isCyber ? 1.8 : 1.5}
        color={isDay ? '#f8fafc' : isSunset ? '#fbbf24' : isCyber ? '#38bdf8' : isDesert ? '#f59e0b' : '#e2e8f0'}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <directionalLight
        position={[-80, 80, -70]}
        intensity={isCyber ? 1.6 : 0.9}
        color={isCyber ? '#d946ef' : isSunset ? '#c084fc' : isDay ? '#38bdf8' : '#0284c7'}
      />

      {(isSunset || isDesert) && (
        <group position={sunPos}>
          <mesh>
            <sphereGeometry args={[18, 32, 32]} />
            <meshBasicMaterial color={isSunset ? '#fb923c' : '#f59e0b'} />
          </mesh>
          <pointLight intensity={320} distance={260} color={isSunset ? '#f97316' : '#d97706'} />
        </group>
      )}

      {Array.from({ length: 8 }).map((_, i) => {
        const rad = (i * Math.PI * 2) / 8;
        return (
          <pointLight
            key={i}
            position={[Math.sin(rad) * 60, 14, Math.cos(rad) * 60]}
            intensity={isDay ? 90 : isCyber ? 220 : 190}
            distance={75}
            color={isCyber ? '#06b6d4' : facade === 'traditional' || isDesert ? '#f59e0b' : '#fbbf24'}
          />
        );
      })}

      {[
        [46, 42, 46],
        [-46, 42, 46],
        [46, 42, -46],
        [-46, 42, -46],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <pointLight intensity={isDay ? 80 : 260} distance={160} color={isCyber ? '#a5f3fc' : '#f0f9ff'} castShadow />
          <mesh>
            <boxGeometry args={[3.2, 3.2, 0.6]} />
            <meshBasicMaterial color={isDay ? '#94a3b8' : '#ffffff'} />
          </mesh>
          <mesh position={[0, -21, 0]}>
            <cylinderGeometry args={[0.5, 1.1, 42, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {!isDay && (
        <Stars
          radius={280}
          depth={60}
          count={isNight ? 3500 : isCyber ? 2500 : isDesert ? 2000 : 1000}
          factor={isCyber ? 5 : 4}
          fade
          speed={0.3}
        />
      )}
    </group>
  );
}

// =============================================================================
// 8. JUMBOTRON SCREENS & ADD-ONS
// =============================================================================
function StadiumAddons({ config }: { config: StadiumConfig }) {
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
                  <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0.45]}>
                  <planeGeometry args={[15.2, 7.8]} />
                  <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {config.addons.hasSolarPanels && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 27.8, 0]}>
          <ringGeometry args={[52, 76, 48]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// =============================================================================
// 9. MASTER ASSEMBLED ARCHITECTURAL STADIUM
// =============================================================================
function MasterStadiumModel({ config }: { config: StadiumConfig }) {
  const landscape = config.landscape ?? DEFAULT_STADIUM_CONFIG.landscape;
  const background = landscape?.background ?? 'night';

  return (
    <group>
      {/* Ground Landscape */}
      <DynamicLandscapeGround landscape={landscape} />

      {/* Football Pitch / Olympic Athletics Running Track */}
      <MasterPitchAndTrack type={config.type} pitchDesign={config.interior.pitchDesign} />

      {/* Stepped Grandstand Bowl */}
      <RealisticGrandstands
        type={config.type}
        tiers={config.seating.tiers}
        seatColor={config.seating.primaryColor}
        capacity={config.seating.capacity}
        hasVip={config.seating.hasVip}
      />

      {/* Signature Exterior Facade */}
      <ArchitecturalFacade config={config} />

      {/* Engineered Roof Canopy or Bio-Dome */}
      <MasterRoofCanopy config={config} />

      {/* Visible 3D Stadium Entrances, VIP Portes-Cochères & Parking */}
      <VisibleStadiumEntrances config={config} />

      {/* Dynamic Lighting & Sky */}
      <DynamicEnvironmentSky background={background} facade={config.facade} />

      {/* Jumbotrons, PV Solar & Add-Ons */}
      <StadiumAddons config={config} />
    </group>
  );
}

// =============================================================================
// 10. CAMERA & TURNTABLE CONTROLS
// =============================================================================
function TurntableAnimation({ active }: { active: boolean }) {
  const { scene } = useThree();
  useFrame((_, delta) => {
    if (active) {
      scene.rotation.y += delta * 0.08;
    }
  });
  return null;
}

// =============================================================================
// 11. EXPORTED STADIUM 3D PREVIEW COMPONENT
// =============================================================================
interface Props {
  config?: StadiumConfig;
  interactive?: boolean;
  autoRotate?: boolean;
  className?: string;
  presetCamera?: 'aerial' | 'pitch' | 'facade';
  showQuickControls?: boolean;
}

export function StadiumPreview3D({
  config: configProp,
  interactive = false,
  autoRotate = false,
  className,
  presetCamera = 'aerial',
  showQuickControls = true,
}: Props) {
  const storeConfig = useStadiumStore((s) => s.config);
  const updateLandscape = useStadiumStore((s) => s.updateLandscape);
  const activeConfig = configProp ?? storeConfig ?? DEFAULT_STADIUM_CONFIG;

  const currentBg = activeConfig.landscape?.background ?? 'night';
  const currentLandscape = activeConfig.landscape?.landscapeStyle ?? 'olympic';

  const [activeCam, setActiveCam] = useState<'aerial' | 'pitch' | 'facade'>(presetCamera);

  const cameraPosition = useMemo((): [number, number, number] => {
    if (activeCam === 'pitch') return [0, 8, 30];
    if (activeCam === 'facade') return [0, 16, 102]; // Directly facing South Grand Entrance
    return [95, 62, 95];
  }, [activeCam]);

  return (
    <div className={`relative w-full h-full select-none ${className ?? ''}`}>
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 44 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <MasterStadiumModel config={activeConfig} />

          {interactive && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={26}
              maxDistance={250}
              maxPolarAngle={Math.PI / 2.05}
              autoRotate={autoRotate}
              autoRotateSpeed={0.6}
              dampingFactor={0.06}
            />
          )}

          <TurntableAnimation active={!interactive && autoRotate} />
        </Suspense>
      </Canvas>

      {/* Quick Environment & Camera Floating Toolbar */}
      {showQuickControls && (
        <div className="absolute top-3 right-4 z-20 flex flex-col gap-2 items-end pointer-events-auto">
          {/* Sky Atmosphere Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090d18]/90 backdrop-blur-md border border-white/[0.08] shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 px-2 font-medium">Sky:</span>
            {BACKGROUND_PRESETS.map((preset) => {
              const isActive = currentBg === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => updateLandscape({ background: preset.value })}
                  title={`${preset.label}: ${preset.description}`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span className="text-[10px] capitalize hidden sm:inline">{preset.value}</span>
                </button>
              );
            })}
          </div>

          {/* Landscape Style Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090d18]/90 backdrop-blur-md border border-white/[0.08] shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 px-2 font-medium">Plaza:</span>
            {LANDSCAPE_STYLES.map((land) => {
              const isActive = currentLandscape === land.value;
              return (
                <button
                  key={land.value}
                  onClick={() => updateLandscape({ landscapeStyle: land.value })}
                  title={`${land.label}: ${land.description}`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{land.icon}</span>
                  <span className="text-[10px] capitalize hidden sm:inline">{land.value}</span>
                </button>
              );
            })}
          </div>

          {/* Camera Presets: Aerial, Pitch, Entrance View */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090d18]/90 backdrop-blur-md border border-white/[0.08] shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 px-2 font-medium">View:</span>
            {[
              { id: 'aerial' as const, label: 'Aerial', icon: Landmark },
              { id: 'pitch' as const, label: 'Pitch', icon: Camera },
              { id: 'facade' as const, label: 'Entrance', icon: Building2 },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveCam(cam.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  activeCam === cam.id
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <cam.icon size={11} />
                <span>{cam.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

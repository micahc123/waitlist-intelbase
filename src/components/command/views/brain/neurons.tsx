"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { REGIONS, BRAIN_RADII, hexToRgb } from "./regions";
import { makeGlowSprite } from "./sprite";

const COUNT = 11000;

// Deterministic-ish PRNG so the brain looks the same each render (stable).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller gaussian.
function gauss(rand: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface NeuronBuild {
  positions: Float32Array;
  colors: Float32Array;
  regionOf: Uint8Array;
  /** indices grouped per region, for synapse wiring */
  regionIndices: number[][];
}

export function buildNeurons(): NeuronBuild {
  const rand = mulberry32(0xa11ce);
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const regionOf = new Uint8Array(COUNT);
  const regionIndices: number[][] = REGIONS.map(() => []);

  const totalWeight = REGIONS.reduce((s, r) => s + r.weight, 0);

  let i = 0;
  for (let ri = 0; ri < REGIONS.length; ri++) {
    const region = REGIONS[ri];
    const [cr, cg, cb] = hexToRgb(region.color);
    const share = ri === REGIONS.length - 1
      ? COUNT - i
      : Math.round((region.weight / totalWeight) * COUNT);

    for (let k = 0; k < share && i < COUNT; k++, i++) {
      // gaussian blob around the region center
      let x = region.center[0] + gauss(rand) * region.spread;
      let y = region.center[1] + gauss(rand) * region.spread;
      let z = region.center[2] + gauss(rand) * region.spread;

      // pull points toward the brain ellipsoid shell so the volume reads as a
      // rounded brain rather than separate clouds; clamp the outer radius.
      const rr = Math.sqrt(x * x + y * y + z * z) || 1e-4;
      if (rr > 1.25) {
        const s = 1.25 / rr;
        x *= s;
        y *= s;
        z *= s;
      }

      positions[i * 3] = x * BRAIN_RADII[0];
      positions[i * 3 + 1] = y * BRAIN_RADII[1];
      positions[i * 3 + 2] = z * BRAIN_RADII[2];

      // slight per-point brightness variance for depth
      const b = 0.72 + rand() * 0.45;
      colors[i * 3] = cr * b;
      colors[i * 3 + 1] = cg * b;
      colors[i * 3 + 2] = cb * b;

      regionOf[i] = ri;
      regionIndices[ri].push(i);
    }
  }

  return { positions, colors, regionOf, regionIndices };
}

export function Neurons({ build }: { build: NeuronBuild }) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const sprite = useMemo(() => makeGlowSprite(128), []);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(build.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(build.colors, 3));
    g.computeBoundingSphere();
    return g;
  }, [build]);

  // breathing: gently modulate point size + opacity so the field feels alive.
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const mat = matRef.current;
    if (mat) {
      mat.size = 0.044 + Math.sin(time * 0.9) * 0.006;
      mat.opacity = 0.86 + Math.sin(time * 1.3) * 0.1;
    }
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        ref={matRef}
        map={sprite}
        size={0.046}
        vertexColors
        transparent
        opacity={0.92}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        alphaTest={0.01}
      />
    </points>
  );
}

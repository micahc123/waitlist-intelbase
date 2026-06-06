"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { REGIONS, hexToRgb } from "./regions";
import { makeGlowSprite } from "./sprite";
import type { NeuronBuild } from "./neurons";

const MAX_LINES = 320; // keep performant: a few hundred segments
const MAX_PULSES = 24;

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

interface Conn {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  cr: number; cg: number; cb: number;
}

function buildConnections(build: NeuronBuild): Conn[] {
  const rand = mulberry32(0x5ee75);
  const { positions, regionIndices } = build;
  const conns: Conn[] = [];

  // connect nearby points: mostly intra-region (short synapses), a few
  // inter-region long-range links for the "routing" feel.
  let guard = 0;
  while (conns.length < MAX_LINES && guard < MAX_LINES * 40) {
    guard++;
    const interRegion = rand() < 0.22;
    const ra = (rand() * REGIONS.length) | 0;
    const rbase = interRegion ? (rand() * REGIONS.length) | 0 : ra;
    const idxA = regionIndices[ra];
    const idxB = regionIndices[rbase];
    if (!idxA.length || !idxB.length) continue;
    const a = idxA[(rand() * idxA.length) | 0];
    const b = idxB[(rand() * idxB.length) | 0];
    if (a === b) continue;

    const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
    const bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];
    const d2 = (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2;
    // reject very long links unless intentionally inter-region
    if (!interRegion && d2 > 0.22) continue;
    if (interRegion && d2 > 2.2) continue;

    const [cr, cg, cb] = hexToRgb(REGIONS[ra].color);
    conns.push({ ax, ay, az, bx, by, bz, cr, cg, cb });
  }
  return conns;
}

export function Synapses({ build, firingCount }: { build: NeuronBuild; firingCount: number }) {
  const conns = useMemo(() => buildConnections(build), [build]);
  const firingRef = useRef(firingCount);
  firingRef.current = firingCount;

  // --- faint static line segments ---
  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(conns.length * 6);
    const col = new Float32Array(conns.length * 6);
    for (let i = 0; i < conns.length; i++) {
      const c = conns[i];
      pos[i * 6] = c.ax; pos[i * 6 + 1] = c.ay; pos[i * 6 + 2] = c.az;
      pos[i * 6 + 3] = c.bx; pos[i * 6 + 4] = c.by; pos[i * 6 + 5] = c.bz;
      const f = 0.5;
      col[i * 6] = c.cr * f; col[i * 6 + 1] = c.cg * f; col[i * 6 + 2] = c.cb * f;
      col[i * 6 + 3] = c.cr * f; col[i * 6 + 4] = c.cg * f; col[i * 6 + 5] = c.cb * f;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [conns]);

  const lineMatRef = useRef<THREE.LineBasicMaterial>(null);

  // --- traveling firing pulses (bright points sliding along connections) ---
  const pulseSprite = useMemo(() => makeGlowSprite(128), []);
  const pulses = useMemo(() => {
    const rand = mulberry32(0x9b17e);
    return Array.from({ length: MAX_PULSES }, () => ({
      conn: (rand() * Math.max(1, conns.length)) | 0,
      phase: rand(),
      speed: 0.35 + rand() * 0.7,
      hop: rand() * 100,
    }));
  }, [conns]);

  const pulseGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_PULSES * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(MAX_PULSES * 3), 3));
    return g;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // shimmer the faint lines
    if (lineMatRef.current) {
      lineMatRef.current.opacity = 0.12 + Math.sin(time * 0.7) * 0.04;
    }

    // animate pulses along their connections
    if (conns.length) {
      const pos = pulseGeom.getAttribute("position") as THREE.BufferAttribute;
      const col = pulseGeom.getAttribute("color") as THREE.BufferAttribute;
      const boost = firingRef.current > 0 ? 1.5 : 1.0;
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        const tt = (p.phase + time * p.speed) % 1;
        // occasionally hop to a new connection at loop wrap
        const cyc = Math.floor(p.phase + time * p.speed);
        const c = conns[(p.conn + cyc * 7 + (p.hop | 0)) % conns.length];
        const x = c.ax + (c.bx - c.ax) * tt;
        const y = c.ay + (c.by - c.ay) * tt;
        const z = c.az + (c.bz - c.az) * tt;
        pos.setXYZ(i, x, y, z);
        // brighten near the middle of the trip, fade at ends
        const env = Math.sin(tt * Math.PI);
        const g = env * boost;
        col.setXYZ(i, Math.min(1, c.cr * g + 0.25 * g), Math.min(1, c.cg * g + 0.3 * g), Math.min(1, c.cb * g + 0.4 * g));
      }
      pos.needsUpdate = true;
      col.needsUpdate = true;
    }
  });

  return (
    <group>
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial
          ref={lineMatRef}
          vertexColors
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={pulseGeom}>
        <pointsMaterial
          map={pulseSprite}
          size={0.13}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          alphaTest={0.01}
        />
      </points>
    </group>
  );
}

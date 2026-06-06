"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CATEGORIES, CORTEX_RADII, hexToRgb } from "./sessions";
import { makeGlowSprite } from "./sprite";

const BULK = 10500; // bulk cortex points
const MAX_STREAMERS = 44; // incoming sorting particles in flight
const MAX_FIBERS = 240; // connective fibers between lobes

// Deterministic PRNG so the cortex is stable across renders.
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

function gauss(rand: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface CortexBuild {
  positions: Float32Array;
  baseColors: Float32Array; // unmodulated rgb per point
  catOf: Uint8Array; // category index per point
  centers: THREE.Vector3[]; // lobe centers in world space
  catColor: [number, number, number][];
}

export function buildCortex(): CortexBuild {
  const rand = mulberry32(0xc07e51d);
  const positions = new Float32Array(BULK * 3);
  const baseColors = new Float32Array(BULK * 3);
  const catOf = new Uint8Array(BULK);
  const centers: THREE.Vector3[] = [];
  const catColor: [number, number, number][] = [];

  const totalWeight = CATEGORIES.reduce((s, c) => s + c.weight, 0);

  CATEGORIES.forEach((cat) => {
    centers.push(
      new THREE.Vector3(
        cat.center[0] * CORTEX_RADII[0],
        cat.center[1] * CORTEX_RADII[1],
        cat.center[2] * CORTEX_RADII[2],
      ),
    );
    catColor.push(hexToRgb(cat.color));
  });

  let i = 0;
  for (let ci = 0; ci < CATEGORIES.length; ci++) {
    const cat = CATEGORIES[ci];
    const [cr, cg, cb] = catColor[ci];
    const share =
      ci === CATEGORIES.length - 1
        ? BULK - i
        : Math.round((cat.weight / totalWeight) * BULK);

    for (let k = 0; k < share && i < BULK; k++, i++) {
      let x = cat.center[0] + gauss(rand) * cat.spread;
      let y = cat.center[1] + gauss(rand) * cat.spread;
      let z = cat.center[2] + gauss(rand) * cat.spread;

      // pull toward the cortex shell so lobes wrap into one rounded silhouette
      const rr = Math.sqrt(x * x + y * y + z * z) || 1e-4;
      if (rr > 1.28) {
        const s = 1.28 / rr;
        x *= s;
        y *= s;
        z *= s;
      }

      positions[i * 3] = x * CORTEX_RADII[0];
      positions[i * 3 + 1] = y * CORTEX_RADII[1];
      positions[i * 3 + 2] = z * CORTEX_RADII[2];

      const b = 0.7 + rand() * 0.48;
      baseColors[i * 3] = cr * b;
      baseColors[i * 3 + 1] = cg * b;
      baseColors[i * 3 + 2] = cb * b;
      catOf[i] = ci;
    }
  }

  return { positions, baseColors, catOf, centers, catColor };
}

// ---------------------------------------------------------------------------
// Connective fibers between neighboring lobes + a bright central core.
// ---------------------------------------------------------------------------
function buildFibers(build: CortexBuild) {
  const rand = mulberry32(0xf1be5);
  const { centers, catColor } = build;
  const pos: number[] = [];
  const col: number[] = [];

  // Connect each lobe to its 2-3 nearest neighbors, plus all lobes to the core.
  const core = new THREE.Vector3(0, 0, 0);
  for (let a = 0; a < centers.length; a++) {
    // nearest neighbors
    const dists = centers
      .map((c, b) => ({ b, d: centers[a].distanceTo(c) }))
      .filter((o) => o.b !== a)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3);
    const [ar, ag, ab] = catColor[a];
    for (const { b } of dists) {
      if (b < a) continue; // dedupe each undirected pair once
      const [br, bg, bb] = catColor[b];
      // a few short hop-segments along the link for a softer fiber feel
      const segs = 6;
      const A = centers[a];
      const B = centers[b];
      let px = A.x;
      let py = A.y;
      let pz = A.z;
      for (let s = 1; s <= segs; s++) {
        const t = s / segs;
        // bow the fiber inward toward the core a touch
        const nx = A.x + (B.x - A.x) * t + (rand() - 0.5) * 0.04;
        const ny = A.y + (B.y - A.y) * t + (rand() - 0.5) * 0.04;
        const nz = A.z + (B.z - A.z) * t + (rand() - 0.5) * 0.04;
        const mx = nx * (0.82 + 0.18 * Math.abs(t - 0.5) * 2);
        const my = ny * (0.82 + 0.18 * Math.abs(t - 0.5) * 2);
        const mz = nz * (0.82 + 0.18 * Math.abs(t - 0.5) * 2);
        pos.push(px, py, pz, mx, my, mz);
        const f = 0.45;
        col.push(ar * f, ag * f, ab * f, br * f, bg * f, bb * f);
        px = mx;
        py = my;
        pz = mz;
      }
    }
    // spoke to core
    pos.push(core.x, core.y, core.z, centers[a].x, centers[a].y, centers[a].z);
    col.push(0.5, 0.7, 1.0, ar * 0.4, ag * 0.4, ab * 0.4);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos.slice(0, MAX_FIBERS * 6), 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col.slice(0, MAX_FIBERS * 6), 3));
  return g;
}

// ---------------------------------------------------------------------------
// Streamer pool: incoming sessions that spawn at the edge and fly into a lobe.
// ---------------------------------------------------------------------------
interface Streamer {
  active: boolean;
  cat: number; // target category index
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number; // 0..1 progress
  speed: number;
  trail: THREE.Vector3[]; // recent positions (head + tail points)
}

export interface CortexProps {
  /** selected category id, or null for "all" */
  selected: string | null;
  /** sim time, drives spawn cadence */
  t: number;
  /** firing count, intensifies the stream */
  firingCount: number;
}

export function Cortex({ selected, t, firingCount }: CortexProps) {
  const build = useMemo(() => buildCortex(), []);
  const sprite = useMemo(() => makeGlowSprite(128), []);
  const coreSprite = useMemo(() => makeGlowSprite(256), []);

  const bulkMat = useRef<THREE.PointsMaterial>(null);
  const coreRef = useRef<THREE.Sprite>(null);
  const fiberMat = useRef<THREE.LineBasicMaterial>(null);

  const selectedIdx = useMemo(
    () => CATEGORIES.findIndex((c) => c.id === selected),
    [selected],
  );

  // Bulk geometry. Color buffer is mutated per-frame for select dimming + twinkle.
  const bulkGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(build.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(build.baseColors.slice(), 3));
    g.computeBoundingSphere();
    return g;
  }, [build]);

  const fiberGeom = useMemo(() => buildFibers(build), [build]);

  // Streamer pool: head points (bright) + a short trail behind each.
  const TRAIL = 5;
  const streamGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_STREAMERS * TRAIL * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(MAX_STREAMERS * TRAIL * 3), 3));
    return g;
  }, []);
  const streamSprite = useMemo(() => makeGlowSprite(128), []);

  const streamers = useRef<Streamer[]>(
    Array.from({ length: MAX_STREAMERS }, () => ({
      active: false,
      cat: 0,
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
      t: 0,
      speed: 0.4,
      trail: Array.from({ length: TRAIL }, () => new THREE.Vector3()),
    })),
  );
  const spawnAcc = useRef(0);
  const spawnSeed = useRef(1);

  function spawn(s: Streamer) {
    const rand = mulberry32((spawnSeed.current = (spawnSeed.current * 1103515245 + 12345) >>> 0));
    // bias spawns toward the selected lobe so browsing feels "fed"
    let cat: number;
    if (selectedIdx >= 0 && rand() < 0.55) cat = selectedIdx;
    else cat = Math.floor(rand() * CATEGORIES.length);
    const center = build.centers[cat];
    // spawn point far out on a random direction
    const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
    const radius = 3.2 + rand() * 1.6;
    s.from.copy(dir).multiplyScalar(radius);
    // target = lobe center jittered into the blob
    s.to.set(
      center.x + (rand() - 0.5) * 0.4,
      center.y + (rand() - 0.5) * 0.4,
      center.z + (rand() - 0.5) * 0.4,
    );
    s.cat = cat;
    s.t = 0;
    s.speed = 0.42 + rand() * 0.5;
    s.active = true;
    for (const p of s.trail) p.copy(s.from);
  }

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // ---- bulk: twinkle + breathing + selection dimming via vertex colors ----
    const mat = bulkMat.current;
    if (mat) {
      mat.size = 0.05 + Math.sin(time * 0.8) * 0.006;
      mat.opacity = 0.9 + Math.sin(time * 1.2) * 0.08;
    }
    const colAttr = bulkGeom.getAttribute("color") as THREE.BufferAttribute;
    const colArr = colAttr.array as Float32Array;
    const base = build.baseColors;
    const catOf = build.catOf;
    // Only re-touch a rotating slice each frame to keep cost low, plus a global
    // brightness factor per category for selection. We do a full pass but it is
    // cheap arithmetic over ~10.5k entries.
    for (let i = 0; i < BULK; i++) {
      const isSel = selectedIdx < 0 || catOf[i] === selectedIdx;
      const dim = isSel ? 1.0 : 0.18;
      // per-point twinkle
      const tw = 0.85 + 0.3 * Math.sin(time * 1.6 + i * 0.21);
      const sel = isSel && selectedIdx >= 0 ? 1.35 : 1.0;
      const f = dim * tw * sel;
      colArr[i * 3] = base[i * 3] * f;
      colArr[i * 3 + 1] = base[i * 3 + 1] * f;
      colArr[i * 3 + 2] = base[i * 3 + 2] * f;
    }
    colAttr.needsUpdate = true;

    // ---- central memory core pulse ----
    if (coreRef.current) {
      const pulse = 0.62 + Math.sin(time * 1.4) * 0.08 + (firingCount > 0 ? 0.12 : 0);
      coreRef.current.scale.setScalar(pulse);
      const m = coreRef.current.material as THREE.SpriteMaterial;
      m.opacity = 0.7 + Math.sin(time * 1.4) * 0.12;
    }

    // ---- fibers shimmer ----
    if (fiberMat.current) {
      fiberMat.current.opacity = 0.16 + Math.sin(time * 0.6) * 0.05;
    }

    // ---- spawn cadence tied to sim time t + firing ----
    // sim time gives a slow breathing ebb/flow to the intake stream
    const ebb = 1 + 0.35 * Math.sin(t * 0.6);
    const rate = (8 + (firingCount > 0 ? 7 : 0)) * ebb; // streamers per second
    spawnAcc.current += delta * rate;
    while (spawnAcc.current >= 1) {
      spawnAcc.current -= 1;
      const free = streamers.current.find((s) => !s.active);
      if (free) spawn(free);
    }

    // ---- advance streamers, write head + trail points ----
    const spos = streamGeom.getAttribute("position") as THREE.BufferAttribute;
    const scol = streamGeom.getAttribute("color") as THREE.BufferAttribute;
    const sparr = spos.array as Float32Array;
    const scarr = scol.array as Float32Array;
    const cur = new THREE.Vector3();
    for (let si = 0; si < streamers.current.length; si++) {
      const s = streamers.current[si];
      const baseI = si * TRAIL * 3;
      if (!s.active) {
        // park offscreen + dark
        for (let q = 0; q < TRAIL; q++) {
          sparr[baseI + q * 3] = 9999;
          sparr[baseI + q * 3 + 1] = 9999;
          sparr[baseI + q * 3 + 2] = 9999;
          scarr[baseI + q * 3] = 0;
          scarr[baseI + q * 3 + 1] = 0;
          scarr[baseI + q * 3 + 2] = 0;
        }
        continue;
      }
      s.t += delta * s.speed;
      // ease-in toward the lobe (accelerate as it merges)
      const e = s.t * s.t * (3 - 2 * s.t);
      cur.lerpVectors(s.from, s.to, Math.min(1, e));
      // push trail back one slot
      for (let q = TRAIL - 1; q > 0; q--) s.trail[q].copy(s.trail[q - 1]);
      s.trail[0].copy(cur);

      const [cr, cg, cb] = build.catColor[s.cat];
      // fade out near the end as it "merges" into the lobe
      const fade = s.t > 0.82 ? Math.max(0, (1 - s.t) / 0.18) : 1;
      for (let q = 0; q < TRAIL; q++) {
        const p = s.trail[q];
        const taper = (1 - q / TRAIL) * fade;
        sparr[baseI + q * 3] = p.x;
        sparr[baseI + q * 3 + 1] = p.y;
        sparr[baseI + q * 3 + 2] = p.z;
        const head = q === 0 ? 1.4 : 1.0;
        scarr[baseI + q * 3] = Math.min(1, (cr + 0.35) * taper * head);
        scarr[baseI + q * 3 + 1] = Math.min(1, (cg + 0.4) * taper * head);
        scarr[baseI + q * 3 + 2] = Math.min(1, (cb + 0.5) * taper * head);
      }

      if (s.t >= 1) s.active = false;
    }
    spos.needsUpdate = true;
    scol.needsUpdate = true;
  });

  return (
    <group>
      {/* central memory core glow */}
      <sprite ref={coreRef} scale={[0.62, 0.62, 1]} position={[0, 0, 0]}>
        <spriteMaterial
          map={coreSprite}
          color="#bfe0ff"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* connective fibers between lobes */}
      <lineSegments geometry={fiberGeom}>
        <lineBasicMaterial
          ref={fiberMat}
          vertexColors
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* bulk cortex cloud */}
      <points geometry={bulkGeom}>
        <pointsMaterial
          ref={bulkMat}
          map={sprite}
          size={0.052}
          vertexColors
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          alphaTest={0.01}
        />
      </points>

      {/* incoming sorting streamers (head + trail) */}
      <points geometry={streamGeom}>
        <pointsMaterial
          map={streamSprite}
          size={0.085}
          vertexColors
          transparent
          opacity={0.98}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          alphaTest={0.01}
        />
      </points>
    </group>
  );
}

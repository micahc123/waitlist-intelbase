"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "motion/react";
import { useSim } from "@/lib/command/use-sim";
import { makeAmbientSprite } from "./brain/sprite";
import { buildSessions, CATEGORIES } from "./brain/sessions";
import { Cortex } from "./brain/cortex";
import { MemoryPanel } from "./brain/panel";
import "./brain.css";

// Shared mutable rotation target driven by pointer drag (read in useFrame).
interface OrbitState {
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  dragging: boolean;
  zoom: number; // target camera z
  autoSpin: number; // eased auto-spin rate (slows when browsing)
}

// ---------------------------------------------------------------------------
// Ambient central glow + slow wireframe rings, behind the cortex.
// ---------------------------------------------------------------------------
function Ambience() {
  const ring1 = useRef<THREE.LineLoop>(null);
  const ring2 = useRef<THREE.LineLoop>(null);
  const ring3 = useRef<THREE.LineLoop>(null);

  const ambientTex = useMemo(() => makeAmbientSprite(256, "#3a6bd6"), []);

  const ringGeom = useMemo(() => {
    const seg = 128;
    const pts: number[] = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(Math.cos(a), 0, Math.sin(a));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1.current) ring1.current.rotation.y = t * 0.06;
    if (ring2.current) {
      ring2.current.rotation.z = t * 0.04;
      ring2.current.rotation.x = Math.PI / 2.6;
    }
    if (ring3.current) {
      ring3.current.rotation.x = t * 0.05;
      ring3.current.rotation.z = Math.PI / 3;
    }
  });

  return (
    <group>
      <sprite scale={[5.4, 5.4, 1]} position={[0, 0, -0.6]}>
        <spriteMaterial
          map={ambientTex}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <lineLoop ref={ring1} geometry={ringGeom} scale={1.95}>
        <lineBasicMaterial color="#6ea8ff" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineLoop>
      <lineLoop ref={ring2} geometry={ringGeom} scale={2.15}>
        <lineBasicMaterial color="#7df5c8" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineLoop>
      <lineLoop ref={ring3} geometry={ringGeom} scale={2.35}>
        <lineBasicMaterial color="#b79cff" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineLoop>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera zoom driver: ease camera.z toward orbit.zoom.
// ---------------------------------------------------------------------------
function CameraRig({ orbit }: { orbit: React.RefObject<OrbitState> }) {
  const { camera } = useThree();
  useFrame(() => {
    const o = orbit.current;
    if (!o) return;
    camera.position.z += (o.zoom - camera.position.z) * 0.08;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ---------------------------------------------------------------------------
// Rotating group holding the cortex; applies drag + inertia + auto-spin.
// Auto-spin eases down when a region is selected so browsing feels calmer.
// ---------------------------------------------------------------------------
function CortexGroup({
  orbit,
  selected,
  t,
  firingCount,
}: {
  orbit: React.RefObject<OrbitState>;
  selected: string | null;
  t: number;
  firingCount: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    const o = orbit.current;
    if (!g || !o) return;

    // ease auto-spin toward target (slower when browsing a region)
    const targetSpin = selected ? 0.04 : 0.12;
    o.autoSpin += (targetSpin - o.autoSpin) * 0.05;

    if (!o.dragging) {
      o.rotY += o.velY;
      o.rotX += o.velX;
      o.velY *= 0.94;
      o.velX *= 0.94;
      o.rotY += delta * o.autoSpin;
    }
    o.rotX = Math.max(-0.9, Math.min(0.9, o.rotX));

    g.rotation.y += (o.rotY - g.rotation.y) * 0.12;
    g.rotation.x += (o.rotX - g.rotation.x) * 0.12;
  });

  return (
    <group ref={group}>
      <Cortex selected={selected} t={t} firingCount={firingCount} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// A small counter that climbs off sim time (sorted-today stat).
// ---------------------------------------------------------------------------
function useClimbing(t: number, base: number, perSec: number) {
  return base + Math.floor(t * perSec);
}

export function Brain() {
  const { nodes, firing, t } = useSim();
  const firingCount = firing.size;

  const data = useMemo(() => buildSessions(nodes), [nodes]);
  const maxCount = useMemo(
    () => Math.max(...CATEGORIES.map((c) => data.counts[c.id] ?? 0)),
    [data],
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // climbing "sorted today" off sim time
  const sortedToday = useClimbing(t, 1840, 6);

  const orbit = useRef<OrbitState>({
    rotX: 0.16,
    rotY: 0.4,
    velX: 0,
    velY: 0,
    dragging: false,
    zoom: 3.3,
    autoSpin: 0.12,
  });

  const stageRef = useRef<HTMLDivElement>(null);

  // pointer drag -> rotation, wheel -> zoom (only over the canvas area)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let lastX = 0;
    let lastY = 0;

    function onDown(e: PointerEvent) {
      const o = orbit.current;
      o.dragging = true;
      o.velX = 0;
      o.velY = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      try {
        stage!.setPointerCapture?.(e.pointerId);
      } catch {
        /* no-op */
      }
      stage!.classList.add("is-dragging");
    }
    function onMove(e: PointerEvent) {
      const o = orbit.current;
      if (!o.dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      o.rotY += dx * 0.006;
      o.rotX += dy * 0.006;
      o.velY = dx * 0.006;
      o.velX = dy * 0.006;
    }
    function onUp(e: PointerEvent) {
      const o = orbit.current;
      o.dragging = false;
      try {
        stage!.releasePointerCapture?.(e.pointerId);
      } catch {
        /* no-op */
      }
      stage!.classList.remove("is-dragging");
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const o = orbit.current;
      o.zoom *= e.deltaY < 0 ? 0.93 : 1.075;
      o.zoom = Math.max(2.1, Math.min(5.2, o.zoom));
    }

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("wheel", onWheel);
    };
  }, []);

  const chips = [
    { label: "Total sessions", value: data.total.toLocaleString() },
    { label: "Sorted today", value: sortedToday.toLocaleString() },
    { label: "Memory", value: "4.2 GB" },
    { label: "Avg recall", value: "38ms" },
  ];

  return (
    <div className="brain-stage">
      {/* canvas layer captures drag/zoom; panel sits above with its own events */}
      <div ref={stageRef} className="cortex-canvas-layer">
        {mounted ? (
          <Canvas
            className="brain-canvas"
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 3.3], fov: 50, near: 0.1, far: 100 }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <CameraRig orbit={orbit} />
            <Ambience />
            <CortexGroup orbit={orbit} selected={selected} t={t} firingCount={firingCount} />
          </Canvas>
        ) : (
          <div className="brain-backdrop" aria-hidden="true" />
        )}
      </div>

      {/* ----------------------------- HUD HEADER ----------------------------- */}
      <motion.div
        className="cortex-header"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="brain-hud-h1">Memory Cortex</div>
        <div className="cortex-sub">
          {data.total.toLocaleString()} sessions sorted / {CATEGORIES.length} regions / sorting live
        </div>
        <div className="cortex-status">
          <span className="brain-dot live" />
          {firingCount > 0 ? `${firingCount} threads merging` : "live index"}
        </div>

        <div className="cortex-chips">
          {chips.map((c) => (
            <div className="cortex-chip-stat" key={c.label}>
              <div className="cortex-chip-value">{c.value}</div>
              <div className="cortex-chip-label">{c.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ----------------------------- SIDE PANEL ----------------------------- */}
      <motion.div
        className="cortex-panel-wrap"
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
      >
        <MemoryPanel data={data} selected={selected} onSelect={setSelected} maxCount={maxCount} />
      </motion.div>

      {/* ------------------------------- HINT -------------------------------- */}
      <motion.div
        className="brain-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        drag to rotate / scroll to zoom / click a region to browse
      </motion.div>

      <div className="brain-vignette" aria-hidden="true" />
    </div>
  );
}

export default Brain;

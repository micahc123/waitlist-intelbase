"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "motion/react";
import { useSim } from "@/lib/command/use-sim";
import { REGIONS } from "./brain/regions";
import { buildNeurons, Neurons } from "./brain/neurons";
import { Synapses } from "./brain/synapses";
import { makeAmbientSprite } from "./brain/sprite";
import "./brain.css";

// Shared mutable rotation target driven by pointer drag (read in useFrame).
interface OrbitState {
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  dragging: boolean;
  zoom: number; // target camera z
}

// ---------------------------------------------------------------------------
// Ambient central glow + slow wireframe rings, behind the brain.
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
      {/* big soft glow billboard behind the brain */}
      <sprite scale={[5.2, 5.2, 1]} position={[0, 0, -0.6]}>
        <spriteMaterial
          map={ambientTex}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <lineLoop ref={ring1} geometry={ringGeom} scale={1.85}>
        <lineBasicMaterial color="#6ea8ff" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineLoop>
      <lineLoop ref={ring2} geometry={ringGeom} scale={2.05}>
        <lineBasicMaterial color="#7df5c8" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineLoop>
      <lineLoop ref={ring3} geometry={ringGeom} scale={2.25}>
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
// Rotating group with neurons + synapses; applies drag + inertia + auto-spin.
// ---------------------------------------------------------------------------
function BrainGroup({ orbit, firingCount }: { orbit: React.RefObject<OrbitState>; firingCount: number }) {
  const group = useRef<THREE.Group>(null);
  const build = useMemo(() => buildNeurons(), []);

  useFrame((_, delta) => {
    const g = group.current;
    const o = orbit.current;
    if (!g || !o) return;

    if (!o.dragging) {
      // inertia from a recent drag
      o.rotY += o.velY;
      o.rotX += o.velX;
      o.velY *= 0.94;
      o.velX *= 0.94;
      // gentle constant auto-rotate
      o.rotY += delta * 0.12;
    }
    // clamp vertical tilt so it never flips upside down
    o.rotX = Math.max(-0.9, Math.min(0.9, o.rotX));

    g.rotation.y += (o.rotY - g.rotation.y) * 0.12;
    g.rotation.x += (o.rotX - g.rotation.x) * 0.12;
  });

  return (
    <group ref={group}>
      <Neurons build={build} />
      <Synapses build={build} firingCount={firingCount} />
    </group>
  );
}

export function Brain() {
  const { firing } = useSim();
  const firingCount = firing.size;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const orbit = useRef<OrbitState>({
    rotX: 0.18,
    rotY: 0.4,
    velX: 0,
    velY: 0,
    dragging: false,
    zoom: 3.2,
  });

  const stageRef = useRef<HTMLDivElement>(null);

  // pointer drag -> rotation, wheel -> zoom
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
      o.zoom = Math.max(2.0, Math.min(5.0, o.zoom));
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

  return (
    <div ref={stageRef} className="brain-stage">
      {mounted ? (
        <Canvas
          className="brain-canvas"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 3.2], fov: 50, near: 0.1, far: 100 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <CameraRig orbit={orbit} />
          <Ambience />
          <BrainGroup orbit={orbit} firingCount={firingCount} />
        </Canvas>
      ) : (
        <div className="brain-backdrop" aria-hidden="true" />
      )}

      {/* ----------------------------- DOM HUD ----------------------------- */}
      <div className="brain-hud" aria-hidden="true">
        <motion.div
          className="brain-hud-title"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="brain-hud-h1">Neural Brain</div>
          <div className="brain-hud-sub">
            42,000 neurons / 10 regions / structure = growth
          </div>
          <div className="brain-hud-status">
            <span className={`brain-dot ${firingCount > 0 ? "live" : ""}`} />
            {firingCount > 0 ? `${firingCount} synapses firing` : "mesh idle"}
          </div>
        </motion.div>

        <motion.div
          className="brain-legend"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <div className="brain-legend-h">Regions</div>
          {REGIONS.map((r) => (
            <div className="brain-legend-row" key={r.name}>
              <span className="brain-legend-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
              <span className="brain-legend-name">{r.name}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="brain-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          drag to rotate / scroll to zoom
        </motion.div>
      </div>

      <div className="brain-vignette" aria-hidden="true" />
    </div>
  );
}

export default Brain;

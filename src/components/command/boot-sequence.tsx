"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";

// ---------------------------------------------------------------------------
// Phase timing (ms). Tune here. Total ~ 7.5s.
// ---------------------------------------------------------------------------
const T = {
  core: 1600, // 1. wireframe core powers on
  regions: 1400, // 2. regions ignite
  assemble: 2300, // 3. assemble + dissolve
};
const REDUCED_TOTAL = 700; // quick fade when prefers-reduced-motion

type Phase = "core" | "regions" | "assemble" | "done";

const REGIONS = [
  { id: "concept", label: "CONCEPT", angle: -90, color: "#6ea8ff" },
  { id: "routing", label: "ROUTING", angle: -18, color: "#7df5c8" },
  { id: "memory", label: "MEMORY", angle: 54, color: "#b79cff" },
  { id: "recovery", label: "RECOVERY", angle: 126, color: "#ffb86b" },
  { id: "sensory", label: "SENSORY", angle: 198, color: "#67e8f9" },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function BootSequence({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("core");
  const [litRegions, setLitRegions] = useState(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const doneRef = useRef(false);

  const finish = useMemo(
    () => () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone();
    },
    [onDone]
  );

  useEffect(() => {
    const add = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };

    if (reduced) {
      // Quick fade: show core briefly, then dissolve.
      setPhase("assemble");
      setLitRegions(REGIONS.length);
      add(() => setPhase("done"), REDUCED_TOTAL - 200);
      add(finish, REDUCED_TOTAL);
      return () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
      };
    }

    // Phase 1: core powers on immediately (phase mounts as "core")

    // Phase 2: regions - ignite one by one
    add(() => setPhase("regions"), T.core);
    const perRegion = T.regions / (REGIONS.length + 1);
    REGIONS.forEach((_, i) => {
      add(() => setLitRegions(i + 1), T.core + perRegion * (i + 1));
    });

    // Phase 3: assemble + dissolve
    const tAssemble = T.core + T.regions;
    add(() => setPhase("assemble"), tAssemble);
    add(() => setPhase("done"), tAssemble + T.assemble - 200);
    add(finish, tAssemble + T.assemble);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [reduced, finish]);

  const showCore = phase === "core" || phase === "regions" || phase === "assemble";
  const dissolving = phase === "assemble" || phase === "done";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="boot-overlay"
          initial={{ opacity: 1 }}
          animate={
            dissolving
              ? { opacity: 0, scale: 1.06, filter: "blur(6px)" }
              : { opacity: 1, scale: 1, filter: "blur(0px)" }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: dissolving ? (reduced ? 0.35 : 1.1) : 0.3, ease: "easeInOut" }}
          aria-label="Intelbase boot sequence"
        >
          {/* skip */}
          <button className="boot-skip" onClick={finish} type="button">
            skip <Lucide.ChevronsRight size={13} strokeWidth={1.75} />
          </button>

          {/* Phases: wireframe core + regions + dissolve */}
          <AnimatePresence>
            {showCore && (
              <motion.div
                className="boot-core-wrap"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: 1,
                  scale: phase === "assemble" ? 1.12 : 1,
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* bloom flare */}
                <motion.span
                  className="boot-bloom"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: phase === "assemble" ? [0.55, 1, 0] : 0.55,
                    scale: phase === "assemble" ? [1, 1.8, 2.4] : 1,
                  }}
                  transition={{ duration: phase === "assemble" ? 1.1 : 0.9 }}
                />

                <WireframeCore />

                {/* Phase 3: regions */}
                {(phase === "regions" || phase === "assemble") && (
                  <div className="boot-regions">
                    {REGIONS.map((r, i) => {
                      const lit = i < litRegions || phase === "assemble";
                      const rad = 168;
                      const x = Math.cos((r.angle * Math.PI) / 180) * rad;
                      const y = Math.sin((r.angle * Math.PI) / 180) * rad;
                      return (
                        <div key={r.id}>
                          <motion.span
                            className="boot-region-line"
                            style={{
                              ["--rx" as string]: `${x}px`,
                              ["--ry" as string]: `${y}px`,
                              ["--rc" as string]: r.color,
                              rotate: `${r.angle}deg`,
                              width: `${rad}px`,
                            }}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: lit ? 0.7 : 0, scaleX: lit ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                          />
                          <motion.span
                            className="boot-region-dot"
                            style={{
                              ["--rc" as string]: r.color,
                              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: lit ? 1 : 0,
                              scale: lit ? [0, 1.6, 1] : 0,
                            }}
                            transition={{ duration: 0.45 }}
                          />
                          <motion.span
                            className="boot-region-label"
                            style={{
                              ["--rc" as string]: r.color,
                              transform: `translate(calc(-50% + ${x * 1.18}px), calc(-50% + ${y * 1.18}px))`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: lit ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            {r.label}
                          </motion.span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <motion.div
                  className="boot-core-label"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  INTELBASE
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Wireframe geodesic core - a few rotated SVG rings + polygons that spin.
// ---------------------------------------------------------------------------
function WireframeCore() {
  return (
    <motion.svg
      className="boot-core-svg"
      viewBox="-100 -100 200 200"
      width={220}
      height={220}
      animate={{ rotate: 360 }}
      transition={{ duration: 18, ease: "linear", repeat: Infinity }}
    >
      <defs>
        <radialGradient id="boot-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7df5c8" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#6ea8ff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6ea8ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="0" cy="0" r="78" fill="url(#boot-core-glow)" />

      {/* outer ring set, tilted */}
      <g stroke="#6ea8ff" strokeWidth="0.9" fill="none" opacity="0.85">
        <ellipse cx="0" cy="0" rx="80" ry="80" opacity="0.5" />
        <ellipse cx="0" cy="0" rx="80" ry="30" />
        <ellipse cx="0" cy="0" rx="30" ry="80" />
        <ellipse cx="0" cy="0" rx="62" ry="62" transform="rotate(30)" opacity="0.35" />
      </g>

      {/* geodesic polygons */}
      <g stroke="#7df5c8" strokeWidth="0.8" fill="none" opacity="0.7">
        <polygon points="0,-64 55,-32 55,32 0,64 -55,32 -55,-32" />
        <polygon points="0,-64 55,-32 0,0" opacity="0.4" />
        <polygon points="55,32 0,64 0,0" opacity="0.4" />
        <polygon points="-55,32 -55,-32 0,0" opacity="0.4" />
      </g>

      <g stroke="#b79cff" strokeWidth="0.7" fill="none" opacity="0.55">
        <polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" transform="rotate(30)" />
      </g>

      {/* inner core */}
      <circle cx="0" cy="0" r="9" fill="#bfe3ff" opacity="0.95" />
      <circle cx="0" cy="0" r="16" fill="none" stroke="#fff" strokeWidth="0.6" opacity="0.5" />
    </motion.svg>
  );
}

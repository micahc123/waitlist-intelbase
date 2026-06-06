"use client";

import { useEffect, useRef, useState } from "react";
import { useSim } from "@/lib/command/use-sim";
import { project, type Cam, type Projected } from "./projection";
import { Particles } from "./particles";
import { Strands, type StrandsHandle } from "./strands";
import { Nodes, type NodesHandle } from "./nodes";
import "./constellation.css";

export function Constellation() {
  const {
    nodes,
    links,
    domains,
    firing,
    selected,
    setSelected,
    activeDomain,
    t,
  } = useSim();

  const stageRef = useRef<HTMLDivElement | null>(null);
  const strandsRef = useRef<StrandsHandle | null>(null);
  const nodesRef = useRef<NodesHandle | null>(null);

  // hovered is local (changes only on pointer enter/leave) -> cheap re-render
  const [hovered, setHovered] = useState<string | null>(null);

  // Camera lives in a ref; driven imperatively each frame.
  const camRef = useRef<Cam>({ az: 0.6, el: -0.28, zoom: 1 });
  const sizeRef = useRef({ w: 0, h: 0 });

  // Drag state
  const dragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({ active: false, lastX: 0, lastY: 0, moved: false });

  // Idle auto-rotate gate: pause drift briefly after interaction.
  const lastInteractRef = useRef(0);

  // Mirror sim values into refs so the rAF loop reads fresh values without
  // re-subscribing every frame.
  const simRef = useRef({ firing, selected, activeDomain, t });
  simRef.current = { firing, selected, activeDomain, t };
  const hoveredRef = useRef<string | null>(null);
  hoveredRef.current = hovered;

  // Focus camera target when selection changes (ease az/el to center the node).
  const focusTargetRef = useRef<{ az: number; el: number } | null>(null);
  useEffect(() => {
    if (!selected) {
      focusTargetRef.current = null;
      return;
    }
    const node = nodes.find((n) => n.id === selected);
    if (!node) return;
    // Choose az/el that bring this node toward the front-center.
    const { x, y, z } = node.pos;
    const targetAz = -Math.atan2(x, z);
    const targetEl = Math.atan2(y, Math.hypot(x, z) || 0.0001) * 0.6;
    focusTargetRef.current = { az: targetAz, el: Math.max(-0.7, Math.min(0.7, targetEl)) };
  }, [selected, nodes]);

  // Size tracking
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      sizeRef.current = { w: stage.clientWidth, h: stage.clientHeight };
    });
    ro.observe(stage);
    sizeRef.current = { w: stage.clientWidth, h: stage.clientHeight };
    return () => ro.disconnect();
  }, []);

  // Pointer + wheel interaction
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function onPointerDown(e: PointerEvent) {
      // node pointerdowns are stopped; this fires for empty stage drags
      dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: false };
      lastInteractRef.current = performance.now();
      try { stage!.setPointerCapture?.(e.pointerId); } catch { /* no-op */ }
      stage!.classList.add("is-dragging");
    }
    function onPointerMove(e: PointerEvent) {
      const d = dragRef.current;
      if (!d.active) return;
      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
      const cam = camRef.current;
      cam.az += dx * 0.006;
      cam.el += dy * 0.006;
      cam.el = Math.max(-1.2, Math.min(1.2, cam.el));
      lastInteractRef.current = performance.now();
      focusTargetRef.current = null; // manual control overrides focus ease
    }
    function endDrag(e: PointerEvent) {
      const d = dragRef.current;
      d.active = false;
      try { stage!.releasePointerCapture?.(e.pointerId); } catch { /* no-op */ }
      stage!.classList.remove("is-dragging");
      // clicking empty space (no drag) clears selection
      if (!d.moved && (e.target === stage || (e.target as HTMLElement)?.classList?.contains("cst-vignette"))) {
        setSelected(null);
      }
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const cam = camRef.current;
      cam.zoom *= e.deltaY < 0 ? 1.08 : 0.926;
      cam.zoom = Math.max(0.6, Math.min(2.6, cam.zoom));
      lastInteractRef.current = performance.now();
    }

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", endDrag);
      stage.removeEventListener("pointercancel", endDrag);
      stage.removeEventListener("wheel", onWheel);
    };
  }, [setSelected]);

  // Master rAF loop: project + apply to children. No React state per frame.
  useEffect(() => {
    let raf = 0;
    const projMap = new Map<string, Projected>();

    function frame() {
      raf = requestAnimationFrame(frame);
      const cam = camRef.current;
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) return;

      const now = performance.now();
      const idle = now - lastInteractRef.current > 2200;

      // ease toward focus target if set
      const focus = focusTargetRef.current;
      if (focus) {
        cam.az += (focus.az - cam.az) * 0.06;
        cam.el += (focus.el - cam.el) * 0.06;
        if (Math.abs(focus.az - cam.az) < 0.002 && Math.abs(focus.el - cam.el) < 0.002) {
          focusTargetRef.current = null;
        }
      } else if (idle && !dragRef.current.active) {
        // cinematic idle drift (slow enough that clicks land reliably)
        cam.az += 0.0009;
      }

      // project all nodes
      projMap.clear();
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        projMap.set(n.id, project(n.pos, cam, w, h));
      }

      const s = simRef.current;
      const sctx = {
        firing: s.firing,
        selected: s.selected,
        hovered: hoveredRef.current,
        activeDomain: s.activeDomain,
        t: s.t,
      };

      strandsRef.current?.apply(projMap, sctx);
      nodesRef.current?.apply(projMap, sctx);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [nodes]);

  return (
    <div ref={stageRef} className="cst-stage">
      <Particles />
      <Strands ref={strandsRef} links={links} nodes={nodes} domains={domains} />
      <Nodes
        ref={nodesRef}
        nodes={nodes}
        domains={domains}
        hovered={hovered}
        onHover={setHovered}
        onSelect={setSelected}
      />
      <div className="cst-vignette" aria-hidden="true" />
    </div>
  );
}

export default Constellation;

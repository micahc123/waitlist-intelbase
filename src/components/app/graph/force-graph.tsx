// Reusable Obsidian-vault-style force-directed graph.
//
// One <canvas>, one rAF loop, a hand-rolled 2D force simulation (no d3, no deps):
// Coulomb repulsion between every node pair, Hooke spring along each link, a mild
// gravity toward centre, and velocity damping. Integrated with velocity Verlet.
// It runs a few hundred warm-up ticks to settle a stable layout, then idles with
// a gentle drift; dragging a node re-energises the sim briefly. Everything that
// changes per frame lives in refs, so React never re-renders during animation.
//
// Rendering is Obsidian-flavoured: hairline links (brighter near the hovered or
// selected node), glowing filled circles sized by `size` and coloured by `color`
// (or by `kind`), labels in the product font that stay hidden for small/distant
// nodes until you hover. Hovering a node highlights it and its neighbours and
// dims the rest. Click selects (-> onSelect) and draws a focus ring.
//
// Respects prefers-reduced-motion: the warm-up runs synchronously to a settled
// layout and the idle drift is switched off, so the graph is static but laid out.

"use client";

import { useCallback, useEffect, useRef } from "react";
import "./force-graph.css";

export type GraphNode = {
  id: string;
  label: string;
  kind: string;
  color?: string;
  size?: number;
};

export type GraphLink = { source: string; target: string };

type Props = {
  nodes: GraphNode[];
  links: GraphLink[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  height?: number;
};

// Default colours per kind, drawn from the product accent tokens.
const KIND_COLOR: Record<string, string> = {
  core: "#6ea8ff", // --ib-blue
  agent: "#b79cff", // --ib-violet
  toolkit: "#7e879d", // --ib-text-3 (muted)
  doc: "#7df5c8", // --ib-mint
  topic: "#7e879d", // muted
};

function colorFor(n: GraphNode): string {
  return n.color ?? KIND_COLOR[n.kind] ?? "#6ea8ff";
}

// Internal mutable particle for the sim. x/y position, vx/vy velocity, and a
// short-lived pin (set on drag) so a grabbed node holds its place.
type Particle = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pinned: boolean;
};

// Canvas cannot read CSS custom properties, so resolve the product font once
// from the document root and fall back to a sane system stack.
const LABEL_FONT_FALLBACK = "ui-sans-serif, system-ui, sans-serif";
let LABEL_FONT = LABEL_FONT_FALLBACK;
function resolveLabelFont() {
  if (typeof window === "undefined") return;
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--ib-font")
      .trim();
    if (v) LABEL_FONT = v;
  } catch {
    /* keep fallback */
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function ForceGraph({
  nodes,
  links,
  onSelect,
  selectedId,
  height = 460,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Sim + view state held in refs so the animation loop never touches React.
  const partsRef = useRef<Particle[]>([]);
  const partIndexRef = useRef<Map<string, Particle>>(new Map());
  const adjacencyRef = useRef<Map<string, Set<string>>>(new Map());
  const nodesRef = useRef<GraphNode[]>(nodes);
  const linksRef = useRef<GraphLink[]>(links);
  const selectedRef = useRef<string | null>(selectedId ?? null);
  const hoverRef = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);

  const viewRef = useRef({ scale: 1, ox: 0, oy: 0 });
  const sizeRef = useRef({ w: 0, h: height, dpr: 1 });
  const alphaRef = useRef(1); // sim "energy"; high = active, settles toward idle
  const rafRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  // Pointer interaction state.
  const dragRef = useRef<{
    kind: "node" | "pan" | null;
    node: Particle | null;
    lastX: number;
    lastY: number;
    moved: boolean;
    downId: string | null;
  }>({ kind: null, node: null, lastX: 0, lastY: 0, moved: false, downId: null });

  onSelectRef.current = onSelect;
  selectedRef.current = selectedId ?? null;

  // Structural signatures: rebuild the sim only when the set of node ids or the
  // set of links actually changes (not on every object-identity change).
  const nodeSig = nodes.map((nd) => nd.id).join("|");
  const linkSig = links.map((l) => `${l.source}>${l.target}`).join("|");

  // (Re)build the particle set whenever the node/link identity set changes. We
  // preserve positions for nodes that persist so toggling selection or data
  // tweaks do not reshuffle the whole layout.
  useEffect(() => {
    nodesRef.current = nodes;
    linksRef.current = links;
    reducedRef.current = prefersReducedMotion();
    resolveLabelFont();

    const prev = partIndexRef.current;
    const next: Particle[] = [];
    const index = new Map<string, Particle>();

    // Seed positions on a loose ring so the first settle is quick and stable.
    const n = nodes.length || 1;
    nodes.forEach((node, i) => {
      const existing = prev.get(node.id);
      const angle = (i / n) * Math.PI * 2;
      const r = 120 + (i % 5) * 26;
      const p: Particle = existing ?? {
        id: node.id,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        size: node.size ?? 6,
        pinned: false,
      };
      p.size = node.size ?? 6;
      p.pinned = false;
      next.push(p);
      index.set(node.id, p);
    });

    // Adjacency for hover/selection neighbour highlighting.
    const adj = new Map<string, Set<string>>();
    nodes.forEach((nd) => adj.set(nd.id, new Set()));
    links.forEach((l) => {
      adj.get(l.source)?.add(l.target);
      adj.get(l.target)?.add(l.source);
    });

    partsRef.current = next;
    partIndexRef.current = index;
    adjacencyRef.current = adj;
    alphaRef.current = 1;

    // Reduced motion: settle synchronously so we still get a real layout.
    if (reducedRef.current) {
      for (let i = 0; i < 320; i++) tick(0.9);
      alphaRef.current = 0;
      draw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeSig, linkSig]);

  // One physics step. dt scales the integration; alpha cools the system.
  const tick = useCallback((dtScale: number) => {
    const parts = partsRef.current;
    const alpha = alphaRef.current;
    if (parts.length === 0) return;

    const REPULSION = 5200;
    const SPRING = 0.02;
    const REST = 86;
    const GRAVITY = 0.012;
    const DAMP = 0.86;
    const MAX_V = 26;

    // Coulomb repulsion (O(n^2) - fine for <= ~120 nodes).
    for (let i = 0; i < parts.length; i++) {
      const a = parts[i];
      for (let j = i + 1; j < parts.length; j++) {
        const b = parts[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = (Math.random() - 0.5) * 0.5;
          dy = (Math.random() - 0.5) * 0.5;
          d2 = dx * dx + dy * dy + 0.01;
        }
        const d = Math.sqrt(d2);
        const f = (REPULSION / d2) * alpha;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Hooke springs along links.
    const index = partIndexRef.current;
    const links = linksRef.current;
    for (const l of links) {
      const a = index.get(l.source);
      const b = index.get(l.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - REST) * SPRING * alpha;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Gravity toward origin + integrate (velocity Verlet style: v then x).
    for (const p of parts) {
      if (p.pinned) {
        p.vx = 0;
        p.vy = 0;
        continue;
      }
      p.vx += -p.x * GRAVITY * alpha;
      p.vy += -p.y * GRAVITY * alpha;
      p.vx *= DAMP;
      p.vy *= DAMP;
      // clamp velocity for stability
      if (p.vx > MAX_V) p.vx = MAX_V;
      else if (p.vx < -MAX_V) p.vx = -MAX_V;
      if (p.vy > MAX_V) p.vy = MAX_V;
      else if (p.vy < -MAX_V) p.vy = -MAX_V;
      p.x += p.vx * dtScale;
      p.y += p.vy * dtScale;
    }

    // Cool the system toward a gentle idle (or fully stop if reduced motion).
    alphaRef.current = Math.max(reducedRef.current ? 0 : 0.04, alpha * 0.985);
  }, []);

  // Map a world point to screen and back (account for pan/zoom + centre + dpr).
  const worldToScreen = useCallback((x: number, y: number) => {
    const { scale, ox, oy } = viewRef.current;
    const { w, h } = sizeRef.current;
    return {
      x: (x + ox) * scale + w / 2,
      y: (y + oy) * scale + h / 2,
    };
  }, []);

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const { scale, ox, oy } = viewRef.current;
    const { w, h } = sizeRef.current;
    return {
      x: (sx - w / 2) / scale - ox,
      y: (sy - h / 2) / scale - oy,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h, dpr } = sizeRef.current;
    const { scale } = viewRef.current;
    const parts = partsRef.current;
    const nodes = nodesRef.current;
    const adj = adjacencyRef.current;
    const hover = hoverRef.current;
    const selected = selectedRef.current;

    const focus = hover ?? selected;
    const neighbours = focus ? adj.get(focus) : null;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Links first, beneath nodes.
    ctx.lineWidth = 1;
    for (const l of linksRef.current) {
      const a = partIndexRef.current.get(l.source);
      const b = partIndexRef.current.get(l.target);
      if (!a || !b) continue;
      const pa = worldToScreen(a.x, a.y);
      const pb = worldToScreen(b.x, b.y);
      const connected =
        focus && (l.source === focus || l.target === focus);
      const dim = focus && !connected;
      ctx.strokeStyle = connected
        ? "rgba(174, 182, 204, 0.45)"
        : dim
          ? "rgba(255, 255, 255, 0.025)"
          : "rgba(255, 255, 255, 0.07)";
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    // Nodes.
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const node = nodes[i];
      if (!node) continue;
      const s = worldToScreen(p.x, p.y);
      const radius = Math.max(2.5, p.size * Math.min(scale, 1.4));
      const isFocus = focus === node.id;
      const isNeighbour = Boolean(neighbours && neighbours.has(node.id));
      const isSelected = selected === node.id;
      const dim = Boolean(focus) && !isFocus && !isNeighbour;
      const col = colorFor(node);
      const alpha = dim ? 0.22 : 1;

      // Additive glow halo (restrained).
      ctx.globalCompositeOperation = "lighter";
      const glowR = radius * (isFocus ? 4.4 : 2.8);
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
      grad.addColorStop(0, withAlpha(col, (isFocus ? 0.5 : 0.28) * alpha));
      grad.addColorStop(1, withAlpha(col, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // Core disc.
      ctx.fillStyle = withAlpha(col, alpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Crisp rim.
      ctx.lineWidth = 1;
      ctx.strokeStyle = withAlpha("#05060b", 0.6 * alpha);
      ctx.stroke();

      // Selected / focus ring.
      if (isSelected || isFocus) {
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.strokeStyle = withAlpha(col, isSelected ? 0.95 : 0.7);
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius + (isSelected ? 5 : 3.5), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Labels: show for big nodes always; small/distant nodes only on focus
      // (Obsidian behaviour). Skip if dimmed.
      const showLabel =
        !dim &&
        (isFocus ||
          isNeighbour ||
          isSelected ||
          (p.size >= 9 && scale > 0.75) ||
          scale > 1.6);
      if (showLabel) {
        const fontSize = Math.max(10, Math.min(13, 11 * Math.min(scale, 1.3)));
        ctx.font = `600 ${fontSize}px ${LABEL_FONT}`;
        const labelY = s.y + radius + 5;
        const text =
          node.label.length > 28 ? node.label.slice(0, 27) + "…" : node.label;
        // subtle shadow plate for legibility
        ctx.fillStyle = "rgba(232, 236, 246, " + (isFocus ? "0.96" : "0.78") + ")";
        ctx.fillText(text, s.x, labelY);
      }
    }

    ctx.restore();
  }, [worldToScreen]);

  // Main animation loop.
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      if (!reducedRef.current) {
        tick(1);
        draw();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    if (reducedRef.current) {
      draw();
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick, draw]);

  // Size to container, dpr-aware, with a ResizeObserver.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(240, rect.width);
      const h = height;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      draw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [height, draw]);

  // Redraw immediately when selection changes from outside.
  useEffect(() => {
    selectedRef.current = selectedId ?? null;
    draw();
  }, [selectedId, draw]);

  // ---- pointer helpers -----------------------------------------------------

  const pickNode = useCallback(
    (sx: number, sy: number): Particle | null => {
      const parts = partsRef.current;
      // iterate in reverse so topmost (last drawn) wins
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const s = worldToScreen(p.x, p.y);
        const r = Math.max(8, p.size * Math.min(viewRef.current.scale, 1.4) + 6);
        const dx = sx - s.x;
        const dy = sy - s.y;
        if (dx * dx + dy * dy <= r * r) return p;
      }
      return null;
    },
    [worldToScreen],
  );

  const localPoint = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const { x, y } = localPoint(e);
      const node = pickNode(x, y);
      if (node) {
        node.pinned = true;
        alphaRef.current = Math.max(alphaRef.current, 0.7);
        dragRef.current = {
          kind: "node",
          node,
          lastX: x,
          lastY: y,
          moved: false,
          downId: node.id,
        };
      } else {
        dragRef.current = {
          kind: "pan",
          node: null,
          lastX: x,
          lastY: y,
          moved: false,
          downId: null,
        };
      }
    },
    [localPoint, pickNode],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = localPoint(e);
      const drag = dragRef.current;

      if (drag.kind === "node" && drag.node) {
        const world = screenToWorld(x, y);
        drag.node.x = world.x;
        drag.node.y = world.y;
        drag.node.vx = 0;
        drag.node.vy = 0;
        drag.moved =
          drag.moved ||
          Math.abs(x - drag.lastX) > 3 ||
          Math.abs(y - drag.lastY) > 3;
        alphaRef.current = Math.max(alphaRef.current, 0.5);
        return;
      }
      if (drag.kind === "pan") {
        const dx = x - drag.lastX;
        const dy = y - drag.lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.moved = true;
        viewRef.current.ox += dx / viewRef.current.scale;
        viewRef.current.oy += dy / viewRef.current.scale;
        drag.lastX = x;
        drag.lastY = y;
        draw();
        return;
      }

      // Hover detection (no active drag).
      const node = pickNode(x, y);
      const id = node ? node.id : null;
      if (id !== hoverRef.current) {
        hoverRef.current = id;
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = id ? "pointer" : "grab";
        draw();
      }
    },
    [localPoint, pickNode, screenToWorld, draw],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (drag.kind === "node" && drag.node) {
        // Release pin shortly after so it re-joins the sim; click = no move.
        const node = drag.node;
        if (!drag.moved && drag.downId) {
          onSelectRef.current?.(drag.downId);
        }
        window.setTimeout(() => {
          node.pinned = false;
          alphaRef.current = Math.max(alphaRef.current, 0.4);
        }, 220);
      }
      dragRef.current = {
        kind: null,
        node: null,
        lastX: 0,
        lastY: 0,
        moved: false,
        downId: null,
      };
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = hoverRef.current ? "pointer" : "grab";
    },
    [],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const { x, y } = localPoint(e);
      const before = screenToWorld(x, y);
      const factor = Math.exp(-e.deltaY * 0.0012);
      const next = Math.min(2.6, Math.max(0.35, viewRef.current.scale * factor));
      viewRef.current.scale = next;
      // keep the point under the cursor stable
      const after = screenToWorld(x, y);
      viewRef.current.ox += after.x - before.x;
      viewRef.current.oy += after.y - before.y;
      draw();
    },
    [localPoint, screenToWorld, draw],
  );

  return (
    <div className="fg-wrap" ref={wrapRef} style={{ height }}>
      <canvas
        ref={canvasRef}
        className="fg-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (dragRef.current.kind) endDrag(e);
          if (hoverRef.current) {
            hoverRef.current = null;
            draw();
          }
        }}
        onWheel={onWheel}
        role="img"
        aria-label="Interactive force-directed graph. Drag nodes, scroll to zoom, click a node to select."
      />
    </div>
  );
}

// Convert a hex (#rrggbb) to rgba() with the given alpha. Falls back to the
// input unchanged for non-hex strings (already rgba/var() etc).
function withAlpha(hex: string, alpha: number): string {
  if (hex[0] !== "#" || hex.length < 7) {
    return hex;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

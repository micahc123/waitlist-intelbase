"use client";

import { useEffect, useRef } from "react";

// Slow drifting starfield / motes. Additive, faint blue/violet. Pure ambiance.
// rAF loop, devicePixelRatio aware, resizes with the stage via ResizeObserver.

type Mote = {
  x: number;
  y: number;
  z: number; // pseudo-depth 0..1 for parallax + size
  r: number;
  hue: number; // 0 = blue, 1 = violet
  tw: number; // twinkle phase
  big: boolean; // brighter, larger glow motes for spread + atmosphere
};

const COUNT = 640;

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motesRef = useRef<Mote[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // seed motes (deterministic-ish, fine for ambiance)
    if (motesRef.current.length === 0) {
      const m: Mote[] = [];
      for (let i = 0; i < COUNT; i++) {
        const big = Math.random() < 0.15;
        m.push({
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          r: (0.5 + Math.random() * 2.1) * (big ? 2.6 : 1),
          hue: Math.random(),
          tw: Math.random() * Math.PI * 2,
          big,
        });
      }
      motesRef.current = m;
    }

    function resize() {
      if (!parent || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const { w, h, dpr } = sizeRef.current;
      if (!ctx || w === 0 || h === 0) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const motes = motesRef.current;
      for (let i = 0; i < motes.length; i++) {
        const p = motes[i];
        // parallax drift: nearer motes drift faster
        p.x += dt * (0.004 + p.z * 0.012);
        p.y += dt * (0.002 + p.z * 0.006) * 0.4;
        if (p.x > 1.05) p.x -= 1.1;
        if (p.y > 1.05) p.y -= 1.1;
        p.tw += dt * (0.6 + p.z);

        const px = p.x * w;
        const py = p.y * h;
        const size = p.r * (0.6 + p.z);
        const twinkle = 0.5 + 0.5 * Math.sin(p.tw);
        const glowAlpha = (0.06 + p.z * 0.26) * (0.45 + 0.55 * twinkle) * (p.big ? 1.4 : 1);
        const radius = size * (p.big ? 5.2 : 3.4);

        // blue -> violet blend (big motes lean a touch mint for spread variety)
        const rC = Math.round(110 + p.hue * 73);
        const gC = Math.round(168 - p.hue * 12 + (p.big ? 28 : 0));
        const bC = 255;

        // soft glow halo
        const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
        grad.addColorStop(0, `rgba(${rC}, ${gC}, ${bC}, ${glowAlpha})`);
        grad.addColorStop(0.5, `rgba(${rC}, ${gC}, ${bC}, ${(glowAlpha * 0.32).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${rC}, ${gC}, ${bC}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // crisp glowing core
        const coreA = Math.min(0.92, glowAlpha * 3.2);
        ctx.fillStyle = `rgba(${Math.min(255, rC + 60)}, ${Math.min(255, gC + 50)}, 255, ${coreA.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, size * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="cst-particles" aria-hidden="true" />;
}

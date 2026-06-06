import * as THREE from "three";

// Generate a soft round glow sprite on a 2D canvas (radial gradient) and wrap
// it as a CanvasTexture. Used as the `map` on the additive PointsMaterial so
// each neuron renders as a soft bloom dot - a bloom-like glow with zero extra
// dependencies.
export function makeGlowSprite(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const grd = ctx.createRadialGradient(c, c, 0, c, c, c);
  grd.addColorStop(0.0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, "rgba(255,255,255,0.92)");
  grd.addColorStop(0.42, "rgba(255,255,255,0.35)");
  grd.addColorStop(0.72, "rgba(255,255,255,0.08)");
  grd.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  // Three r0.183: SRGBColorSpace lives on THREE.
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A larger, softer sprite used for the central ambient glow behind the brain.
export function makeAmbientSprite(size = 256, hex = "#3a6bd6"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const grd = ctx.createRadialGradient(c, c, 0, c, c, c);
  grd.addColorStop(0.0, hexA(hex, 0.85));
  grd.addColorStop(0.3, hexA(hex, 0.32));
  grd.addColorStop(0.6, hexA(hex, 0.08));
  grd.addColorStop(1.0, hexA(hex, 0));
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

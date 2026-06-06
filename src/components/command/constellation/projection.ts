// ----------------------------------------------------------------------------
// 2.5D projection: rotate 3D node positions, project to screen with perspective.
// Pure math, no React. Driven per-frame by the constellation orchestrator.
// ----------------------------------------------------------------------------

export type Vec3 = { x: number; y: number; z: number };

export type Cam = {
  az: number; // azimuth, radians, rotation around Y
  el: number; // elevation, radians, rotation around X
  zoom: number; // 0.6 .. 2.4, larger = closer
};

export type Projected = {
  x: number; // screen x (px, centered origin offset applied)
  y: number; // screen y (px)
  scale: number; // 0.4 .. 1.4 by depth (near = bigger)
  depth: number; // rotated z, for sorting + fog (smaller = nearer/in front)
};

// Rotate a position by azimuth (around Y) then elevation (around X).
export function rotate(pos: Vec3, az: number, el: number): Vec3 {
  const ca = Math.cos(az);
  const sa = Math.sin(az);
  // azimuth around Y
  const x1 = pos.x * ca + pos.z * sa;
  const z1 = -pos.x * sa + pos.z * ca;
  const y1 = pos.y;
  // elevation around X
  const ce = Math.cos(el);
  const se = Math.sin(el);
  const y2 = y1 * ce - z1 * se;
  const z2 = y1 * se + z1 * ce;
  return { x: x1, y: y2, z: z2 };
}

// Project a rotated point onto the screen. Stable perspective: far nodes
// (larger z after rotation, pushed back) become smaller. The camera sits at
// negative z looking toward +z, so we add a constant to keep f positive.
export function project(pos: Vec3, cam: Cam, w: number, h: number): Projected {
  const r = rotate(pos, cam.az, cam.el);

  // Perspective: viewer distance grows as zoom shrinks. depth axis is r.z.
  // r.z lives in roughly [-1.4, 1.4]. Push the world back by camDist.
  const camDist = 3.2;
  const fov = 2.0; // focal-ish constant
  const denom = camDist - r.z; // nearer (smaller z) -> smaller denom -> bigger
  const persp = fov / (denom <= 0.2 ? 0.2 : denom);

  // Base radius in px (how far one world-unit maps), scaled by viewport + zoom.
  const minDim = Math.min(w, h);
  const spread = minDim * 0.52 * cam.zoom;

  const sx = w / 2 + r.x * spread * persp;
  const sy = h / 2 - r.y * spread * persp;

  // scale derived from perspective, clamped to a pleasing range.
  const rawScale = persp * 0.62 * cam.zoom;
  const scale = Math.max(0.4, Math.min(1.4, rawScale));

  return { x: sx, y: sy, scale, depth: r.z };
}

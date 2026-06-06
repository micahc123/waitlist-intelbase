import type { Vec3 } from "./types";

/** Deterministic pseudo-random 0..1 from a seed integer. */
export function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Smooth oscillation around a base value.
 * @param seed  - per-node seed for phase offset
 * @param t     - current time in seconds
 * @param base  - center value
 * @param amp   - amplitude (max deviation from base)
 * @param freq  - oscillation frequency in Hz (default 0.3)
 */
export function wobble(
  seed: number,
  t: number,
  base: number,
  amp: number,
  freq = 0.3,
): number {
  const phase = seededRand(seed) * Math.PI * 2;
  return base + amp * Math.sin(t * freq * Math.PI * 2 + phase);
}

/**
 * Generates a smooth rising sparkline series.
 * Values start near `base` and end near `end`, with gentle noise.
 */
export function risingSeries(
  seed: number,
  points: number,
  base: number,
  end: number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    // Smooth eased interpolation (ease-in-out cubic)
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const noise = (seededRand(seed * 100 + i) - 0.5) * (end - base) * 0.12;
    result.push(base + (end - base) * eased + noise);
  }
  return result;
}

/**
 * Returns a unit Vec3 on a sphere using the Fibonacci sphere algorithm.
 * Distributes `n` points evenly using the golden angle.
 */
export function fibSphere(i: number, n: number): Vec3 {
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const theta = Math.acos(1 - (2 * (i + 0.5)) / n);
  const phi = (2 * Math.PI * i) / goldenRatio;
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.cos(theta),
    z: Math.sin(theta) * Math.sin(phi),
  };
}

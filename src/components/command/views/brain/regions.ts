// Brain region definitions: 10 clusters positioned around an ellipsoid so the
// overall point field reads as a rounded brain. Each region is a gaussian blob.
// Colors use the intelbase neon palette.

export interface Region {
  name: string;
  color: string; // hex
  // cluster center, in a roughly unit-ish brain space (will be scaled by the
  // brain ellipsoid radii at build time)
  center: [number, number, number];
  spread: number; // gaussian sigma for the blob
  weight: number; // relative share of total neurons
}

// rgb tuples are derived at runtime from these hex strings.
export const REGIONS: Region[] = [
  { name: "Concept", color: "#6ea8ff", center: [0.0, 0.55, 0.62], spread: 0.34, weight: 1.15 },
  { name: "Prefrontal", color: "#7df5c8", center: [0.0, 0.32, 0.95], spread: 0.36, weight: 1.2 },
  { name: "Cerebellum", color: "#b79cff", center: [0.0, -0.78, -0.78], spread: 0.32, weight: 0.95 },
  { name: "Sensory", color: "#ffb86b", center: [0.62, 0.18, 0.12], spread: 0.3, weight: 1.0 },
  { name: "Association", color: "#ff8fb1", center: [-0.62, 0.18, 0.12], spread: 0.3, weight: 1.0 },
  { name: "Memory", color: "#67e8f9", center: [0.5, -0.32, -0.45], spread: 0.3, weight: 0.95 },
  { name: "Routing", color: "#8b9cff", center: [-0.5, -0.32, -0.45], spread: 0.3, weight: 0.95 },
  { name: "Recovery", color: "#5ee0b0", center: [0.0, -0.2, -1.0], spread: 0.33, weight: 0.9 },
  { name: "Planning", color: "#ffa1c4", center: [0.36, 0.62, -0.2], spread: 0.3, weight: 0.9 },
  { name: "Language", color: "#c4a2ff", center: [-0.36, 0.62, -0.2], spread: 0.3, weight: 0.9 },
];

// Ellipsoid radii that turn the unit cluster space into a brain-ish volume.
// Wider than tall, slightly longer front-to-back.
export const BRAIN_RADII: [number, number, number] = [0.92, 0.78, 1.12];

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

import type { ScreenId } from "@/lib/os-demo/types";
import { Overview } from "./overview";
import { Concierge } from "./concierge";
import { Pipeline } from "./pipeline";
import { Nurture } from "./nurture";
import { AdEngine } from "./ad-engine";
import { Modules } from "./modules";

export type Registered = {
  id: ScreenId;
  label: string;
  Component: React.ComponentType;
};

// Append future screens here as later tasks land them.
export const SCREENS: Registered[] = [
  { id: "overview", label: "Overview", Component: Overview },
  { id: "concierge", label: "Concierge", Component: Concierge },
  { id: "pipeline", label: "Pipeline", Component: Pipeline },
  { id: "nurture", label: "Nurture", Component: Nurture },
  { id: "ad-engine", label: "Ad Engine", Component: AdEngine },
  { id: "modules", label: "Agents", Component: Modules },
];

import type { ScreenId } from "@/lib/os-demo/types";
import { Overview } from "./overview";

export type Registered = {
  id: ScreenId;
  label: string;
  Component: React.ComponentType;
};

// Append future screens here as later tasks land them.
export const SCREENS: Registered[] = [
  { id: "overview", label: "Overview", Component: Overview },
];

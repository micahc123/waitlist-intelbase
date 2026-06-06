"use client";

import { useSim } from "@/lib/command/use-sim";
import type { ViewId } from "@/lib/command/types";

const TABS: Array<{ id: ViewId; label: string }> = [
  { id: "agents", label: "Agents" },
  { id: "brain", label: "Brain" },
  { id: "deck", label: "Deck" },
  { id: "team", label: "Team" },
  { id: "usage", label: "Usage" },
  { id: "settings", label: "Settings" },
];

export function TopTabs() {
  const { view, setView } = useSim();

  return (
    <nav className="cmd-tabs" aria-label="Views">
      {TABS.map((tab, i) => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`cmd-tab${active ? " is-active" : ""}`}
            aria-pressed={active}
            onClick={() => setView(tab.id)}
          >
            <span className="cmd-tab-badge">{i + 1}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

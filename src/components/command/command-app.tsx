"use client";

import "./command.css";
import { useEffect } from "react";
import { SimProvider, useSim } from "@/lib/command/use-sim";
import type { ViewId } from "@/lib/command/types";
import { TopTabs } from "./top-tabs";
import { Hud } from "./hud";
import { DomainRail } from "./domain-rail";
import { LiveFeed } from "./live-feed";
import { CommandBar } from "./command-bar";
import { DetailPanel } from "./detail-panel";
import { Constellation } from "./constellation/constellation";

const VIEW_ORDER: ViewId[] = ["agents", "brain", "deck", "team", "usage", "settings"];

function Shell() {
  const { setView, setSelected } = useSim();

  // Keyboard: 1..6 switch views, Escape clears selection
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const target = ev.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (ev.key === "Escape") {
        setSelected(null);
        return;
      }
      const n = Number(ev.key);
      if (n >= 1 && n <= 6) {
        setView(VIEW_ORDER[n - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setView, setSelected]);

  return (
    <div className="cmd-root">
      {/* TOP BAR */}
      <header className="cmd-topbar">
        <div className="cmd-brand">
          <span className="cmd-mark">
            <span />
          </span>
          <span className="cmd-wordmark">Intelbase</span>
          <span className="cmd-build">v2.6.0 / core-α</span>
        </div>
        <TopTabs />
        <div className="cmd-topbar-spacer" />
        <Hud />
      </header>

      {/* BODY */}
      <div className="cmd-body">
        <DomainRail />
        <div className="cmd-stage">
          {/* HUD corner accents */}
          <span className="cmd-corner cmd-corner--tl" />
          <span className="cmd-corner cmd-corner--tr" />
          <span className="cmd-corner cmd-corner--bl" />
          <span className="cmd-corner cmd-corner--br" />

          {/* Live 2.5D constellation */}
          <Constellation />

          {/* Floating live feed over the left of the stage */}
          <LiveFeed />

          {/* Slide-in detail panel (only when a node is selected) */}
          <DetailPanel />
        </div>
      </div>

      {/* BOTTOM */}
      <CommandBar />
    </div>
  );
}

export function CommandApp() {
  return (
    <SimProvider>
      <Shell />
    </SimProvider>
  );
}

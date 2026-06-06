"use client";

import "./command.css";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";
import { SimProvider, useSim } from "@/lib/command/use-sim";
import type { ViewId } from "@/lib/command/types";
import { TopTabs } from "./top-tabs";
import { Hud } from "./hud";
import { DomainRail } from "./domain-rail";
import { LiveFeed } from "./live-feed";
import { CommandBar } from "./command-bar";
import { DetailPanel } from "./detail-panel";
import { Constellation } from "./constellation/constellation";
import { BootSequence } from "./boot-sequence";
import { CommandPalette } from "./command-palette";
import { Brain } from "./views/brain";
import { Deck } from "./views/deck";
import { Team } from "./views/team";
import { Usage } from "./views/usage";
import { Settings } from "./views/settings";

const VIEW_ORDER: ViewId[] = ["agents", "brain", "deck", "team", "usage", "settings"];

function Stage() {
  const { view } = useSim();
  if (view === "agents") {
    return (
      <>
        <Constellation />
        <LiveFeed />
        <DetailPanel />
      </>
    );
  }
  if (view === "brain") return <Brain />;
  if (view === "deck") return <Deck />;
  if (view === "team") return <Team />;
  if (view === "usage") return <Usage />;
  return <Settings />;
}

function Shell({ onReplayBoot }: { onReplayBoot: () => void }) {
  const { setView, setSelected } = useSim();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Keyboard: cmd/ctrl-K or "/" toggles palette, 1..6 switch views, Escape clears.
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const target = ev.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Command palette: cmd/ctrl-K from anywhere, "/" when not typing.
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (ev.key === "/" && !typing && !paletteOpen) {
        ev.preventDefault();
        setPaletteOpen(true);
        return;
      }

      if (ev.key === "Escape") {
        if (paletteOpen) {
          // palette handles its own close; nothing else here
          return;
        }
        if (!typing) setSelected(null);
        return;
      }

      if (typing) return;

      const n = Number(ev.key);
      if (n >= 1 && n <= 6) {
        setView(VIEW_ORDER[n - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setView, setSelected, paletteOpen]);

  return (
    <div className="cmd-root">
      {/* TOP BAR */}
      <header className="cmd-topbar">
        <div className="cmd-brand">
          <span className="cmd-wordmark">Intelbase</span>
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

          {/* Active view (constellation for agents; other tabs render their own view) */}
          <Stage />
        </div>
      </div>

      {/* BOTTOM */}
      <CommandBar />

      {/* Replay boot sequence */}
      <button
        type="button"
        className="cmd-replay"
        onClick={onReplayBoot}
        title="Replay boot sequence"
        aria-label="Replay boot sequence"
      >
        <Lucide.RotateCcw size={15} strokeWidth={1.75} />
      </button>

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export function CommandApp() {
  const [booting, setBooting] = useState(true);
  const [bootKey, setBootKey] = useState(0);

  function replayBoot() {
    setBootKey((k) => k + 1);
    setBooting(true);
  }

  return (
    <SimProvider>
      {/* Dashboard mounts underneath; boot overlay dissolves to reveal it. */}
      <Shell onReplayBoot={replayBoot} />
      <AnimatePresence>
        {booting && <BootSequence key={bootKey} onDone={() => setBooting(false)} />}
      </AnimatePresence>
    </SimProvider>
  );
}

"use client";

import { Play, Pause } from "lucide-react";
import { useSim } from "@/lib/command/use-sim";

const SPEEDS = [1, 2, 4];

export function CommandBar() {
  const { paused, setPaused, speed, setSpeed } = useSim();

  return (
    <footer className="cmd-bar">
      <div className="cmd-bar-status">
        <span className="cmd-live-dot" />
        core online
      </div>

      <div className="cmd-bar-spacer" />

      <div className="cmd-bar-hint">
        press <kbd>/</kbd> for command palette
      </div>

      <div className="cmd-bar-spacer" />

      <div className="cmd-bar-ctrls">
        <button
          type="button"
          className={`cmd-ctrl-btn${paused ? "" : " is-on"}`}
          aria-label={paused ? "Resume simulation" : "Pause simulation"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={13} strokeWidth={2} /> : <Pause size={13} strokeWidth={2} />}
        </button>
        <div className="cmd-speed" role="group" aria-label="Simulation speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={`cmd-speed-btn${speed === s ? " is-active" : ""}`}
              aria-pressed={speed === s}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

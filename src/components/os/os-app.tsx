"use client";

import "./os.css";
import { useEffect, useState } from "react";
import { TimelineProvider } from "@/lib/os-demo/use-timeline";
import type { ScreenId } from "@/lib/os-demo/types";
import { SCREENS } from "./screens/registry";

export function OsApp() {
  const [active, setActive] = useState<ScreenId>("overview");

  useEffect(() => {
    (window as unknown as { __osScreen?: (id: ScreenId) => void }).__osScreen = (id: ScreenId) =>
      setActive(id);
  }, []);

  const current = SCREENS.find((s) => s.id === active) ?? SCREENS[0];
  const Active = current.Component;

  return (
    <div className="os-root">
      <TimelineProvider>
        <div className="os-shell">
          <aside className="os-sidebar">
            <div className="os-wordmark">intelbase OS</div>
            <nav className="os-nav-temp">
              {SCREENS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`os-nav-temp-item${s.id === active ? " is-active" : ""}`}
                  onClick={() => setActive(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>
          <main className="os-screen">
            <Active />
          </main>
        </div>
      </TimelineProvider>
    </div>
  );
}

"use client";

import "./os.css";
import { useEffect, useState } from "react";
import { TimelineProvider } from "@/lib/os-demo/use-timeline";
import type { ScreenId } from "@/lib/os-demo/types";
import { SCREENS } from "./screens/registry";
import { TopBar } from "./topbar";
import { Sidebar } from "./sidebar";
import { LogTicker } from "./logticker";

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
        <TopBar />
        <div className="os-body">
          <Sidebar active={active} onSelect={setActive} />
          <main className="os-screen">
            <Active />
          </main>
        </div>
        <LogTicker />
      </TimelineProvider>
    </div>
  );
}

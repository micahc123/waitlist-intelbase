"use client";

import "./os.css";
import { TimelineProvider } from "@/lib/os-demo/use-timeline";

export function OsApp() {
  return (
    <div className="os-root">
      <TimelineProvider>
        <div className="os-shell">
          <aside className="os-sidebar">sidebar</aside>
          <main className="os-screen">screen</main>
        </div>
      </TimelineProvider>
    </div>
  );
}

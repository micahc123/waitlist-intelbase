"use client";

import { useTimeline } from "@/lib/os-demo/use-timeline";
import { logTail, climb, commas } from "@/lib/os-demo/telemetry";

export function LogTicker() {
  const { t } = useTimeline();

  const lines = logTail(t, 2, 2.5);
  const latest = lines[0];
  const prev = lines[1];
  const events = climb(t, 18400, 2, 0, 0);

  return (
    <footer className="os-logticker">
      <div className="os-lt-left">
        <span className="os-lt-cursor" />
        <span className="os-lt-tag">EVENT STREAM</span>
        <span className="os-lt-stream">
          {prev ? <span className="os-lt-prev">{prev.text}</span> : null}
          <span className="os-lt-line" key={latest?.id}>
            {latest?.text}
          </span>
        </span>
      </div>

      <div className="os-lt-right">
        <span className="os-lt-count-label">events today</span>
        <span className="os-lt-count">{commas(events)}</span>
        <span className="os-lt-live">LIVE</span>
      </div>
    </footer>
  );
}

"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { LOOP_SECONDS } from "./types";
import { stateAt } from "./timeline";

interface Ctx { t: number; playing: boolean; seek: (s: number) => void; setPlaying: (b: boolean) => void; }
const TimelineCtx = createContext<Ctx | null>(null);

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    (window as unknown as { __osSeek?: (s: number) => void }).__osSeek = (s: number) => {
      setPlaying(false);
      setT(((s % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      if (last.current == null) last.current = now;
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((prev) => (prev + dt) % LOOP_SECONDS);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); last.current = null; };
  }, [playing]);

  return (
    <TimelineCtx.Provider value={{ t, playing, seek: setT, setPlaying }}>
      {children}
    </TimelineCtx.Provider>
  );
}

export function useTimeline() {
  const ctx = useContext(TimelineCtx);
  if (!ctx) throw new Error("useTimeline must be used inside TimelineProvider");
  return { ...ctx, state: stateAt(ctx.t) };
}

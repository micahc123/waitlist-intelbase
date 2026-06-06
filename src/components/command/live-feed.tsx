"use client";

import { motion, AnimatePresence } from "motion/react";
import { useSim } from "@/lib/command/use-sim";
import type { DomainId } from "@/lib/command/types";

function fmtClock(t: number): string {
  const s = Math.max(0, Math.floor(t));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(m)}:${pad(ss)}`;
}

export function LiveFeed() {
  const { feed, domains } = useSim();
  const colorOf = (id: DomainId) => domains.find((d) => d.id === id)?.color ?? "#6ea8ff";
  const visible = feed.slice(0, 14);

  return (
    <section className="cmd-feed" aria-label="Live feed">
      <header className="cmd-feed-head">
        <span className="cmd-feed-title">Live feed</span>
        <span className="cmd-live-pill">
          <span className="cmd-live-dot" />
          LIVE
        </span>
      </header>
      <ul className="cmd-feed-list">
        <AnimatePresence initial={false}>
          {visible.map((e) => (
            <motion.li
              key={e.id}
              className="cmd-feed-row"
              layout
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <span className="cmd-feed-dot" style={{ color: colorOf(e.domain) }} />
              <span className="cmd-feed-meta">
                <span className="cmd-feed-time">{fmtClock(e.t)}</span>
                <span className="cmd-feed-tag">{e.tag}</span>
              </span>
              <span className="cmd-feed-text">{e.text}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

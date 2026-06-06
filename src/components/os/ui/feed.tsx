"use client";

import { AnimatePresence, motion } from "motion/react";

export function Feed({ lines }: { lines: { id: string; text: string }[] }) {
  return (
    <ul className="os-feed">
      <AnimatePresence initial={false}>
        {lines.map((l) => (
          <motion.li key={l.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="os-feed-item">
            <span className="os-feed-dot" /> {l.text}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

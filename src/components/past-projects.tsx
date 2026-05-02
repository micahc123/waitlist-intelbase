"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Lock, MapPin } from "lucide-react";
import { projects, type ServiceKey } from "@/lib/projects-data";

const CAL_URL = "https://cal.com/intelbase/discovery-call";

type Filter = ServiceKey | "all";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "openclaw", label: "OpenClaw" },
  { key: "automation", label: "Automation" },
  { key: "social-ads", label: "Social & Ads" },
  { key: "n8n", label: "n8n" },
  { key: "llm-rag", label: "LLM & RAG" },
  { key: "custom-ai", label: "Custom AI" },
  { key: "claude", label: "Claude & MCP" },
];

export function PastProjects() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const visible =
    activeFilter === "all" ? projects : projects.filter((p) => p.service === activeFilter);

  return (
    <section id="work" className="border-b border-ink/100 px-6 py-24 sm:px-12">
      <div className="mb-12 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-mono text-[11px] uppercase tracking-[1.4px] text-ink/60"
          >
            [W] · Recent work
          </motion.div>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="text-[clamp(48px,7vw,120px)] font-bold leading-[0.9] tracking-[-0.05em]"
          >
            30+ businesses,
            <br />
            already <span className="text-brand">shipped</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="mt-6 max-w-2xl text-[16px] leading-[1.55] text-ink/80"
          >
            All client details are kept confidential. Here&apos;s what industries
            we&apos;ve worked across and the problems we&apos;ve solved.
          </motion.p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap gap-1.5 border-y border-ink py-3">
        {filters.map((f) => {
          const count = f.key === "all" ? projects.length : projects.filter((p) => p.service === f.key).length;
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`cursor-pointer border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[1px] transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
              <span
                className={`ml-2 text-[10px] ${active ? "text-paper/60" : "text-ink/40"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Project grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((p, i) => (
            <motion.div
              key={`${p.role}-${p.location}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              className="group bg-paper p-6 transition-colors hover:bg-ink hover:text-paper"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="border border-ink/15 px-1.5 py-0.5 font-mono text-[10.5px] text-ink/70 group-hover:border-paper/30 group-hover:text-paper/70">
                  {p.role}
                </span>
                <div className="flex shrink-0 items-center gap-1 text-ink/50 group-hover:text-paper/50">
                  <MapPin className="h-2.5 w-2.5" />
                  <span className="font-mono text-[10.5px]">{p.location}</span>
                </div>
              </div>

              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.8px] text-ink/50 group-hover:text-paper/50">
                Wanted to automate
              </p>
              <p className="mb-3 text-[13px] leading-snug text-ink/80 group-hover:text-paper/80">
                {p.problem}
              </p>

              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.8px] text-ink/50 group-hover:text-paper/50">
                What we built
              </p>
              <p className="text-[13px] font-medium leading-snug">{p.built}</p>

              <div className="mt-4 flex items-center gap-1.5 text-ink/50 group-hover:text-paper/50">
                <Lock className="h-2.5 w-2.5" />
                <span className="font-mono text-[10px] uppercase tracking-[0.8px]">
                  NDA — client details confidential
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex flex-col items-center gap-3 border-t border-ink pt-12">
        <a
          href={CAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-3 bg-ink px-7 py-4 font-mono text-[12.5px] uppercase tracking-[1.2px] text-paper transition-opacity hover:opacity-90"
        >
          <span className="inline-block h-2 w-2 bg-brand" /> Your business next →
        </a>
        <p className="font-mono text-[11px] uppercase tracking-[1px] text-ink/60">
          {projects.length} recent builds across 20+ industries.
        </p>
      </div>
    </section>
  );
}

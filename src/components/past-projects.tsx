"use client";

import { motion, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { Lock, ArrowUpRight, MapPin } from "lucide-react";
import { projects, type ServiceKey } from "@/lib/projects-data";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const visible = activeFilter === "all"
    ? projects
    : projects.filter((p) => p.service === activeFilter);

  return (
    <section id="work" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            Recent Work
          </p>
          <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
            30+ businesses, <span className="text-neutral-400">already shipped.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-neutral-400">
            All client details are kept confidential. Here&apos;s what industries we&apos;ve worked
            across and the problems we&apos;ve solved.
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                activeFilter === f.key
                  ? "border-white/30 bg-white text-black"
                  : "border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-neutral-200"
              }`}
            >
              {f.label}
              {f.key !== "all" && (
                <span className={`ml-1.5 text-[10px] ${activeFilter === f.key ? "text-neutral-500" : "text-neutral-600"}`}>
                  {projects.filter((p) => p.service === f.key).length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((p, i) => (
              <motion.div
                key={`${p.role}-${p.location}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0f12] p-5 transition-colors hover:border-white/[0.16]"
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${p.tint} opacity-60`} />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10.5px] text-neutral-400">
                      {p.role}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-neutral-600" />
                      <span className="text-[10.5px] text-neutral-500">{p.location}</span>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                      Wanted to automate
                    </p>
                    <p className="text-[13px] leading-snug text-neutral-400">
                      {p.problem}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                      What we built
                    </p>
                    <p className="text-[13px] font-medium leading-snug text-neutral-200">
                      {p.built}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Lock className="h-2.5 w-2.5 text-neutral-600" />
                    <span className="text-[10.5px] text-neutral-600">NDA — client details confidential</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <a
            href="https://cal.com/intelbase/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-black transition-all hover:bg-neutral-100"
          >
            Your business next
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <p className="text-[12px] text-neutral-500">
            30 recent builds across 20+ industries.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

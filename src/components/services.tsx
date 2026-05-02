"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { X, MapPin, Lock } from "lucide-react";
import { services, projects, type ServiceDef } from "@/lib/projects-data";

const CAL_URL = "https://cal.com/intelbase/discovery-call";

const tagFor: Record<ServiceDef["key"], string> = {
  openclaw: "OpenClaw",
  automation: "Automation",
  "social-ads": "Social",
  n8n: "n8n",
  "llm-rag": "RAG",
  "custom-ai": "Custom",
  claude: "Claude",
};

export function Services() {
  const [active, setActive] = useState<ServiceDef | null>(null);
  const related = active ? projects.filter((p) => p.service === active.key) : [];

  return (
    <>
      <section id="services" className="border-b border-ink/100 px-6 py-24 sm:px-12">
        <div className="mb-16 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[11px] uppercase tracking-[1.4px] text-ink/60"
            >
              [03] · What we build & deliver
            </motion.div>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="text-[clamp(48px,7vw,120px)] font-bold leading-[0.9] tracking-[-0.05em]"
            >
              Real systems.
              <br />
              Not{" "}
              <span className="underline decoration-brand decoration-[6px] underline-offset-[12px]">
                chatbots
              </span>
              .
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="mt-7 max-w-2xl text-[17px] leading-[1.55] text-ink/80"
            >
              End-to-end AI infrastructure and done-for-you services that plug into
              your stack and actually run your business.
            </motion.p>
          </div>
        </div>

        <div className="border-y border-ink/100">
          {services.map((s, i) => (
            <motion.button
              key={s.key}
              onClick={() => setActive(s)}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className={`group grid w-full cursor-pointer grid-cols-[44px_1fr_60px] items-center gap-4 px-2 py-6 text-left transition-colors duration-200 hover:bg-ink hover:text-paper sm:grid-cols-[60px_1fr_2fr_120px_60px] sm:gap-5 ${
                i < services.length - 1 ? "border-b border-ink/15" : ""
              }`}
            >
              <span className="font-mono text-[11px] text-ink/60 group-hover:text-paper/60">
                S/0{i + 1}
              </span>
              <span className="text-[20px] font-medium tracking-[-0.4px] sm:text-[22px]">
                {s.title}
              </span>
              <span className="hidden text-[14.5px] leading-[1.5] text-ink/70 group-hover:text-paper/70 sm:block">
                {s.shortBody}
              </span>
              <span className="hidden border border-ink px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[1px] group-hover:border-paper/60 sm:inline-block sm:justify-self-start">
                {tagFor[s.key]}
              </span>
              <span className="text-right text-[18px] transition-transform group-hover:translate-x-1 group-hover:text-brand">
                →
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative my-auto w-full max-w-2xl border border-ink bg-paper"
            >
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-ink bg-paper text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="border-b border-ink p-6 sm:p-8">
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[1.2px] text-ink/60">
                  S · {tagFor[active.key]}
                </div>
                <h3 className="text-[28px] font-bold tracking-[-0.5px] sm:text-[32px]">
                  {active.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.6] text-ink/80">{active.longBody}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-ink px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[1px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-4 font-mono text-[11px] uppercase tracking-[1.2px] text-ink/60">
                  Related builds ({related.length})
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {related.slice(0, 6).map((p, i) => (
                    <div key={i} className="border border-ink/15 p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <span className="border border-ink/15 bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.8px]">
                          {p.role}
                        </span>
                        <div className="flex items-center gap-1 text-ink/60">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="text-[10px]">{p.location}</span>
                        </div>
                      </div>
                      <p className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.8px] text-ink/50">
                        Problem
                      </p>
                      <p className="mb-3 text-[12px] leading-snug text-ink/80">{p.problem}</p>
                      <p className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.8px] text-ink/50">
                        Built
                      </p>
                      <p className="text-[12px] font-medium leading-snug">{p.built}</p>
                      <div className="mt-2.5 flex items-center gap-1 text-ink/50">
                        <Lock className="h-2.5 w-2.5" />
                        <span className="text-[9.5px]">NDA</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-ink pt-6">
                  <a
                    href={CAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex cursor-pointer items-center gap-3 bg-ink px-5 py-3 font-mono text-[12px] uppercase tracking-[1.2px] text-paper transition-opacity hover:opacity-90"
                  >
                    <span className="inline-block h-2 w-2 bg-brand" /> Get a quote for this →
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { motion, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Settings,
  Zap,
  Mail,
  Megaphone,
  Brain,
  Sparkles,
  Bot,
  X,
  Lock,
  MapPin,
} from "lucide-react";
import { services, projects, type ServiceKey, type ServiceDef } from "@/lib/projects-data";

const iconMap: Record<ServiceKey, React.ComponentType<{ className?: string }>> = {
  openclaw: Settings,
  automation: Mail,
  "social-ads": Megaphone,
  n8n: Zap,
  "llm-rag": Brain,
  "custom-ai": Sparkles,
  claude: Bot,
};

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState<ServiceDef | null>(null);

  const relatedProjects = active
    ? projects.filter((p) => p.service === active.key)
    : [];

  return (
    <>
      <section id="services" className="relative px-6 py-24 sm:py-32">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-[500px] w-[600px] -translate-y-1/3">
          <div className="absolute inset-0 rounded-[50%] bg-blue-600/[0.07] blur-[100px]" />
        </div>
        <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[500px] translate-x-1/4 translate-y-1/4">
          <div className="absolute inset-0 rounded-[50%] bg-violet-500/[0.06] blur-[90px]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div ref={ref} className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-4 text-center"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
              What We Build & Deliver
            </p>
            <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
              Real systems. <span className="text-neutral-400">Not chatbots.</span>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mb-14 max-w-xl text-center text-[17px] leading-relaxed text-neutral-300"
          >
            End-to-end AI infrastructure and done-for-you services that plug into
            your stack and actually run your business.
          </motion.p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = iconMap[s.key];
              return (
                <motion.button
                  key={s.key}
                  initial={{ opacity: 0, y: 25 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                  onClick={() => setActive(s)}
                  className={`group relative flex w-full cursor-pointer flex-col justify-between rounded-xl border p-6 text-left transition-all duration-300 ${
                    s.emphasized
                      ? "border-blue-500/30 bg-[#0d1117] shadow-[0_0_40px_-12px_rgba(59,130,246,0.15)] hover:border-blue-500/50 hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.2)]"
                      : "border-white/[0.08] bg-[#111214] hover:border-white/[0.15] hover:bg-[#161719]"
                  }`}
                >
                  {s.emphasized && (
                    <div className="pointer-events-none absolute -left-16 -top-16 h-[250px] w-[250px] rounded-full bg-blue-500/[0.06] blur-[60px]" />
                  )}
                  <div>
                    <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-lg border ${
                      s.emphasized
                        ? "border-blue-500/20 bg-blue-500/[0.08]"
                        : "border-white/[0.08] bg-white/[0.04]"
                    }`}>
                      <Icon className={`h-5 w-5 transition-colors group-hover:text-white ${
                        s.emphasized ? "text-blue-400" : "text-neutral-300"
                      }`} />
                    </div>
                    <h3 className="mb-2 text-[19px] font-semibold text-white">
                      {s.title}
                    </h3>
                    <p className="text-[14.5px] leading-relaxed text-neutral-300">
                      {s.shortBody}
                    </p>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-md border px-2 py-0.5 text-[11px] ${
                            s.emphasized
                              ? "border-blue-500/15 bg-blue-500/[0.06] text-blue-300/70"
                              : "border-white/[0.08] bg-white/[0.03] text-neutral-400"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-neutral-600 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-300" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service detail modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0f12]"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-black/40 text-neutral-400 backdrop-blur-sm transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className={`border-b border-white/[0.06] p-6 sm:p-8 ${active.emphasized ? "bg-blue-500/[0.04]" : ""}`}>
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${
                  active.emphasized
                    ? "border-blue-500/20 bg-blue-500/[0.08]"
                    : "border-white/[0.08] bg-white/[0.04]"
                }`}>
                  {(() => {
                    const Icon = iconMap[active.key];
                    return <Icon className={`h-5 w-5 ${active.emphasized ? "text-blue-400" : "text-neutral-300"}`} />;
                  })()}
                </div>
                <h2 className="mb-3 text-2xl font-semibold text-white">{active.title}</h2>
                <p className="text-[15px] leading-relaxed text-neutral-300">{active.longBody}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-md border px-2 py-0.5 text-[11px] ${
                        active.emphasized
                          ? "border-blue-500/15 bg-blue-500/[0.06] text-blue-300/70"
                          : "border-white/[0.08] bg-white/[0.03] text-neutral-400"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related builds */}
              <div className="p-6 sm:p-8">
                <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
                  Related builds ({relatedProjects.length})
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedProjects.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/[0.07] bg-[#161719] p-4"
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-2">
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-neutral-400">
                          {p.role}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-neutral-600" />
                          <span className="text-[10px] text-neutral-500">{p.location}</span>
                        </div>
                      </div>
                      <p className="mb-1 text-[9.5px] font-medium uppercase tracking-wider text-neutral-600">
                        Problem
                      </p>
                      <p className="mb-2 text-[12px] leading-snug text-neutral-400">{p.problem}</p>
                      <p className="mb-1 text-[9.5px] font-medium uppercase tracking-wider text-neutral-600">
                        Built
                      </p>
                      <p className="text-[12px] font-medium leading-snug text-neutral-200">{p.built}</p>
                      <div className="mt-2.5 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5 text-neutral-700" />
                        <span className="text-[9.5px] text-neutral-700">NDA</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-white/[0.06] pt-6">
                  <a
                    href="https://cal.com/intelbase/discovery-call"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-all hover:bg-neutral-100"
                  >
                    Get a quote for this →
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

"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  ArrowRight,
  Settings,
  Zap,
  Mail,
  Megaphone,
  Brain,
  Sparkles,
} from "lucide-react";

const services = [
  {
    icon: Settings,
    title: "OpenClaw Full Setup",
    body: "Full OpenClaw deployment on your Mac Mini, VPS, or any system — configured, integrated, and ready to go. Live in 30 minutes.",
    tags: ["OpenClaw", "30 min setup", "Any system"],
    emphasized: true,
  },
  {
    icon: Mail,
    title: "Business Automation",
    body: "Lead capture, email sequences, CRM syncing, and cold email campaigns — the whole back-office running itself while you sleep.",
    tags: ["Leads", "Email", "CRM", "Cold outreach"],
    emphasized: false,
  },
  {
    icon: Megaphone,
    title: "Social Media & AI Ads",
    body: "Content + ad generation with Higgsfield and OpenClaw. We build the full pipeline — scripting, visuals, posting, and paid ad campaigns on autopilot.",
    tags: ["Higgsfield", "OpenClaw", "Ad campaigns"],
    emphasized: false,
  },
  {
    icon: Zap,
    title: "n8n Workflow Automation",
    body: "Custom n8n workflows that automate your business processes — lead routing, data syncing, notifications, and AI-powered pipelines. Done in under an hour.",
    tags: ["n8n", "Under 1 hour", "Automation"],
    emphasized: false,
  },
  {
    icon: Brain,
    title: "Custom LLM & RAG",
    body: "Train a model on your business data. RAG pipelines that know your products, policies, and history — so your AI answers like it works there.",
    tags: ["RAG", "Fine-tune", "Vector DB"],
    emphasized: false,
  },
  {
    icon: Sparkles,
    title: "Custom AI Solutions",
    body: "Anything outside the box — multi-agent systems, internal tools, workflow copilots. We scope it, build it, ship it.",
    tags: ["Bespoke", "Multi-agent", "End-to-end"],
    emphasized: false,
  },
];

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
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
          <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Real systems. <span className="text-neutral-400">Not chatbots.</span>
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-14 max-w-lg text-center text-[15px] text-neutral-300"
        >
          End-to-end AI infrastructure and done-for-you services that connect
          to your existing tools and actually run your business processes.
        </motion.p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.08,
                }}
                className={`group relative flex flex-col justify-between rounded-xl border p-6 transition-all duration-300 ${
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
                  <h3 className="mb-2 text-lg font-medium text-white">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {s.body}
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
                  <ArrowRight className="h-4 w-4 text-neutral-600 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


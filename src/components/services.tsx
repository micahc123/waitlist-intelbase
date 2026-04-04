"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Database, Workflow, Bot, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Database,
    title: "Memory Layer",
    body: "Agents that remember conversations, documents, and context across sessions using Supabase pgvector. No more starting from zero.",
    tags: ["pgvector", "RAG", "Embeddings"],
  },
  {
    icon: Workflow,
    title: "Business Logic",
    body: "FastAPI backends that connect AI to your CRM, payments, calendars, and databases. A system that actually does things.",
    tags: ["FastAPI", "REST", "Webhooks"],
  },
  {
    icon: Bot,
    title: "Agent Orchestration",
    body: "Teams of specialized agents with n8n workflows and OpenRouter routing — with fallbacks, retries, and human-in-the-loop approvals.",
    tags: ["n8n", "OpenRouter", "Multi-agent"],
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

      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            What We Build
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Real systems. <span className="text-neutral-500">Not chatbots.</span>
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-14 max-w-lg text-center text-[15px] text-neutral-500"
        >
          End-to-end AI infrastructure that connects to your existing tools and
          actually runs your business processes.
        </motion.p>

        <div className="grid gap-4 md:grid-cols-3">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.1,
                }}
                className="group relative flex flex-col justify-between rounded-xl border border-white/[0.06] bg-[#111214]/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-[#141518]/80"
              >
                <div>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <Icon className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-white">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    {s.body}
                  </p>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[11px] text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-700 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

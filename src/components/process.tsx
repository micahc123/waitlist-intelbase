"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Search, PenTool, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Discovery",
    desc: "We map your workflows and identify where AI can replace manual work.",
    detail: "Stakeholder interviews, process audits, ROI analysis",
  },
  {
    num: "02",
    icon: PenTool,
    title: "Design",
    desc: "We architect the agent system, memory layer, and backend logic.",
    detail: "Technical specs, data flow diagrams, API contracts",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Deploy",
    desc: "Production system live in 2\u20134 weeks.",
    detail: "VPS deployment, monitoring, logging, error tracking",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Maintain",
    desc: "We monitor, optimize, and scale as your business grows.",
    detail: "Performance dashboards, proactive improvements",
  },
];

export function Process() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="process" className="relative px-6 py-24 sm:py-32">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-0 top-1/3 h-[500px] w-[500px] -translate-x-1/3">
        <div className="absolute inset-0 rounded-[50%] bg-indigo-500/[0.06] blur-[90px]" />
      </div>
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-[400px] w-[400px] translate-x-1/4">
        <div className="absolute inset-0 rounded-[50%] bg-blue-500/[0.05] blur-[80px]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            Our Process
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-16 max-w-lg text-center text-[15px] text-neutral-300"
        >
          A clear path from discovery to production-ready AI — no guesswork.
        </motion.p>

        {/* Horizontal timeline */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pointer-events-none absolute left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] top-6 hidden h-px origin-left bg-gradient-to-r from-white/[0.12] via-white/[0.08] to-white/[0.12] lg:block"
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                className="group relative flex flex-col items-center px-4 py-6 text-center"
              >
                {/* Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                  className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1] bg-[#111214] transition-all group-hover:border-white/[0.2] group-hover:bg-[#161719]"
                >
                  <Icon className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-white" />
                </motion.div>

                <span className="mb-2 font-mono text-[11px] text-neutral-500">
                  {step.num}
                </span>
                <h3 className="mb-2 text-base font-medium text-white">
                  {step.title}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-neutral-300">
                  {step.desc}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  {step.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

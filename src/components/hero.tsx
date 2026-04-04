"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const techStack = [
  "FastAPI",
  "Supabase Vector DB",
  "OpenRouter",
  "n8n",
  "VPS Deploy",
];

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6">
      {/* Aurora glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 translate-y-[25%]">
        <div className="absolute inset-0 rounded-[50%] bg-blue-600/25 blur-[80px]" />
        <div className="absolute inset-x-[10%] inset-y-[5%] rounded-[50%] bg-indigo-500/20 blur-[60px]" />
        <div className="absolute inset-x-[25%] inset-y-[15%] rounded-[50%] bg-violet-500/15 blur-[50px]" />
      </div>
      {/* Side glows */}
      <div className="pointer-events-none absolute -left-20 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/[0.05] blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-[350px] w-[350px] rounded-full bg-blue-500/[0.04] blur-[80px]" />

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#08090a] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#08090a] to-transparent" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[clamp(2rem,5.5vw,3.75rem)] font-medium leading-[1.15] tracking-[-0.02em] text-white"
        >
          The backend behind every{" "}
          <span className="font-semibold">intelligent system.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-400"
        >
          We build production-ready AI infrastructure — persistent memory,
          business logic APIs, and multi-agent orchestration — so your AI
          actually works beyond the demo phase.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="https://cal.com/intelbase/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-neutral-200"
          >
            Book a Discovery Call
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#services"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.08]"
          >
            Learn More
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium uppercase tracking-widest text-neutral-600"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

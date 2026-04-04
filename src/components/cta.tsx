"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0d0f]/80 backdrop-blur-sm"
        >
          {/* Glow effects */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-32 h-[500px]">
            <div className="mx-auto h-full w-[700px] rounded-[50%] bg-blue-600/[0.10] blur-[100px]" />
          </div>
          <div className="pointer-events-none absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-violet-500/[0.07] blur-[80px]" />
          <div className="pointer-events-none absolute -right-20 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/[0.06] blur-[70px]" />

          <div className="relative px-6 py-20 text-center sm:px-12 sm:py-24">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Let&apos;s Talk
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              Ready to move from AI experiments
              <br className="hidden sm:block" />
              to production?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-neutral-400"
            >
              30-minute discovery call. No sales pressure. Just clarity on
              whether this makes sense for your business.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="mailto:info@intelbase-ai.com"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-neutral-200"
              >
                Book a Discovery Call
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:info@intelbase-ai.com"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.08]"
              >
                info@intelbase-ai.com
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

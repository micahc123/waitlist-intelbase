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
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0f12]"
        >
          {/* Glow effects */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-32 h-[500px]">
            <div className="mx-auto h-full w-[700px] rounded-[50%] bg-blue-600/[0.10] blur-[100px]" />
          </div>
          <div className="pointer-events-none absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-cyan-600/[0.07] blur-[80px]" />
          <div className="pointer-events-none absolute -right-20 top-1/3 h-[350px] w-[350px] rounded-full bg-indigo-500/[0.06] blur-[70px]" />

          <div className="relative px-6 py-20 text-center sm:px-12 sm:py-24">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[12px] text-neutral-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              We take a limited number of clients per month
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-medium tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              Automate your
              <br className="hidden sm:block" />
              entire business.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-neutral-300"
            >
              Book a free 30-min call. We scope the build, send a flat quote within
              24 hours, and ship it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="https://cal.com/intelbase/discovery-call"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-[15px] font-semibold text-black shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] transition-all hover:bg-neutral-100 hover:shadow-[0_0_60px_-5px_rgba(255,255,255,0.45)]"
              >
                Book Your Free Discovery Call
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="https://wa.me/85290123551"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.05] px-5 py-3.5 text-[14px] font-medium text-neutral-200 transition-all hover:bg-white/[0.1]"
              >
                WhatsApp instead
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 text-[13.5px] text-neutral-500"
            >
              No pressure · Quote in 24 hrs
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

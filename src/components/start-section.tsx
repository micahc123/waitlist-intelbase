"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { VideoBackground } from "./video-background";

export function StartSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="process" className="relative" style={{ minHeight: 500 }}>
      <VideoBackground src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8" />

      {/* Gradient fades */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-black to-transparent z-[1] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black to-transparent z-[1] pointer-events-none" />

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-32"
      >
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body mb-6"
        >
          How It Works
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] max-w-xl"
        >
          You dream it. We ship it.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-white/60 font-body font-light text-sm md:text-base max-w-md"
        >
          Share your vision. Our AI handles the rest&mdash;wireframes, design,
          code, launch. All in days, not quarters.
        </motion.p>

        <motion.a
          href="#contact"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white font-body inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
        >
          Get Started
          <ArrowUpRight className="h-4 w-4" />
        </motion.a>
      </div>
    </section>
  );
}

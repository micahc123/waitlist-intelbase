"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { VideoBackground } from "./video-background";

export function CtaFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="relative">
      <VideoBackground src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8" />

      {/* Gradient fades */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-black to-transparent z-[1] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black to-transparent z-[1] pointer-events-none" />

      <div
        ref={ref}
        className="relative z-10 px-6 py-32 flex flex-col items-center text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[0.85] max-w-2xl tracking-tight"
        >
          Your next website starts here.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 text-white/60 font-body font-light text-sm md:text-base max-w-md"
        >
          Book a free strategy call. See what AI-powered design can do.
          No commitment, no pressure. Just possibilities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#contact"
            className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white font-body transition-transform hover:scale-[1.02]"
          >
            Book a Call
          </a>
          <a
            href="#pricing"
            className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium font-body transition-colors hover:bg-white/90"
          >
            View Pricing
          </a>
        </motion.div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-white/10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-body">
            &copy; {new Date().getFullYear()} Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-white/40 text-xs font-body transition-colors hover:text-white/70"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-white/40 text-xs font-body transition-colors hover:text-white/70"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-white/40 text-xs font-body transition-colors hover:text-white/70"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

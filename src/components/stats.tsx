"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { VideoBackground } from "./video-background";

const stats = [
  { value: "200+", label: "Sites launched" },
  { value: "98%", label: "Client satisfaction" },
  { value: "3.2x", label: "More conversions" },
  { value: "5 days", label: "Average delivery" },
];

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 sm:py-32">
      <VideoBackground
        src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8"
        desaturated
      />

      {/* Gradient fades */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-black to-transparent z-[1] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black to-transparent z-[1] pointer-events-none" />

      <div ref={ref} className="relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl liquid-glass rounded-3xl p-12 md:p-16"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-white/60 font-body font-light text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

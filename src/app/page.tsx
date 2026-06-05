"use client";

import { TopNav } from "@/components/top-nav";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Process } from "@/components/process";
import { KPIs, Testimonials } from "@/components/proof";
import { Pricing } from "@/components/pricing";
import { TryIt } from "@/components/try-it";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { useReveal, useActiveSection } from "@/lib/use-reveal";

const SECTION_IDS = ["services", "process", "work", "pricing"];
const CAL_URL = "https://cal.com/intelbase/discovery-call";

function openCal() {
  if (typeof window !== "undefined") {
    window.open(CAL_URL, "_blank", "noopener,noreferrer");
  }
}

export default function Home() {
  useReveal();
  const active = useActiveSection(SECTION_IDS);

  return (
    <div className="shell">
      <TopNav onQuote={openCal} active={active} />
      <Hero onQuote={openCal} />
      <Services onQuote={openCal} />
      <Process />
      <KPIs />
      <Testimonials />
      <Pricing onQuote={openCal} />
      <TryIt />
      <CTA onQuote={openCal} />
      <Footer onQuote={openCal} />
      <StickyCta onQuote={openCal} />
    </div>
  );
}

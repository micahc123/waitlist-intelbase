import type { Metadata } from "next";
import "@/components/landing/landing.css";

import { LandingNav } from "@/components/landing/nav";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFaq } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Pricing - Intelbase",
  description:
    "Simple plans that grow with you. Every Intelbase plan includes a 14-day free trial. Switch to annual and get two months free.",
};

export default function PricingPage() {
  return (
    <div className="lp-root">
      <LandingNav />
      <main>
        <div style={{ height: "clamp(24px, 4vw, 56px)" }} />
        <LandingPricing full />
        <LandingFaq />
        <LandingFooter />
      </main>
    </div>
  );
}

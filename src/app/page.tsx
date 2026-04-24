import { TopNav } from "@/components/top-nav";
import { Hero } from "@/components/hero";
import { Proof } from "@/components/proof";
import { Services } from "@/components/services";
import { Pricing } from "@/components/pricing";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";

export default function Home() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <TopNav />
      <main className="relative z-10">
        <Hero />
        <Proof />
        <Services />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}

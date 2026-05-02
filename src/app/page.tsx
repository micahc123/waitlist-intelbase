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
      <TopNav />
      <main>
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

import "./landing.css";

import { LandingNav } from "./nav";
import { LandingHero } from "./hero";
import { LandingHowItWorks } from "./how-it-works";
import { LandingFeatures } from "./features";
import { LandingPricing } from "./pricing";
import { LandingFaq } from "./faq";
import { LandingFooter } from "./footer";

export function Landing() {
  return (
    <div className="lp-root">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingPricing />
        <LandingFaq />
        <LandingFooter />
      </main>
    </div>
  );
}

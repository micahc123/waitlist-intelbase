import Image from "next/image";
import WaitlistForm from "./waitlist-form";

export default function Home() {
  return (
    <>
      <div className="field" aria-hidden>
        <div className="rings" />
        <div className="dots" />
      </div>

      <nav>
        <div className="brand">
          <Image
            src="/intelbase-logo.webp"
            alt="Intelbase logo"
            width={38}
            height={38}
            priority
          />
          Intelbase
        </div>
      </nav>

      <header className="hero">
        <div className="pill">
          <span className="dot" />
          Private beta · Q3 2026
        </div>

        <h1>
          The AI <span className="accent">operating system</span> for your
          business.
        </h1>

        <p className="sub">
          Intelbase brings your <b>ops, data, and agents</b> into one AI-native
          workspace — so your team runs lean and moves fast. Be first in line.
        </p>

        <WaitlistForm />
      </header>

      <footer>© 2026 Intelbase — The AI operating system for business.</footer>
    </>
  );
}

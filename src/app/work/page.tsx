import { TopNav } from "@/components/top-nav";
import { PastProjects } from "@/components/past-projects";
import { Footer } from "@/components/footer";

export default function WorkPage() {
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
      <main className="relative z-10 pt-20">
        <PastProjects />
      </main>
      <Footer />
    </>
  );
}

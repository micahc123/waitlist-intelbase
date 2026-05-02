import { TopNav } from "@/components/top-nav";
import { PastProjects } from "@/components/past-projects";
import { Footer } from "@/components/footer";

export default function WorkPage() {
  return (
    <>
      <TopNav />
      <main>
        <PastProjects />
      </main>
      <Footer />
    </>
  );
}

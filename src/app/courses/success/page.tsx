import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { stripe } from "@/lib/stripe";
import { getEbook } from "@/lib/ebooks";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

type SearchParams = Promise<{ session_id?: string }>;

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session_id } = await searchParams;
  if (!session_id) notFound();

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    notFound();
  }

  if (session.payment_status !== "paid") {
    return (
      <>
        <TopNav />
        <main className="relative z-10 mx-auto max-w-2xl px-6 pt-44 pb-24 text-center">
          <h1 className="text-3xl font-medium text-white">
            Payment not yet confirmed
          </h1>
          <p className="mt-4 text-neutral-400">
            Your session is <span className="text-white">{session.payment_status}</span>.
            Refresh once your card completes — or reach out on WhatsApp if it stays stuck.
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm text-white hover:bg-white/[0.08]"
          >
            Back to courses
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const slug = session.metadata?.slug;
  const ebook = slug ? getEbook(slug) : undefined;
  if (!ebook) notFound();

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
      <main className="relative z-10 px-6 pt-36 pb-24 sm:pt-44">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3">
          <div className="absolute inset-0 rounded-[50%] bg-emerald-600/[0.07] blur-[110px]" />
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <p className="mt-6 text-xs font-medium uppercase tracking-widest text-emerald-300/80">
            Payment confirmed
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-white sm:text-5xl">
            You&apos;re in.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-400">
            Your copy of <span className="text-white">{ebook.title}</span> is
            ready. You can read it now in the browser, or save it as a PDF
            from your browser&apos;s print menu.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/courses/read/${ebook.slug}?session_id=${session.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-neutral-200"
            >
              Open your ebook
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://wa.me/85290123551"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.08]"
            >
              Need help? WhatsApp us
            </a>
          </div>
          <p className="mt-4 text-[12px] text-neutral-500">
            Reads in the browser · Save as PDF from the menu if you want a file
          </p>

          <p className="mt-8 text-[12px] text-neutral-500">
            Receipt sent to <span className="text-neutral-300">{session.customer_details?.email ?? "your email"}</span>.
            Keep this URL — you can return to it anytime.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

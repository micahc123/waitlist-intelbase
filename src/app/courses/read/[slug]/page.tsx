import { notFound } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import { stripe } from "@/lib/stripe";
import { getEbook } from "@/lib/ebooks";
import { EbookReader } from "@/components/ebook-reader";
import { ebookContent } from "@/components/ebooks/content";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-reader",
  display: "swap",
});

const jbm = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-reader-mono",
  display: "swap",
});

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ session_id?: string; preview?: string }>;

export default async function ReadPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { session_id, preview } = await searchParams;

  const ebook = getEbook(slug);
  if (!ebook) notFound();

  const content = ebookContent[ebook.slug];
  if (!content) notFound();

  // Owner preview — lets you read your own books without a Stripe session.
  const adminKey = process.env.ADMIN_PREVIEW_KEY;
  if (preview && adminKey && preview === adminKey) {
    return (
      <div className={`${inter.variable} ${jbm.variable}`}>
        <EbookReader ebook={ebook} content={content} />
      </div>
    );
  }

  if (!session_id) {
    return (
      <GateMessage
        title="This ebook is gated"
        body="You need a valid purchase session to read it. Head back to the courses page and buy it first — you'll get a link right after payment."
      />
    );
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return (
      <GateMessage
        title="We couldn't verify your session"
        body="The link might be malformed. Reach out on WhatsApp and we'll sort it out."
      />
    );
  }

  if (session.payment_status !== "paid") {
    return (
      <GateMessage
        title="Payment not confirmed"
        body={`Session status: ${session.payment_status}. Once your card settles, the ebook will unlock here.`}
      />
    );
  }

  if (session.metadata?.slug !== ebook.slug) {
    return (
      <GateMessage
        title="Wrong ebook for this session"
        body="Your purchase is valid — but not for this book. Check the link you were sent after paying."
      />
    );
  }

  return <EbookReader ebook={ebook} content={content} />;
}

function GateMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-medium text-white">{title}</h1>
      <p className="mt-3 text-sm text-neutral-400">{body}</p>
      <a
        href="/courses"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-neutral-200"
      >
        Back to courses
      </a>
    </main>
  );
}

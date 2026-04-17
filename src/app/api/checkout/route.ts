import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getEbook } from "@/lib/ebooks";

type CheckoutCreateParams = NonNullable<
  Parameters<typeof stripe.checkout.sessions.create>[0]
>;
type LineItem = NonNullable<CheckoutCreateParams["line_items"]>[number];

export async function POST(req: NextRequest) {
  const { slug } = (await req.json()) as { slug?: string };
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const ebook = getEbook(slug);
  if (!ebook) {
    return NextResponse.json({ error: "Unknown ebook" }, { status: 404 });
  }

  const origin =
    req.headers.get("origin") ??
    req.nextUrl.origin ??
    "https://intelbase.co";

  const lineItem: LineItem = ebook.priceId
    ? { price: ebook.priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: ebook.priceUsd * 100,
          product_data: {
            name: ebook.title,
            description: ebook.subtitle,
          },
        },
      };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [lineItem],
    metadata: { slug: ebook.slug },
    success_url: `${origin}/courses/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/courses`,
    allow_promotion_codes: true,
    automatic_tax: { enabled: false },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}

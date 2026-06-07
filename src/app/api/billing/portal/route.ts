// POST /api/billing/portal
//
// Opens a Stripe Customer Portal session for the signed-in user's org so they
// can manage their subscription (update card, change plan, cancel) and returns
// its URL for the client to redirect to.
//
// FORK NOTE: standard route-handler conventions (see 15-route-handlers.md).

import { stripe } from "@/lib/stripe";
import { getUserAndOrg } from "@/lib/auth";
import { getOrgSubscription, stripeConfigured } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function appUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request): Promise<Response> {
  if (!stripeConfigured()) {
    return Response.json(
      { error: "Billing is not configured yet" },
      { status: 503 },
    );
  }

  const { user, org } = await getUserAndOrg();
  if (!user || !org) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sub = await getOrgSubscription(org.id);
  if (!sub?.stripe_customer_id) {
    return Response.json(
      { error: "No billing account found for this organization" },
      { status: 404 },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl(request)}/app`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json(
      { error: `Portal failed: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}

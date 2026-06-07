// POST /api/stripe/webhook
//
// Receives Stripe events and syncs subscription state into the `subscriptions`
// table using the SERVICE-ROLE (admin) Supabase client (the webhook has no user
// session). Events handled:
//   - checkout.session.completed
//   - customer.subscription.created
//   - customer.subscription.updated
//   - customer.subscription.deleted
//
// HOW CUSTOMERS MAP TO ORGS: checkout creates the subscriptions row first (via
// ensureStripeCustomer, which stores stripe_customer_id + org_id). The webhook
// looks the row up by stripe_customer_id to recover org_id, then upserts the
// subscription fields onto it. We never trust the event for org_id.
//
// FORK NOTE: signature verification needs the RAW request body. Per the fork's
// route-handler docs (15-route-handlers.md) we use the Web Request API and read
// request.text() to get the unparsed body (do NOT use request.json()). nodejs
// runtime is required for Stripe's crypto-based signature check.

import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFromPriceId } from "@/lib/stripe-plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tsToIso(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

// Derive plan + current_period_end from the first subscription item.
function readItemDetails(subscription: Stripe.Subscription): {
  plan: string | null;
  currentPeriodEnd: string | null;
} {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  // current_period_end moved onto the subscription item in recent API versions.
  const currentPeriodEnd = tsToIso(item?.current_period_end);
  return { plan: planFromPriceId(priceId), currentPeriodEnd };
}

// Upsert the subscription fields onto the row matched by stripe_customer_id.
async function syncSubscription(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  customerId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const { data: row } = await admin
    .from("subscriptions")
    .select("id, org_id")
    .eq("stripe_customer_id", customerId)
    .limit(1)
    .maybeSingle();

  const { plan, currentPeriodEnd } = readItemDetails(subscription);

  const fields = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan,
    status: subscription.status,
    trial_end: tsToIso(subscription.trial_end),
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString(),
  };

  if (row?.id) {
    await admin.from("subscriptions").update(fields).eq("id", row.id);
  } else {
    // No pre-existing row (e.g. subscription created outside our checkout flow).
    // Recover org_id from the customer/subscription metadata if present.
    const orgId =
      (subscription.metadata?.org_id as string | undefined) ?? null;
    if (orgId) {
      await admin
        .from("subscriptions")
        .insert({ org_id: orgId, ...fields });
    }
    // Without an org_id we cannot satisfy the NOT NULL fk; skip silently.
  }
}

async function customerIdOf(
  ref: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): Promise<string | null> {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // No secret configured -> acknowledge without processing so Stripe (or a
  // local test) does not see a crash. Nothing is written.
  if (!webhookSecret) {
    return Response.json(
      { received: true, note: "STRIPE_WEBHOOK_SECRET not set; event ignored" },
      { status: 200 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  // RAW body is required for signature verification.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
    );
  } catch (err) {
    return Response.json(
      { error: `Signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    // Verified the event but cannot persist (Supabase service role not set).
    return Response.json(
      { received: true, note: "Supabase admin not configured; not persisted" },
      { status: 200 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = await customerIdOf(session.customer);
        if (customerId && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(admin, customerId, subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = await customerIdOf(subscription.customer);
        if (customerId) {
          await syncSubscription(admin, customerId, subscription);
        }
        break;
      }
      default:
        // Ignore other event types.
        break;
    }
  } catch (err) {
    return Response.json(
      { error: `Webhook handler error: ${(err as Error).message}` },
      { status: 500 },
    );
  }

  return Response.json({ received: true });
}

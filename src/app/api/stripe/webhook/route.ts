import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";
import { getEbook } from "@/lib/ebooks";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return new Response(`Webhook verification failed: ${msg}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true });
  }

  const session = event.data.object;
  const slug = session.metadata?.slug;
  const email = session.customer_details?.email;
  const ebook = slug ? getEbook(slug) : undefined;

  if (!email || !ebook) {
    return Response.json({ received: true, sent: false });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://intelbase.co";

  const link = `${origin}/courses/read/${ebook.slug}?session_id=${session.id}`;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Intelbase <hello@intelbase.co>";

  if (!apiKey) {
    console.warn("[webhook] RESEND_API_KEY not set — skipping email", {
      email,
      slug,
    });
    return Response.json({ received: true, sent: false });
  }

  const resend = new Resend(apiKey);
  const actionLabel = "Open your ebook";

  await resend.emails.send({
    from,
    to: email,
    subject: `Your copy of ${ebook.title}`,
    text: `Hey — thanks for grabbing ${ebook.title}.

Your copy is ready. ${actionLabel} here:
${link}

Bookmark that URL — it's yours for life. If the link ever breaks or you need a fresh one, reply to this email and we'll re-issue it.

— Intelbase
https://intelbase.co
`,
    html: renderEmail({
      title: ebook.title,
      subtitle: ebook.subtitle,
      link,
      actionLabel,
    }),
  });

  return Response.json({ received: true, sent: true });
}

function renderEmail({
  title,
  subtitle,
  link,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  link: string;
  actionLabel: string;
}) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <tr><td>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Intelbase</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;line-height:1.25;">Your copy of ${escapeHtml(title)} is ready.</h1>
              <p style="margin:0 0 24px;font-size:13px;color:#666;">${escapeHtml(subtitle)}</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.55;">Thanks for grabbing this. Tap below to jump straight into it.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
                <tr><td style="border-radius:10px;background:#0a0a0a;">
                  <a href="${link}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;">${escapeHtml(actionLabel)} &rarr;</a>
                </td></tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;color:#666;line-height:1.55;">Or paste this URL into your browser:</p>
              <p style="margin:0 0 24px;font-size:12px;color:#888;word-break:break-all;"><a href="${link}" style="color:#3366ff;text-decoration:none;">${link}</a></p>
              <p style="margin:0 0 8px;font-size:13px;color:#666;line-height:1.55;">Bookmark the URL — it stays yours. If it ever breaks, just reply and we'll send a fresh one.</p>
              <p style="margin:24px 0 0;font-size:12px;color:#999;">— Intelbase · <a href="https://intelbase.co" style="color:#888;text-decoration:none;">intelbase.co</a></p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

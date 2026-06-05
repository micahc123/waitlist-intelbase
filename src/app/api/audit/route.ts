// VERIFY AGAINST FORK: STANDARD Next.js App Router route handler (named `POST`
// taking `Request`, returning `Response`, plus `runtime`/`dynamic` exports). The
// fork's route-handlers doc confirms these conventions. Keep this thin; storage
// lives in src/lib/agent/.
//
// GROW-08: AI Readiness Audit lead capture. The scorecard is scored client-side
// (src/components/readiness-audit.tsx); this route just persists the captured
// contact + score as a lead (source = "audit"). We mirror the /api/leads + agent
// storage pattern rather than inventing a new store.

import { getLeadStore } from "@/lib/agent/storage";
import { emptyQualification } from "@/lib/agent/qualify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuditBody = {
  name?: string;
  email?: string;
  business?: string;
  score?: number; // 0..100, computed client-side
  tier?: string; // human label for the score band
  recommendation?: string; // tailored next-step copy
  answers?: Record<string, string>; // questionId -> chosen option label
};

export async function POST(request: Request): Promise<Response> {
  let body: AuditBody;
  try {
    body = (await request.json()) as AuditBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = clean(body.name);
  const email = clean(body.email);
  const business = clean(body.business);

  if (!isValidEmail(email)) {
    return Response.json(
      { error: "Enter a valid email so we can send your scorecard." },
      { status: 400 }
    );
  }

  const score =
    typeof body.score === "number" && Number.isFinite(body.score)
      ? Math.max(0, Math.min(100, Math.round(body.score)))
      : null;
  const tier = clean(body.tier);
  const recommendation = clean(body.recommendation);

  // Build a readable transcript so the dashboard shows what the lead answered.
  const answerLines = body.answers
    ? Object.entries(body.answers)
        .map(([q, a]) => `- ${q}: ${a}`)
        .join("\n")
    : "";

  const summary = [
    `[AI Readiness Audit]`,
    name ? `Name: ${name}` : null,
    business ? `Business: ${business}` : null,
    score !== null ? `Score: ${score}/100${tier ? ` (${tier})` : ""}` : null,
    answerLines ? `Answers:\n${answerLines}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const store = getLeadStore();
  const conversationId = `audit_${randomId()}`;

  await store
    .upsert({
      id: conversationId,
      qualification: emptyQualification(),
      messages: [
        { role: "user", content: summary },
        {
          role: "assistant",
          content: recommendation || "Audit submitted.",
        },
      ],
      channel: "web",
      source: "audit",
      contact: {
        ...(name ? { name } : {}),
        email,
        ...(business ? { business } : {}),
      },
    })
    .catch(() => undefined);

  return Response.json({ captured: true });
}

function clean(v: string | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

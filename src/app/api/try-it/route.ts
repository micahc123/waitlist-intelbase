// VERIFY AGAINST FORK: STANDARD Next.js App Router route handler (named `POST`
// taking `Request`, returning `Response`, plus `runtime`/`dynamic` exports). The
// fork's route-handlers doc (01-app/.../15-route-handlers.md) confirms these
// conventions. Keep this file thin; generation + storage live in src/lib/agent/.
//
// GROW-06: "Try it on your site" demo lead magnet. A prospect submits their
// website URL + email. We fetch that URL's main text (TEXT ONLY, no scripts run),
// ask the agent client to write a short sample of how intelbase OS would greet and
// qualify that site's visitors, and capture the email as a lead (source = "try-it").
//
// Guardrails: fetch failures degrade to a generic-but-useful sample, fetched
// content is size-capped, only HTML text is extracted (we never execute remote
// scripts), and a short timeout stops a slow site from hanging the request.

import { generateText, AgentClientError } from "@/lib/agent/client";
import { getLeadStore } from "@/lib/agent/storage";
import { emptyQualification } from "@/lib/agent/qualify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cap how much of a remote page we read into memory and into the prompt.
const MAX_FETCH_BYTES = 200_000; // ~200 KB of HTML is plenty for the gist.
const MAX_TEXT_CHARS = 6_000; // trimmed plain text we send to the model.
const FETCH_TIMEOUT_MS = 7_000;

type TryItBody = {
  url?: string;
  email?: string;
};

export async function POST(request: Request): Promise<Response> {
  let body: TryItBody;
  try {
    body = (await request.json()) as TryItBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const url = normalizeUrl(body.url);
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!url) {
    return Response.json(
      { error: "Enter a valid website URL (http or https)." },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return Response.json(
      { error: "Enter a valid email so we can send the full demo." },
      { status: 400 }
    );
  }

  // Fetch the site text. On any failure we keep going with empty context, so the
  // prospect still gets a useful sample rather than an error.
  const siteText = await fetchSiteText(url).catch(() => "");

  let sample: string;
  let degraded = false;
  try {
    sample = await generateSample(url, siteText);
  } catch (err) {
    // Auth/transport failure: degrade to a static-but-on-brand sample.
    if (err instanceof AgentClientError) {
      console.error(`[try-it] ${err.name} (${err.status ?? "n/a"}): ${err.message}`);
    } else {
      console.error("[try-it] unexpected error:", err);
    }
    sample = fallbackSample(url);
    degraded = true;
  }

  // Capture the email as a lead, tagged source = "try-it". Best-effort.
  const store = getLeadStore();
  const conversationId = `tryit_${randomId()}`;
  await store
    .upsert({
      id: conversationId,
      qualification: emptyQualification(),
      messages: [
        {
          role: "user",
          content: `[try-it demo] requested a sample for ${url}`,
        },
        { role: "assistant", content: sample },
      ],
      channel: "web",
      source: "try-it",
      contact: { email, website: url },
    })
    .catch(() => undefined);

  return Response.json({ sample, degraded });
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function generateSample(url: string, siteText: string): Promise<string> {
  const system = [
    `You are the intelbase OS website concierge, the live AI that runs a business's front office. intelbase OS answers every visitor, qualifies them, books calls, and runs follow-up and ads, with guardrails so it never invents a price or makes a promise.`,
    `Voice: plain, confident, concrete. Short sentences. Never use em dashes. Never invent a price or guarantee a result.`,
    `Task: write a SHORT sample (3 to 5 lines) showing how you would greet and start qualifying a visitor on THIS prospect's own website, using what you can tell about their business. Open with a warm greeting, then ask one or two natural qualifying questions tailored to their business. Do not mention pricing. Do not use bullet points. Write it as the concierge would actually speak in a chat.`,
  ].join("\n\n");

  const context = siteText
    ? `Here is text scraped from the prospect's homepage (it may be messy):\n\n${siteText}`
    : `We could not read the prospect's site. Write a strong generic sample for a small business at ${url}, and still sound tailored and human.`;

  const user = `Prospect website: ${url}\n\n${context}\n\nWrite the sample greeting now.`;

  return generateText(system, user, 400);
}

// Static fallback used when the model call fails. On brand, no em dashes.
function fallbackSample(url: string): string {
  return [
    `Hi, welcome. I am the intelbase OS concierge for ${stripScheme(url)}, here around the clock.`,
    `To point you the right way, what brought you in today? And what kind of work does your business do?`,
    `Tell me what you need and I can answer it or book you a quick call with the team.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Site fetch (text only, capped, timed out, no script execution)
// ---------------------------------------------------------------------------

async function fetchSiteText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        // Identify ourselves; some sites block unknown agents.
        "user-agent": "intelbaseOS-demo-bot/1.0 (+https://intelbase.studio)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) throw new Error(`fetch ${res.status}`);

    // Only process HTML/text. We never evaluate JS; we read the body as a string
    // and strip tags. Binary/other content types are ignored.
    const contentType = res.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/i.test(contentType)) {
      return "";
    }

    const html = await readCapped(res, MAX_FETCH_BYTES);
    return htmlToText(html).slice(0, MAX_TEXT_CHARS);
  } finally {
    clearTimeout(timer);
  }
}

// Reads the response body but stops once we have enough bytes, so a huge or
// never-ending page cannot exhaust memory.
async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) {
    // No stream available, fall back to text() but still slice afterwards.
    const t = await res.text();
    return t.slice(0, maxBytes);
  }
  const decoder = new TextDecoder();
  let out = "";
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value?.byteLength ?? 0;
    out += decoder.decode(value, { stream: true });
    if (total >= maxBytes) {
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  return out;
}

// Strips scripts, styles, and tags to plain text. We REMOVE <script> and <style>
// content entirely so nothing executable or noisy reaches the model. This does no
// evaluation; it is pure string processing.
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Input helpers
// ---------------------------------------------------------------------------

// Accepts a bare domain or a full URL, returns a normalized http(s) URL or null.
function normalizeUrl(raw: string | undefined): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    // Reject obvious internal targets to limit SSRF surface on a public deploy.
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local")
    ) {
      return null;
    }
    return u.toString();
  } catch {
    return null;
  }
}

function isValidEmail(email: string): boolean {
  // Deliberately simple; real validation happens when we actually email them.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
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

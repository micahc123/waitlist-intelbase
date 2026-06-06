// Deterministic telemetry helpers for the OS demo shell.
// Everything is a pure function of a numeric time `t` (seconds) and an
// integer `seed`. NO Date.now() / Math.random() anywhere, so recordings of
// the dashboard are byte-for-byte reproducible.

/** Organic-looking jitter around `base`. Smooth, deterministic, seeded. */
export function wobble(seed: number, t: number, base: number, amp: number, freq = 1): number {
  return (
    base +
    amp * Math.sin(t * freq + seed) +
    amp * 0.4 * Math.sin(t * freq * 2.3 + seed * 1.7)
  );
}

/** Ever-increasing counter. Use Math.floor at the call site for integers. */
export function climb(t: number, base: number, perSec: number, seed = 0, jitter = 0): number {
  return base + perSec * t + wobble(seed, t, 0, jitter);
}

/** Oscillates within [lo, hi]. For progress bars, rings, gauges. */
export function gauge01(seed: number, t: number, lo = 0.2, hi = 0.85, freq = 0.7): number {
  const span = hi - lo;
  // map two sines into a smooth 0..1 band
  const raw = 0.5 + 0.5 * Math.sin(t * freq + seed) * 0.7 + 0.5 * 0.3 * Math.sin(t * freq * 1.9 + seed * 2.1);
  const clamped = Math.max(0, Math.min(1, raw));
  return lo + span * clamped;
}

/** Format an integer with thousands separators (deterministic). */
export function commas(n: number): string {
  return Math.floor(n).toLocaleString("en-US");
}

// Plausible, varied technical log lines across every subsystem.
export const LOG_LINES: string[] = [
  "router  38 req/min  p95 118ms",
  "concierge  matched intent: pricing  conf 0.94",
  "leadgen  enriched 3 contacts via apollo",
  "scoring  lead l-2294 -> strong fit (0.88)",
  "ads  bid +6% adset HK-12  roas 4.2",
  "nurture  queued step 2 for 14 contacts",
  "booking  held Fri 15:00 slot",
  "guardrail  price floor enforced HK$4,800",
  "verify  2 emails passed two-pass check",
  "concierge  answered visitor in 2.8s",
  "voice  call qualified, routed to calendar",
  "watch  competitor price change detected",
  "router  routed l-2301 -> nurture worker 3",
  "enrich  resolved company domain harbourdental.hk",
  "scoring  recomputed 42 leads in 211ms",
  "ads  paused adset HK-07  cpa above target",
  "concierge  handed off to human, low confidence 0.41",
  "nurture  sms delivered to 9 of 9 recipients",
  "booking  sync to google calendar ok",
  "leadgen  scraped 6 new inbound form fills",
  "security  blocked 1 bot signup from 203.0.113.x",
  "verify  phone +852 number validated via lookup",
  "router  queue depth 12  draining at 4.1/s",
  "ads  shifted HK$640 budget to top creative",
  "scoring  intent signal: visited pricing 3x",
  "concierge  summarised 11-turn thread in 1.2s",
  "nurture  reactivation sequence started for l-1988",
  "enrich  appended linkedin + headcount 24",
  "watch  inventory back in stock, notify 7 leads",
  "booking  rescheduled l-2255 to Mon 10:30",
  "guardrail  refused discount beyond 12% policy",
  "voice  transcribed 38s call, sentiment positive",
  "router  failover to replica eu-1, 0 dropped",
  "scoring  lead l-2310 -> weak fit (0.31) parked",
  "ads  creative C generated, queued for review",
  "concierge  detected language zh-HK, switched",
  "leadgen  dedup merged 2 duplicate records",
  "nurture  open rate 61% on step 1 batch",
  "verify  email l-2288 bounced, flagged invalid",
  "security  rotated api key for adsmanager",
  "enrich  timezone resolved Asia/Hong_Kong",
  "router  38 req/min  p95 109ms  err 0.02%",
  "booking  reminder sent 24h before Fri call",
  "scoring  model v3 promoted, auc 0.91",
];

/**
 * The last `n` log lines as if a new one streams every 1/rate seconds.
 * Newest first. Stable `id` so React keys stay consistent across frames.
 */
export function logTail(t: number, n: number, rate = 2.5): { id: string; text: string }[] {
  const len = LOG_LINES.length;
  const idx = Math.floor(t * rate);
  const out: { id: string; text: string }[] = [];
  for (let k = 0; k < n; k++) {
    const i = idx - k;
    const wrapped = ((i % len) + len) % len;
    out.push({ id: String(i), text: LOG_LINES[wrapped] });
  }
  return out;
}

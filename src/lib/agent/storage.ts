// AGENT-06: Lead persistence. Defines the LeadStore interface plus a default
// bundled file/JSON adapter for local/self-host, and an env-driven note + stub
// for swapping to a hosted store (Vercel KV / DB) on serverless.
// Framework-agnostic. No 'next' import.
//
// SERVERLESS CAVEAT (READ THIS):
//   The default FileLeadStore writes to the local filesystem. On serverless
//   platforms (Vercel, Netlify functions, AWS Lambda) the filesystem is EPHEMERAL
//   and not shared between invocations, so leads written by one request may be
//   gone on the next. For any real deploy you MUST swap in a hosted adapter
//   (Vercel KV / Upstash Redis / Postgres). Select it with LEAD_STORE=kv and
//   implement KVLeadStore below (stubbed). The file store is correct only for
//   local dev or a single long-lived self-hosted Node process with a writable disk.

import { promises as fs } from "fs";
import path from "path";
import type { ChatMessage, LeadMetrics, LeadQualification, LeadRecord } from "./types";

// The persistence contract. Routes/lib depend on this, never on a concrete store.
export interface LeadStore {
  // Create or update a lead by id. Returns the saved record.
  upsert(input: UpsertLeadInput): Promise<LeadRecord>;
  // Fetch one lead.
  get(id: string): Promise<LeadRecord | null>;
  // All leads, newest first.
  list(): Promise<LeadRecord[]>;
  // Aggregate counts for the dashboard.
  metrics(): Promise<LeadMetrics>;
}

export type UpsertLeadInput = {
  id: string;
  qualification: LeadQualification;
  messages: ChatMessage[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function computeMetrics(records: LeadRecord[]): LeadMetrics {
  return {
    conversations: records.length,
    qualified: records.filter((r) => r.qualification.qualified).length,
    booked: records.filter((r) => r.qualification.booked).length,
  };
}

// ---------------------------------------------------------------------------
// Default adapter: file/JSON store (local / self-host with a writable disk).
// ---------------------------------------------------------------------------

const DEFAULT_FILE = path.join(process.cwd(), ".data", "leads.json");

export class FileLeadStore implements LeadStore {
  private file: string;
  // Serialize writes so concurrent requests do not clobber the JSON file.
  private writeChain: Promise<unknown> = Promise.resolve();

  constructor(file: string = process.env.LEAD_STORE_FILE || DEFAULT_FILE) {
    this.file = file;
  }

  private async readAll(): Promise<LeadRecord[]> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as LeadRecord[]) : [];
    } catch (err: unknown) {
      // Missing file is the normal empty state.
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw err;
    }
  }

  private async writeAll(records: LeadRecord[]): Promise<void> {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(records, null, 2), "utf8");
  }

  async upsert(input: UpsertLeadInput): Promise<LeadRecord> {
    // Queue this write behind any in-flight write.
    const run = this.writeChain.then(async () => {
      const records = await this.readAll();
      const idx = records.findIndex((r) => r.id === input.id);
      const ts = nowIso();
      let record: LeadRecord;
      if (idx >= 0) {
        record = {
          ...records[idx],
          qualification: input.qualification,
          messages: input.messages,
          updatedAt: ts,
        };
        records[idx] = record;
      } else {
        record = {
          id: input.id,
          createdAt: ts,
          updatedAt: ts,
          qualification: input.qualification,
          messages: input.messages,
        };
        records.push(record);
      }
      await this.writeAll(records);
      return record;
    });
    // Keep the chain alive even if this write throws.
    this.writeChain = run.catch(() => undefined);
    return run;
  }

  async get(id: string): Promise<LeadRecord | null> {
    const records = await this.readAll();
    return records.find((r) => r.id === id) ?? null;
  }

  async list(): Promise<LeadRecord[]> {
    const records = await this.readAll();
    return records
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async metrics(): Promise<LeadMetrics> {
    return computeMetrics(await this.readAll());
  }
}

// ---------------------------------------------------------------------------
// Stub adapter: hosted KV (Vercel KV / Upstash). Implement before serverless deploy.
// ---------------------------------------------------------------------------
//
// To wire this up:
//   1. Add the dependency (e.g. `@vercel/kv` or `@upstash/redis`) via the
//      hand-back instructions, do not edit package.json blindly here.
//   2. Set LEAD_STORE=kv and the provider env vars (KV_REST_API_URL, KV_REST_API_TOKEN).
//   3. Replace the `throw` bodies below with real KV reads/writes. Suggested layout:
//        - one key per lead:  `lead:{id}` -> JSON LeadRecord
//        - one index set:     `leads:index` -> set of ids (for list()/metrics())
//
// Kept as a clearly-failing stub so a misconfigured serverless deploy fails loudly
// instead of silently losing leads to the ephemeral filesystem.

export class KVLeadStore implements LeadStore {
  constructor() {
    // No client created here on purpose, the dep is not installed yet.
  }
  private notImplemented(): never {
    throw new Error(
      "KVLeadStore is a stub. Install a KV client (e.g. @vercel/kv), set LEAD_STORE=kv and the provider env vars, then implement the methods in src/lib/agent/storage.ts. See the serverless caveat at the top of this file."
    );
  }
  async upsert(): Promise<LeadRecord> {
    return this.notImplemented();
  }
  async get(): Promise<LeadRecord | null> {
    return this.notImplemented();
  }
  async list(): Promise<LeadRecord[]> {
    return this.notImplemented();
  }
  async metrics(): Promise<LeadMetrics> {
    return this.notImplemented();
  }
}

// ---------------------------------------------------------------------------
// Selection: LEAD_STORE picks the adapter. Default "file".
// ---------------------------------------------------------------------------

let singleton: LeadStore | null = null;

export function createLeadStore(): LeadStore {
  const kind = (process.env.LEAD_STORE || "file").toLowerCase();
  if (kind === "kv") return new KVLeadStore();
  return new FileLeadStore();
}

// Process-wide singleton so the file store's write chain is shared.
export function getLeadStore(): LeadStore {
  if (!singleton) singleton = createLeadStore();
  return singleton;
}

// Shared types for the MEMORY layer (pgvector long-term memory).
//
// These describe what agents/webhooks write into the `memories` table and what
// recall/recent/stats hand back to the Memory Cortex dashboard view.

// The kind of thing a memory captures. Extend as new agents/surfaces appear.
export type MemoryKind =
  | "conversation"
  | "lead"
  | "booking"
  | "email"
  | "note"
  | "event"
  | "knowledge";

// What a caller passes to remember(). Only `kind` and `content` are required.
export interface MemoryInput {
  kind: MemoryKind;
  content: string;
  // Short human label for the memory (shown in the Cortex list).
  title?: string;
  // Where this came from (e.g. "whatsapp", "stripe-webhook", "calendar").
  source?: string;
  // Arbitrary structured payload (lead id, phone, amounts, etc.).
  metadata?: Record<string, unknown>;
}

// A row as stored / returned. `similarity` is only present on recall() results.
export interface MemoryRecord {
  id: string;
  org_id: string;
  kind: MemoryKind | string;
  source: string | null;
  title: string | null;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  // Cosine similarity to the query (0..1), set by match_memories on recall.
  similarity?: number;
}

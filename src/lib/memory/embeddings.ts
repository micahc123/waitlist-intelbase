// Embeddings for the MEMORY layer, via the Vercel AI SDK.
//
// Model: OpenAI text-embedding-3-small -> 1536 dimensions (matches the
// vector(1536) column in supabase/memory.sql).
//
// RESILIENCE: every function no-ops when OPENAI_API_KEY is missing. embedText
// returns null, embedTexts returns an array of nulls, and any runtime error is
// swallowed to null so a degraded key/network never throws into the caller.
// This lets the whole app compile and run with no OpenAI config at all.
//
// AI SDK shape (ai@6, @ai-sdk/openai@3):
//   - openai.embedding("text-embedding-3-small") builds the embedding model.
//   - embed({ model, value })   -> { embedding: number[] }
//   - embedMany({ model, values }) -> { embeddings: number[][] }

import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const MODEL = "text-embedding-3-small"; // 1536 dims

// True only when an OpenAI key is present. The provider reads the key from the
// environment (OPENAI_API_KEY), so we gate on that here.
export function embeddingsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

// Embed a single string. Returns null when unconfigured, empty, or on error.
export async function embedText(text: string): Promise<number[] | null> {
  if (!embeddingsConfigured()) return null;
  const value = text?.trim();
  if (!value) return null;

  try {
    const { embedding } = await embed({
      model: openai.embedding(MODEL),
      value,
    });
    return embedding;
  } catch {
    // Bad key, rate limit, network failure: degrade silently to null.
    return null;
  }
}

// Embed many strings at once. Returns an array of nulls (same length) when
// unconfigured; on success returns embeddings in the same order as `texts`.
// Empty/whitespace inputs map to null. On error the whole batch degrades to null.
export async function embedTexts(
  texts: string[],
): Promise<(number[] | null)[]> {
  if (!embeddingsConfigured()) return texts.map(() => null);

  // Only embed non-empty values; keep positions for empties as null.
  const indexed = texts.map((t, i) => ({ i, value: (t ?? "").trim() }));
  const toEmbed = indexed.filter((x) => x.value.length > 0);

  if (toEmbed.length === 0) return texts.map(() => null);

  try {
    const { embeddings } = await embedMany({
      model: openai.embedding(MODEL),
      values: toEmbed.map((x) => x.value),
    });

    const out: (number[] | null)[] = texts.map(() => null);
    toEmbed.forEach((x, k) => {
      out[x.i] = embeddings[k] ?? null;
    });
    return out;
  } catch {
    return texts.map(() => null);
  }
}

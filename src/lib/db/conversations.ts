// Data access for the Inbox surface (conversations + messages).
//
// Resilience contract: see src/lib/db/leads.ts. Conversation lists fall back to
// demo when empty so the inbox stays populated in the early product state.

import { createClient } from "@/lib/supabase/server";
import { demoConversation, demoConversations } from "./demo";
import type {
  Conversation,
  ConversationStatus,
  ConversationStatusCounts,
  ConversationWithMessages,
  Message,
} from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

const ALL_STATUSES: ConversationStatus[] = ["open", "waiting", "closed"];

export async function listConversations(
  orgId: string | null,
): Promise<Conversation[]> {
  if (!orgId || !configured()) return demoConversations();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("org_id", orgId)
      .order("last_at", { ascending: false });
    if (error || !data || data.length === 0) return demoConversations();
    return data as Conversation[];
  } catch {
    return demoConversations();
  }
}

export async function getConversation(
  orgId: string | null,
  id: string,
): Promise<ConversationWithMessages | null> {
  if (!orgId || !configured()) return demoConversation(id);
  try {
    const supabase = await createClient();
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("org_id", orgId)
      .eq("id", id)
      .maybeSingle();
    if (error || !conversation) return demoConversation(id);

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    return {
      ...(conversation as Conversation),
      messages: (messages as Message[]) ?? [],
    };
  } catch {
    return demoConversation(id);
  }
}

export async function conversationCounts(
  orgId: string | null,
): Promise<ConversationStatusCounts> {
  const conversations = await listConversations(orgId);
  const counts: ConversationStatusCounts = { open: 0, waiting: 0, closed: 0 };
  for (const c of conversations) {
    if (ALL_STATUSES.includes(c.status)) counts[c.status] += 1;
  }
  return counts;
}

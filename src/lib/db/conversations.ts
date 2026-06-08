// Data access for the Inbox surface (conversations + messages).
//
// Resilience contract: see src/lib/db/leads.ts. Demo data only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own conversations, even when empty; query errors
// return the empty equivalent, not demo.

import { createClient } from "@/lib/supabase/server";
import { demoConversation, demoConversations } from "./demo";
import type {
  Conversation,
  ConversationStatus,
  ConversationStatusCounts,
  ConversationWithMessages,
  Message,
} from "./types";
import { isDemoContext } from "./util";

const ALL_STATUSES: ConversationStatus[] = ["open", "waiting", "closed"];

export async function listConversations(
  orgId: string | null,
): Promise<Conversation[]> {
  if (isDemoContext(orgId)) return demoConversations();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("org_id", orgId)
      .order("last_at", { ascending: false });
    if (error) return [];
    return (data as Conversation[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function getConversation(
  orgId: string | null,
  id: string,
): Promise<ConversationWithMessages | null> {
  if (isDemoContext(orgId)) return demoConversation(id);
  try {
    const supabase = await createClient();
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("org_id", orgId)
      .eq("id", id)
      .maybeSingle();
    if (error || !conversation) return null;

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
    return null;
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

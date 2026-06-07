// The agent RUNTIME: turns an AgentDef + a conversation into a Claude response,
// wired to the org's Composio tools and pgvector long-term memory.
//
//   buildContext(orgId, agentId, latestUserText)
//       -> a "Relevant memory:" block (or "") from recall()
//   runAgent({ orgId, agentId, messages, orgName })
//       -> non-streamed result with text, step count, and tool names called
//   streamAgent({ orgId, agentId, messages, orgName })
//       -> the streamText() result, so the route can stream it
//
// RESILIENCE (critical): this module never throws at import or request time.
//   - No ANTHROPIC_API_KEY        -> a clear canned reply, no model call.
//   - Composio unconfigured       -> tools = {}, the agent can chat but not act.
//   - Memory unconfigured         -> recall()/remember() no-op safely.
//   - Any model error             -> caught and returned as graceful text.

import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText, stepCountIs } from "ai";
import type { ToolSet } from "ai";

// The streamText() result type, inferred so we do not have to hardcode the
// (versioned) OUTPUT generic. streamText is synchronous in ai v6.
type AgentStream = ReturnType<typeof streamText>;

import { getAgent } from "@/lib/agents/agents";
import type { AgentChatMessage } from "@/lib/agents/types";
import { recall, remember } from "@/lib/memory/memory";

// Canned reply used whenever the model cannot run (no key). The API still
// returns a normal response so the chat UI keeps working in dev.
const OFFLINE_REPLY =
  "I am not fully online yet. Add the ANTHROPIC_API_KEY to activate live agents.";

function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type RunAgentInput = {
  orgId: string;
  agentId: string;
  messages: AgentChatMessage[];
  orgName?: string;
};

export type RunAgentResult = {
  text: string;
  steps?: number;
  toolCalls?: string[];
};

// Pull the latest user message text out of a conversation (for memory recall
// and for titling the stored memory). Returns "" when there is none.
function latestUserText(messages: AgentChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return messages[i].content ?? "";
  }
  return "";
}

// First non-empty line of the latest user message, trimmed for a memory title.
function firstUserLine(messages: AgentChatMessage[]): string {
  const text = latestUserText(messages);
  const line = text.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  return line.slice(0, 120);
}

// RAG: fetch the org's most relevant memories for this turn and format them into
// a prompt block. Returns "" when there are no memories (or memory is off).
export async function buildContext(
  orgId: string,
  agentId: string,
  latest: string,
): Promise<string> {
  void agentId; // agentId reserved for future per-agent memory scoping.
  if (!orgId || !latest?.trim()) return "";

  const memories = await recall(orgId, latest, 6);
  if (!memories.length) return "";

  const lines = memories.map((m) => {
    const label = m.title?.trim() || m.kind;
    const snippet = m.content.replace(/\s+/g, " ").trim().slice(0, 400);
    return `- ${label}: ${snippet}`;
  });

  return ["Relevant memory:", ...lines].join("\n");
}

// Build the full system prompt: the agent's prompt with {business} interpolated,
// plus the memory block when there is one.
function buildSystem(
  promptTemplate: string,
  orgName: string,
  memoryBlock: string,
): string {
  const withOrg = promptTemplate.split("{business}").join(orgName);
  return memoryBlock ? `${withOrg}\n\n${memoryBlock}` : withOrg;
}

// Persist this turn to long-term memory. Best-effort: never throws.
async function persistTurn(
  orgId: string,
  agentId: string,
  messages: AgentChatMessage[],
  assistantText: string,
): Promise<void> {
  try {
    const user = latestUserText(messages);
    const title = firstUserLine(messages) || "conversation";
    const content = [
      user ? `User: ${user}` : "",
      assistantText ? `Assistant: ${assistantText}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    if (!content) return;
    await remember(orgId, {
      kind: "conversation",
      source: agentId,
      title,
      content,
    });
  } catch {
    // best-effort persistence; ignore failures.
  }
}

// Collect the distinct tool names called across all steps.
function toolNamesFromSteps(
  steps: ReadonlyArray<{ toolCalls?: ReadonlyArray<{ toolName: string }> }>,
): string[] {
  const names = new Set<string>();
  for (const step of steps ?? []) {
    for (const call of step.toolCalls ?? []) {
      if (call?.toolName) names.add(call.toolName);
    }
  }
  return Array.from(names);
}

// Non-streamed run. Resolves the agent, loads tools + memory, calls Claude with
// multi-step tool use, persists the turn, and returns text + telemetry.
export async function runAgent(
  input: RunAgentInput,
): Promise<RunAgentResult> {
  const { orgId, agentId, messages } = input;
  const orgName = input.orgName?.trim() || "your business";

  const agent = getAgent(agentId);
  if (!agent) {
    return { text: `Unknown agent "${agentId}".` };
  }

  if (!hasAnthropicKey()) {
    return { text: OFFLINE_REPLY };
  }

  try {
    // Composio import is lazy / loosely typed; cast to the SDK ToolSet shape.
    const { getToolsForOrg } = await import("@/lib/integrations/composio");
    const tools = (await getToolsForOrg(orgId, agent.toolkits)) as ToolSet;

    const memoryBlock = await buildContext(
      orgId,
      agentId,
      latestUserText(messages),
    );
    const system = buildSystem(agent.systemPrompt, orgName, memoryBlock);

    const result = await generateText({
      model: anthropic(agent.model),
      system,
      messages,
      tools,
      stopWhen: stepCountIs(8),
    });

    await persistTurn(orgId, agentId, messages, result.text);

    return {
      text: result.text,
      steps: result.steps?.length,
      toolCalls: toolNamesFromSteps(result.steps ?? []),
    };
  } catch {
    return {
      text: "Something went wrong while running that. Please try again in a moment.",
    };
  }
}

// Streamed run. Same setup as runAgent but returns the streamText() result so
// the route handler can convert it to a streamed Response. Persists the turn in
// onFinish. Returns null when offline (the route returns the canned reply).
export async function streamAgent(
  input: RunAgentInput,
): Promise<AgentStream | null> {
  const { orgId, agentId, messages } = input;
  const orgName = input.orgName?.trim() || "your business";

  const agent = getAgent(agentId);
  if (!agent || !hasAnthropicKey()) {
    return null;
  }

  const { getToolsForOrg } = await import("@/lib/integrations/composio");
  const tools = (await getToolsForOrg(orgId, agent.toolkits)) as ToolSet;

  const memoryBlock = await buildContext(
    orgId,
    agentId,
    latestUserText(messages),
  );
  const system = buildSystem(agent.systemPrompt, orgName, memoryBlock);

  return streamText({
    model: anthropic(agent.model),
    system,
    messages,
    tools,
    stopWhen: stepCountIs(8),
    onFinish: async (event) => {
      // Best-effort: persist the completed turn to long-term memory.
      await persistTurn(orgId, agentId, messages, event.text);
    },
  });
}

// Whether the runtime can serve live model responses. Used by the route to
// decide between streaming and the canned offline reply.
export function isAgentRuntimeOnline(): boolean {
  return hasAnthropicKey();
}

export { OFFLINE_REPLY };

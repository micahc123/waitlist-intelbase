// Shared types for the Intelbase agent runtime.
//
// An AgentDef is a static description of one agent in the OS: its identity, the
// Composio toolkits it is allowed to use, the Claude model it runs on, and the
// system prompt that defines its job and tone. AgentChatMessage is the minimal
// message shape the chat API accepts and forwards to the model.

export type AgentDef = {
  // Stable id used in the route (/api/agents/[id]/chat) and as the memory source.
  id: string;
  // Human label shown in the UI.
  name: string;
  // Short domain label (for example "Email", "Calendar", "Operations").
  domain: string;
  // One-line description of what this agent does.
  tagline: string;
  // The system prompt. May contain "{business}" which the runtime interpolates
  // with the org name at request time.
  systemPrompt: string;
  // Composio toolkit slugs this agent is allowed to use (see lib/integrations).
  toolkits: string[];
  // Claude model id this agent runs on (for example "claude-opus-4-6").
  model: string;
};

export type AgentChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

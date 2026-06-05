// Orchestrator: runs one full agent turn end to end. Framework-agnostic, this is
// what the thin Next.js route calls. No 'next' import.
//
// Flow per turn:
//   1. Build the system prompt from the messaging foundation + current qualification.
//   2. Call Claude (structured JSON output).
//   3. Apply guardrails (price/promise backstop + confidence/handoff escape hatch).
//   4. Fold the turn into the qualification state machine.
//   5. Resolve a booking action if qualified or handing off.
// On any model/transport error we degrade to a safe handoff reply, never a crash.

import { buildSystemPrompt } from "./systemPrompt";
import { callClaude, AgentClientError } from "./client";
import { applyGuardrails, HANDOFF_MESSAGE } from "./guardrails";
import { applyTurn, emptyQualification } from "./qualify";
import { resolveBooking } from "./booking";
import type {
  AgentTurnResult,
  ChatMessage,
  LeadQualification,
} from "./types";

export type RunAgentInput = {
  // Full conversation so far (visitor + assistant turns). The latest message is
  // the visitor's new input.
  messages: ChatMessage[];
  // Running qualification state for this conversation (from storage). Optional on
  // the first turn.
  qualification?: LeadQualification;
};

export async function runAgentTurn(
  input: RunAgentInput
): Promise<AgentTurnResult> {
  const priorQualification = input.qualification ?? emptyQualification();
  const systemPrompt = buildSystemPrompt({ qualification: priorQualification });

  try {
    const output = await callClaude(systemPrompt, input.messages);

    // Guardrail gate runs before anything reaches the visitor.
    const decision = applyGuardrails(output);

    // Update qualification from the (raw) model extraction, regardless of handoff,
    // booked latches if the model saw booking intent.
    const qualification = applyTurn(priorQualification, output);

    const booking = resolveBooking(qualification, decision.handoff);

    return {
      reply: decision.reply,
      qualification,
      handoff: decision.handoff,
      booking,
      confidence: decision.confidence,
    };
  } catch (err) {
    // Auth/transport/parse failures degrade to a safe handoff. We still surface a
    // booking action so the visitor has a path forward. The visitor always sees
    // the same safe message; the error detail is for server logs only.
    if (err instanceof AgentClientError) {
      // Surfaced here so a deploy-time auth misconfig is visible in logs.
      console.error(`[agent] ${err.name} (${err.status ?? "n/a"}): ${err.message}`);
    } else {
      console.error("[agent] unexpected error:", err);
    }

    const qualification = priorQualification;
    const booking = resolveBooking(qualification, true);

    return {
      reply: HANDOFF_MESSAGE,
      qualification,
      handoff: true,
      booking,
      confidence: 0,
    };
  }
}

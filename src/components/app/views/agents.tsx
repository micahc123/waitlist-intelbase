// Agents - the roster of automations running the business. Placeholder empty
// state; the data layer wires the agent list and run history next.

import { Bot } from "lucide-react";
import { ViewHead, EmptyPanel } from "./view-shell";

export function Agents() {
  return (
    <div className="ibx">
      <ViewHead
        title="Agents"
        subtitle="The automations doing the work, and what each one is responsible for."
      />
      <EmptyPanel
        icon={<Bot size={22} />}
        title="This is where your agents live"
        body="Each agent (concierge, nurture, ad engine, and more) shows its status, recent runs, and the guardrails it operates under."
      />
    </div>
  );
}

// Approvals - the human-in-the-loop queue. Placeholder empty state; the data
// layer wires the pending-action list and approve/decline controls next.

import { ShieldCheck } from "lucide-react";
import { ViewHead, EmptyPanel } from "./view-shell";

export function Approvals() {
  return (
    <div className="ibx">
      <ViewHead
        title="Approvals"
        subtitle="Actions your agents have drafted and are holding for your sign-off."
      />
      <EmptyPanel
        icon={<ShieldCheck size={22} />}
        title="This is where approvals live"
        body="When an agent proposes a send, a spend, or a change that needs a human, it queues here for a one-tap approve or decline."
      />
    </div>
  );
}

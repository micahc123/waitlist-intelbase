// Leads - the contact and pipeline surface. Placeholder empty state; the data
// layer wires the lead table and stage pipeline next.

import { Users } from "lucide-react";
import { ViewHead, EmptyPanel } from "./view-shell";

export function Leads() {
  return (
    <div className="ibx">
      <ViewHead
        title="Leads"
        subtitle="People who reached out, captured and qualified automatically."
      />
      <EmptyPanel
        icon={<Users size={22} />}
        title="This is where your leads live"
        body="New contacts are enriched, scored, and routed into a pipeline here, so nothing slips and every lead gets a timely first touch."
      />
    </div>
  );
}

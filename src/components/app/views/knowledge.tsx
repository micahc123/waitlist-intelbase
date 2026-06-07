// Knowledge - the business brain your agents draw on. Placeholder empty state;
// the data layer wires the document/source list and ingestion next.

import { BookOpen } from "lucide-react";
import { ViewHead, EmptyPanel } from "./view-shell";

export function Knowledge() {
  return (
    <div className="ibx">
      <ViewHead
        title="Knowledge"
        subtitle="The facts, policies, and context your agents use to act on your behalf."
      />
      <EmptyPanel
        icon={<BookOpen size={22} />}
        title="This is where your knowledge base lives"
        body="Upload documents, paste policies, and connect sources here. Everything your agents say and do is grounded in what you put in."
      />
    </div>
  );
}

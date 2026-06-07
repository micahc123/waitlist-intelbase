// Inbox - unified conversations across channels. Placeholder empty state; the
// data layer wires the threaded message list next.

import { Inbox as InboxIcon } from "lucide-react";
import { ViewHead, EmptyPanel } from "./view-shell";

export function Inbox() {
  return (
    <div className="ibx">
      <ViewHead
        title="Inbox"
        subtitle="Every conversation your business is having, in one place."
      />
      <EmptyPanel
        icon={<InboxIcon size={22} />}
        title="This is where your unified inbox lives"
        body="Email, WhatsApp, web chat, and SMS land here as a single thread per contact, with your agents drafting replies for review."
      />
    </div>
  );
}

// Shared scaffolding for placeholder work-shell views. Each view renders a
// titled section plus an on-system .ibx-empty state so the shell is fully
// navigable and looks intentional while the data layer is built next.

import type { ReactNode } from "react";

export function ViewHead({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="app-view-head">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </header>
  );
}

export function EmptyPanel({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="ibx-panel">
      <div className="ibx-empty">
        <div className="ibx-empty-icon">{icon}</div>
        <div style={{ fontSize: "var(--ib-fs-base)", fontWeight: 600, color: "var(--ib-text-2)" }}>
          {title}
        </div>
        <div style={{ maxWidth: "44ch" }}>{body}</div>
      </div>
    </div>
  );
}

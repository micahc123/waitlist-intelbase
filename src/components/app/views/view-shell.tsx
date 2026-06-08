// Shared scaffolding for work-shell views. Each view follows the same shape:
//
//   loading -> data | empty | error
//
//   - while a fetch is in flight render <Loading /> (a shimmer skeleton)
//   - on success render the data, or <EmptyPanel /> when there is none
//   - on failure render <ErrorState message onRetry={refetch} />
//
// ViewHead gives every view its single <h2> + subtitle. Skeleton styles and the
// shimmer keyframe live in app.css (guarded by prefers-reduced-motion).

import type { ReactNode } from "react";
import { TriangleAlert, RotateCw } from "lucide-react";

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

// Shimmer skeleton shown while a view's primary fetch is in flight. `rows`
// controls how many placeholder lines render. `aria-busy` + a polite live
// label keep screen readers informed without spamming them.
export function Loading({
  label = "Loading",
  rows = 4,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="ibx-panel ib-loading" aria-busy="true" aria-live="polite">
      <span className="ib-sr-only">{label}</span>
      <div className="ib-skel ib-skel-head" aria-hidden="true" />
      {Array.from({ length: rows }).map((_, i) => (
        <div className="ib-skel ib-skel-row" aria-hidden="true" key={i} />
      ))}
    </div>
  );
}

// Consistent failure state: icon + message + a "Try again" button that calls
// onRetry (typically a refetch). Use whenever a fetch rejects.
export function ErrorState({
  message = "Something went wrong loading this view.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="ibx-panel ib-errorstate" role="alert">
      <div className="ib-errorstate-icon" aria-hidden="true">
        <TriangleAlert size={20} strokeWidth={2} />
      </div>
      <div className="ib-errorstate-msg">{message}</div>
      {onRetry ? (
        <button type="button" className="ibx-btn" onClick={onRetry}>
          <RotateCw size={14} strokeWidth={2} />
          Try again
        </button>
      ) : null}
    </div>
  );
}

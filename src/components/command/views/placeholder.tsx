"use client";

import * as Lucide from "lucide-react";

export function ViewPlaceholder({
  title,
  sub,
  icon,
}: {
  title: string;
  sub: string;
  icon: string;
}) {
  const Icon = (Lucide as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[
    icon
  ] ?? Lucide.Circle;
  return (
    <div className="cmd-view-ph">
      <span className="cmd-view-ph-glow" />
      <span className="cmd-view-ph-icon">
        <Icon size={30} strokeWidth={1.4} />
      </span>
      <div className="cmd-view-ph-title">{title}</div>
      <div className="cmd-view-ph-sub">{sub}</div>
    </div>
  );
}

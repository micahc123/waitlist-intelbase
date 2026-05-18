type IconName =
  | "bolt"
  | "node"
  | "sparkles"
  | "brain"
  | "box"
  | "share"
  | "code"
  | "arrow"
  | "check"
  | "wa";

export function Icon({ name }: { name: IconName }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "bolt":
      return (
        <svg {...props}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      );
    case "node":
      return (
        <svg {...props}>
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M8 11l8-4" />
          <path d="M8 13l8 4" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" />
        </svg>
      );
    case "brain":
      return (
        <svg {...props}>
          <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 5v0a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v0a3 3 0 0 0 2-5v0a3 3 0 0 0-2-5v0a3 3 0 0 0-3-3z" />
          <path d="M12 4v16" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 7v10l9 4 9-4V7" />
          <path d="M12 11v10" />
        </svg>
      );
    case "share":
      return (
        <svg {...props}>
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M8 11l8-4M8 13l8 4" />
        </svg>
      );
    case "code":
      return (
        <svg {...props}>
          <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12 4 4 10-10" />
        </svg>
      );
    case "wa":
      return (
        <svg {...props}>
          <path d="M21 12a9 9 0 1 1-3.4-7L21 3l-1.5 4.5A9 9 0 0 1 21 12z" />
          <path d="M8 12a4 4 0 0 0 4 4l2 1 1-2a4 4 0 0 0-3-3" />
        </svg>
      );
    default:
      return null;
  }
}

export function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="reveal">{children}</div>;
}

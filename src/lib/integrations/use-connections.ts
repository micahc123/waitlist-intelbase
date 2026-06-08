"use client";

// Client hook for fetching real integration connection status and initiating
// Composio OAuth. When Composio is not configured (503 or configured:false),
// connect() returns "unconfigured" and does NOT fake a connected toggle.
//
// Usage:
//   const { isConnected, connect, loading, configured } = useConnections();
//   isConnected("gmail")    // true|false (from real server rows only)
//   await connect("gmail")  // "redirecting"    - real OAuth redirect started
//                           // "unconfigured"   - no COMPOSIO_API_KEY, do nothing
//                           // "error"          - configured but SDK failed

import { useState, useEffect, useCallback } from "react";

type ConnectionEntry = { provider: string; connected: boolean };

export type ConnectResult = "redirecting" | "unconfigured" | "error";

type UseConnectionsReturn = {
  // Whether the hook has finished its initial status fetch.
  loading: boolean;
  // Whether Composio is configured server-side (COMPOSIO_API_KEY is set).
  configured: boolean;
  // True if the given toolkit slug is currently connected (real rows only).
  isConnected: (slug: string) => boolean;
  // Initiate a connect for the given slug.
  // "redirecting"  - real OAuth redirect initiated (browser will navigate away).
  // "unconfigured" - Composio is not configured; caller should show honest note.
  // "error"        - configured but something went wrong; caller may show error.
  // NEVER fakes a connected state locally.
  connect: (slug: string) => Promise<ConnectResult>;
};

export function useConnections(): UseConnectionsReturn {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  // On mount, fetch the real status from the server.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/integrations/status", {
          credentials: "include",
        });
        if (!cancelled && res.ok) {
          const data = (await res.json()) as {
            configured?: boolean;
            connections?: ConnectionEntry[];
          };
          setConfigured(Boolean(data.configured));
          const map: Record<string, boolean> = {};
          for (const c of data.connections ?? []) {
            map[c.provider] = c.connected;
          }
          setStatuses(map);
        }
      } catch {
        // Network error: leave configured=false, statuses empty.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isConnected = useCallback(
    (slug: string) => Boolean(statuses[slug]),
    [statuses],
  );

  const connect = useCallback(
    async (slug: string): Promise<ConnectResult> => {
      try {
        const res = await fetch("/api/integrations/connect", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolkit: slug }),
        });

        if (res.ok) {
          const data = (await res.json()) as { url?: string };
          if (data.url) {
            // Real OAuth: redirect the browser away.
            window.location.href = data.url;
            return "redirecting";
          }
          // ok but no url - treat as error, not simulated.
          return "error";
        }

        if (res.status === 503) {
          const data = (await res.json().catch(() => ({}))) as {
            configured?: boolean;
          };
          if (data.configured === false) {
            return "unconfigured";
          }
          return "error";
        }

        return "error";
      } catch {
        return "error";
      }
    },
    [],
  );

  return { loading, configured, isConnected, connect };
}

"use client";

// Client hook for fetching real integration connection status and initiating
// Composio OAuth. Falls back gracefully to a simulated "connected" toggle when
// Composio is not configured (503 response or any network/fetch error).
//
// Usage:
//   const { isConnected, connect, loading } = useConnections();
//   isConnected("gmail")    // true|false
//   await connect("gmail")  // returns true = real OAuth redirect initiated
//                           //           false = simulated fallback used

import { useState, useEffect, useCallback } from "react";

type ConnectionEntry = { provider: string; connected: boolean };

type UseConnectionsReturn = {
  // Whether the hook has finished its initial status fetch.
  loading: boolean;
  // True if the given toolkit slug is currently connected.
  isConnected: (slug: string) => boolean;
  // Initiate a connect for the given slug.
  // Returns true when a real OAuth redirect was initiated (browser will navigate
  // away), false when the simulated fallback was used (caller should toggle
  // local state itself).
  connect: (slug: string) => Promise<boolean>;
  // Force-set a slug as connected locally (for simulated path).
  setConnected: (slug: string, value: boolean) => void;
};

export function useConnections(): UseConnectionsReturn {
  const [loading, setLoading] = useState(true);
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
            connections?: ConnectionEntry[];
          };
          const map: Record<string, boolean> = {};
          for (const c of data.connections ?? []) {
            map[c.provider] = c.connected;
          }
          setStatuses(map);
        }
      } catch {
        // Network error: continue with empty statuses; simulated path handles it.
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

  const setConnected = useCallback((slug: string, value: boolean) => {
    setStatuses((prev) => ({ ...prev, [slug]: value }));
  }, []);

  const connect = useCallback(
    async (slug: string): Promise<boolean> => {
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
            // Real OAuth: redirect the browser. Returns true so caller knows
            // NOT to toggle local state (page will navigate away).
            window.location.href = data.url;
            return true;
          }
        }

        // 503 simulated, 4xx, network error, or no url: use simulated path.
        // Caller is responsible for local toggling; we return false.
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  return { loading, isConnected, connect, setConnected };
}

// Calendar - the schedule. A 7-day week grid (day columns, hour rows 08:00-19:00)
// rendering listEvents as colored blocks positioned by start/end time and tinted
// by channel, each showing the title, attendee, and time. A prev/next/today week
// control sits above; a "Scheduler" badge marks events the Scheduler agent booked.
// An "Upcoming" side list shows the next events chronologically. Reads from
// /api/app/calendar (window + upcoming), which serves deterministic DEMO data when
// Supabase is unconfigured so the calendar populates with no keys.

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import type { CalendarEvent } from "@/lib/db/types";
import "./calendar.css";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_START = 8; // 08:00
const HOUR_END = 19; // 19:00 (last row label)
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const ROW_PX = 52; // px per hour

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CHANNEL_ACCENT: Record<string, string> = {
  "in-person": "var(--ib-mint)",
  phone: "var(--ib-blue)",
  video: "var(--ib-violet)",
  whatsapp: "var(--ib-mint)",
  web: "var(--ib-cyan)",
};

function accentFor(channel: string | null): string {
  return CHANNEL_ACCENT[channel ?? ""] ?? "var(--ib-amber)";
}

function startOfWeek(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - s.getDay()); // Sunday-start
  return s;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtTime(d: Date): string {
  return d
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    .replace(/^24:/, "00:");
}

function fmtHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY_MS)),
    [weekStart],
  );

  useEffect(() => {
    let active = true;
    const from = weekStart.toISOString();
    const to = new Date(weekStart.getTime() + 7 * DAY_MS).toISOString();
    setEvents(null);
    fetch(`/api/app/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((r) => r.json())
      .then((data: { events: CalendarEvent[]; upcoming: CalendarEvent[] }) => {
        if (!active) return;
        setEvents(data.events ?? []);
        setUpcoming(data.upcoming ?? []);
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, [weekStart]);

  // Group events by day index within the visible week.
  const eventsByDay = useMemo(() => {
    const map: CalendarEvent[][] = [[], [], [], [], [], [], []];
    (events ?? []).forEach((e) => {
      const start = new Date(e.start_at);
      const idx = weekDays.findIndex((d) => sameDay(d, start));
      if (idx >= 0) map[idx].push(e);
    });
    return map;
  }, [events, weekDays]);

  const rangeLabel = useMemo(() => {
    const end = new Date(weekStart.getTime() + 6 * DAY_MS);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString("en-GB", opts)} - ${end.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
  }, [weekStart]);

  const now = new Date();
  const gridHeight = HOURS.length * ROW_PX;

  return (
    <div className="ibx cal">
      <ViewHead
        title="Calendar"
        subtitle="Every booking in one week view - including the appointments your Scheduler agent confirmed for you."
      />

      <div className="cal-bar">
        <div className="cal-nav" role="group" aria-label="Week navigation">
          <button
            type="button"
            className="cal-nav-btn"
            onClick={() => setWeekStart((d) => new Date(d.getTime() - 7 * DAY_MS))}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="ibx-btn ibx-btn-ghost cal-today"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            Today
          </button>
          <button
            type="button"
            className="cal-nav-btn"
            onClick={() => setWeekStart((d) => new Date(d.getTime() + 7 * DAY_MS))}
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="cal-range">{rangeLabel}</div>
      </div>

      <div className="cal-layout">
        <div className="ibx-panel cal-grid-panel">
          {/* day header row */}
          <div className="cal-head-row">
            <div className="cal-gutter-head" aria-hidden="true" />
            {weekDays.map((d, i) => {
              const isToday = sameDay(d, now);
              return (
                <div
                  key={i}
                  className={`cal-day-head${isToday ? " is-today" : ""}`}
                >
                  <span className="cal-day-name">{DAY_NAMES[d.getDay()]}</span>
                  <span className="cal-day-num">{d.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* scrollable grid body */}
          <div className="cal-grid-scroll">
            <div className="cal-grid" style={{ height: gridHeight }}>
              {/* hour gutter */}
              <div className="cal-gutter">
                {HOURS.map((h) => (
                  <div key={h} className="cal-hour-label" style={{ height: ROW_PX }}>
                    <span>{fmtHour(h)}</span>
                  </div>
                ))}
              </div>

              {/* day columns */}
              {weekDays.map((d, di) => {
                const isToday = sameDay(d, now);
                return (
                  <div
                    key={di}
                    className={`cal-col${isToday ? " is-today" : ""}`}
                    style={{ height: gridHeight }}
                  >
                    {/* hour grid lines */}
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="cal-cell"
                        style={{ height: ROW_PX }}
                        aria-hidden="true"
                      />
                    ))}

                    {/* now indicator */}
                    {isToday &&
                      now.getHours() >= HOUR_START &&
                      now.getHours() <= HOUR_END && (
                        <div
                          className="cal-now"
                          style={{
                            top:
                              (now.getHours() - HOUR_START) * ROW_PX +
                              (now.getMinutes() / 60) * ROW_PX,
                          }}
                          aria-hidden="true"
                        >
                          <span className="cal-now-dot" />
                        </div>
                      )}

                    {/* events */}
                    {events !== null &&
                      eventsByDay[di].map((e) => (
                        <EventBlock key={e.id} event={e} />
                      ))}
                  </div>
                );
              })}
            </div>
          </div>

          {events !== null && (events?.length ?? 0) === 0 && (
            <div className="cal-empty-overlay">
              <div className="ibx-empty">
                <div className="ibx-empty-icon">
                  <CalendarIcon size={22} />
                </div>
                <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                  No bookings this week
                </div>
                <div style={{ maxWidth: "34ch" }}>
                  When a call or appointment is booked - by you or the Scheduler
                  agent - it appears on the grid.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* upcoming side list */}
        <aside className="ibx-panel cal-upcoming">
          <div className="ibx-panel-head">
            <span className="cal-upcoming-title">Upcoming</span>
          </div>
          <div className="cal-upcoming-body">
            {events === null &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="cal-up-skel" aria-hidden="true" />
              ))}
            {events !== null && upcoming.length === 0 && (
              <div className="cal-upcoming-empty">No upcoming events.</div>
            )}
            {events !== null &&
              upcoming.map((e) => {
                const start = new Date(e.start_at);
                return (
                  <div key={e.id} className="cal-up-item">
                    <span
                      className="cal-up-rail"
                      style={{ background: accentFor(e.channel) }}
                      aria-hidden="true"
                    />
                    <div className="cal-up-main">
                      <div className="cal-up-title">{e.title}</div>
                      <div className="cal-up-meta">
                        {start.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {fmtTime(start)}
                      </div>
                      {e.attendee && (
                        <div className="cal-up-attendee">{e.attendee}</div>
                      )}
                      {e.booked_by === "scheduler" && (
                        <span className="cal-scheduler-badge">
                          <Sparkles size={11} />
                          booked by Scheduler
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  const startHrs = start.getHours() + start.getMinutes() / 60;
  const endHrs = end.getHours() + end.getMinutes() / 60;
  // Clamp to the visible window.
  const top = (Math.max(startHrs, HOUR_START) - HOUR_START) * ROW_PX;
  const bottom = (Math.min(endHrs, HOUR_END + 1) - HOUR_START) * ROW_PX;
  const height = Math.max(22, bottom - top);
  const accent = accentFor(event.channel);
  const tentative = event.status === "tentative";
  const cancelled = event.status === "cancelled";

  return (
    <div
      className={`cal-event${tentative ? " is-tentative" : ""}${cancelled ? " is-cancelled" : ""}`}
      style={
        {
          top,
          height,
          // accent is used as a CSS var so the border + tint pick it up
          "--cal-accent": accent,
        } as React.CSSProperties
      }
      title={`${event.title} · ${fmtTime(start)}-${fmtTime(end)}${event.attendee ? ` · ${event.attendee}` : ""}`}
    >
      <div className="cal-event-time">
        {fmtTime(start)}
        {event.booked_by === "scheduler" && (
          <Sparkles size={10} className="cal-event-spark" aria-label="booked by Scheduler" />
        )}
      </div>
      <div className="cal-event-title">{event.title}</div>
      {height > 46 && event.attendee && (
        <div className="cal-event-attendee">
          {height > 70 && event.location ? (
            <span className="cal-event-loc">
              <MapPin size={10} /> {event.location}
            </span>
          ) : (
            event.attendee
          )}
        </div>
      )}
    </div>
  );
}

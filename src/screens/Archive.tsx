/**
 * Session archive: browse ANY past date, not just recent ones.
 * Date list (searchable) → sessions of that date → opens session detail.
 */
import { useEffect, useState } from "react";
import { listDates, listSessions, type SessionMeta } from "../lib/session";

export default function Archive({
  onOpenSession,
}: {
  onOpenSession: (date: string, sessionId: string) => void;
}) {
  const [dates, setDates] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionMeta[]>([]);

  useEffect(() => {
    listDates().then((d) => {
      setDates(d);
      if (d.length > 0) setSelectedDate(d[0]);
    });
  }, []);

  useEffect(() => {
    if (selectedDate) listSessions(selectedDate).then(setSessions);
  }, [selectedDate]);

  const visibleDates = dates.filter((d) => d.includes(filter));

  return (
    <div className="flex gap-6 h-full">
      <aside className="w-56 shrink-0 space-y-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter dates… (2026-07)"
          className="w-full bg-ink border border-edge rounded-md px-3 py-2 text-sm font-mono placeholder:text-fg-faint focus:outline-none focus:border-accent"
        />
        <div className="space-y-1 overflow-y-auto">
          {visibleDates.length === 0 && (
            <p className="text-sm text-fg-faint px-1">No sessions yet.</p>
          )}
          {visibleDates.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`w-full text-left font-mono text-sm px-3 py-2 rounded-md transition-colors ${
                d === selectedDate
                  ? "bg-panel-raised text-fg border border-edge-strong"
                  : "text-fg-muted hover:text-fg hover:bg-panel"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex-1 space-y-2">
        {selectedDate && sessions.length === 0 && (
          <p className="text-sm text-fg-faint">No sessions on {selectedDate}.</p>
        )}
        {sessions.map((s) => (
          <button
            key={s.sessionId}
            onClick={() => onOpenSession(s.date, s.sessionId)}
            className="w-full flex items-center justify-between bg-panel hover:bg-panel-raised border border-edge rounded-lg px-4 py-3 transition-colors text-left"
          >
            <span className="font-mono text-sm">{s.sessionId}</span>
            <span className="text-xs text-fg-muted">
              {s.entryCount} {s.entryCount === 1 ? "entry" : "entries"}
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

/**
 * Session detail: entries with timestamp, tag badge, summary, screenshot
 * thumbnail; inline edit and delete. Gateways to Curate and Compile.
 */
import { useEffect, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import TagBadge from "../components/TagBadge";
import {
  readSession,
  updateEntry,
  deleteEntry,
  type SessionEntry,
} from "../lib/session";

const TAGS: SessionEntry["tag"][] = ["bugfix", "update", "feature"];

export default function SessionDetail({
  date,
  sessionId,
  onBack,
  onCurate,
  onCompile,
}: {
  date: string;
  sessionId: string;
  onBack: () => void;
  onCurate: () => void;
  onCompile: () => void;
}) {
  const [entries, setEntries] = useState<SessionEntry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ tag: "update" as SessionEntry["tag"], title: "", summary: "" });

  function reload() {
    readSession(date, sessionId).then(setEntries);
  }
  useEffect(reload, [date, sessionId]);

  function beginEdit(e: SessionEntry) {
    setEditing(e.id);
    setDraft({ tag: e.tag, title: e.title, summary: e.summary });
  }

  async function saveEdit(id: string) {
    await updateEntry(date, sessionId, id, draft);
    setEditing(null);
    reload();
  }

  async function remove(id: string) {
    await deleteEntry(date, sessionId, id);
    reload();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-fg-muted hover:text-fg text-sm transition-colors">
            ← archive
          </button>
          <h2 className="font-mono text-sm">
            {date} / {sessionId}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCurate}
            className="text-sm border border-edge-strong hover:border-fg-muted text-fg-muted hover:text-fg px-3 py-1.5 rounded-md transition-colors"
          >
            Curate
          </button>
          <button
            onClick={onCompile}
            className="text-sm bg-accent hover:bg-accent-dim text-white px-3 py-1.5 rounded-md transition-colors"
          >
            Compile
          </button>
        </div>
      </header>

      {entries.length === 0 && <p className="text-sm text-fg-faint">No entries in this session.</p>}

      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="bg-panel border border-edge rounded-lg p-4">
            {editing === e.id ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {TAGS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDraft({ ...draft, tag: t })}
                      className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                        draft.tag === t
                          ? "border-accent text-accent"
                          : "border-edge-strong text-fg-muted hover:text-fg"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  value={draft.title}
                  onChange={(ev) => setDraft({ ...draft, title: ev.target.value })}
                  className="w-full bg-ink border border-edge rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <textarea
                  value={draft.summary}
                  onChange={(ev) => setDraft({ ...draft, summary: ev.target.value })}
                  rows={3}
                  className="w-full bg-ink border border-edge rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(e.id)}
                    className="text-sm bg-accent hover:bg-accent-dim text-white px-3 py-1.5 rounded-md transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-sm text-fg-muted hover:text-fg px-3 py-1.5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <TagBadge tag={e.tag} />
                    <span className="font-mono text-xs text-fg-faint">
                      {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ""}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-sm text-fg-muted line-clamp-2">{e.summary}</p>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => beginEdit(e)}
                      className="text-xs text-fg-muted hover:text-fg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(e.id)}
                      className="text-xs text-fg-muted hover:text-accent transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {e.screenshotPath && (
                  <img
                    src={convertFileSrc(e.screenshotPath)}
                    alt=""
                    className="w-24 h-16 object-cover rounded border border-edge shrink-0"
                  />
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

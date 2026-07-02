/**
 * Compile view: turn captured entries into a document.
 * Scopes: this session / this day (enabled), this week (visible, disabled).
 * The compile itself goes through the AI stub — the single swap point for
 * the future local model.
 */
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { compileEntries } from "../lib/ai-stub";
import { readSession, listSessions } from "../lib/session";

type Scope = "session" | "day";

export default function Compile({
  date,
  sessionId,
  onBack,
}: {
  date: string;
  sessionId: string;
  onBack: () => void;
}) {
  const [doc, setDoc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function compile(scope: Scope) {
    setBusy(true);
    try {
      let markdowns: string[] = [];
      if (scope === "session") {
        const entries = await readSession(date, sessionId);
        markdowns = entries.map((e) => `## ${e.title}\n\n${e.summary}`);
      } else {
        for (const s of await listSessions(date)) {
          const entries = await readSession(date, s.sessionId);
          markdowns.push(...entries.map((e) => `## ${e.title}\n\n${e.summary}`));
        }
      }
      setDoc(await compileEntries(markdowns));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-fg-muted hover:text-fg text-sm transition-colors">
            ← session
          </button>
          <h2 className="font-mono text-sm">
            compile: {date} / {sessionId}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => compile("session")}
            disabled={busy}
            className="text-sm bg-accent hover:bg-accent-dim disabled:opacity-50 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            This session
          </button>
          <button
            onClick={() => compile("day")}
            disabled={busy}
            className="text-sm border border-edge-strong hover:border-fg-muted disabled:opacity-50 text-fg-muted hover:text-fg px-3 py-1.5 rounded-md transition-colors"
          >
            This day
          </button>
          <button
            disabled
            title="Coming soon"
            className="text-sm border border-edge text-fg-faint px-3 py-1.5 rounded-md cursor-not-allowed"
          >
            This week — coming soon
          </button>
        </div>
      </header>

      {doc ? (
        <article className="bg-panel border border-edge rounded-lg p-6 prose-ghlg">
          <ReactMarkdown>{doc}</ReactMarkdown>
        </article>
      ) : (
        <p className="text-sm text-fg-faint">
          {busy ? "Compiling…" : "Pick a scope to compile the captured entries into a document."}
        </p>
      )}
    </div>
  );
}

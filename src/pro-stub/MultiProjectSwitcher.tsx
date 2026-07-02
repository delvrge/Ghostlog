/**
 * Presentational-only placeholder for Ghostlog Pro's multi-project switcher.
 * Renders hardcoded sample data — no state, no props wired to real watched
 * folders, no import anywhere in the app. See CLAUDE.md.
 */
import type { ProProject } from "./types";

const SAMPLE_PROJECTS: ProProject[] = [
  { id: "sample-1", name: "example-app", path: "/path/to/example-app" },
  { id: "sample-2", name: "example-api", path: "/path/to/example-api" },
];

export default function MultiProjectSwitcher() {
  return (
    <div className="bg-panel border border-edge rounded-lg px-4 py-3 opacity-50 pointer-events-none">
      <p className="text-xs text-fg-faint uppercase tracking-wide mb-2">Projects (Pro preview)</p>
      <ul className="space-y-1">
        {SAMPLE_PROJECTS.map((p) => (
          <li key={p.id} className="text-sm text-fg-muted font-mono">
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

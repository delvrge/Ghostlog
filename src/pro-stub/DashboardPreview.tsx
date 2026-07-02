/**
 * Presentational-only placeholder for Ghostlog Pro's expanded dashboard.
 * Renders hardcoded sample metrics — no data fetching, no import anywhere
 * in the app. See CLAUDE.md.
 */
import type { DashboardMetric } from "./types";

const SAMPLE_METRICS: DashboardMetric[] = [
  { label: "Captures this week", value: 0 },
  { label: "Projects tracked", value: 0 },
];

export default function DashboardPreview() {
  return (
    <div className="bg-panel border border-edge rounded-lg px-4 py-3 opacity-50 pointer-events-none">
      <p className="text-xs text-fg-faint uppercase tracking-wide mb-2">Dashboard (Pro preview)</p>
      <div className="grid grid-cols-2 gap-3">
        {SAMPLE_METRICS.map((m) => (
          <div key={m.label}>
            <p className="text-lg font-mono">{m.value}</p>
            <p className="text-xs text-fg-faint">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

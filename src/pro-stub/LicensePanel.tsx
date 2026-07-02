/**
 * Presentational-only placeholder for Ghostlog Pro's license management.
 * No validation logic, no network calls, no import anywhere in the app.
 * See CLAUDE.md.
 */
import type { LicenseInfo } from "./types";

const SAMPLE_LICENSE: LicenseInfo = { key: "XXXX-XXXX-XXXX-XXXX", seats: 1, validUntil: "—" };

export default function LicensePanel() {
  return (
    <div className="bg-panel border border-edge rounded-lg px-4 py-3 opacity-50 pointer-events-none">
      <p className="text-xs text-fg-faint uppercase tracking-wide mb-2">License (Pro preview)</p>
      <p className="text-sm text-fg-muted font-mono">{SAMPLE_LICENSE.key}</p>
    </div>
  );
}

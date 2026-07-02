/**
 * Non-functional type placeholders for Ghostlog Pro features. See
 * CLAUDE.md — nothing in src/pro-stub/ may be wired into app logic; these
 * shapes exist so a future GHLG-pro repo has a stable contract to target,
 * not because anything here does anything.
 */

export interface ProProject {
  id: string;
  name: string;
  path: string;
}

export interface LicenseInfo {
  key: string;
  seats: number;
  validUntil: string;
}

export interface DashboardMetric {
  label: string;
  value: number;
}

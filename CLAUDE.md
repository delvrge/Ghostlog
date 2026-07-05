# GHLG (Ghostlog)

Ghostlog is a free, fully open-source local dev-notes tool. This repo is PUBLIC.

The former open-core / pro-tier split was dropped on 2026-07-04: there is no
GHLG-pro repo, no licensing, and no paywall. Previously "pro" features
(multi-project watching, dashboard) are being folded into this single free
build — write them here like any other feature. The old `src/pro-stub/`
placeholder directory and the `hooks/pre-commit` pro-identifier guard have
been removed.

Design principles that still hold:
- Local-first: zero network ports; frontend↔backend is Tauri IPC only,
  browser extension talks over Native Messaging (stdio).
- No cloud calls, no telemetry. AI is bring-your-own local endpoint.
- Path scoping is enforced in Rust, never trusted to the UI.

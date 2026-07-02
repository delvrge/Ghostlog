/**
 * GHLG content script — runs ONLY on http://localhost/* and http://127.0.0.1/*
 * (enforced by manifest host_permissions + content_scripts matches).
 *
 * Triggers: a manual hotkey (Cmd/Ctrl+Shift+G), mirroring the desktop app's
 * "manual trigger" tier feature. Console-error auto-detection exists as a
 * stub only — disabled by default, matching the desktop Settings' disabled
 * auto-error-detection trigger (not a free-tier feature yet).
 */
import type { CaptureRequest } from "./protocol.js";

const AUTO_ERROR_DETECTION_ENABLED = false;

function sendCapture(trigger: CaptureRequest["trigger"]): void {
  const request: CaptureRequest = {
    kind: "capture",
    trigger,
    url: location.href,
  };
  chrome.runtime.sendMessage(request);
}

window.addEventListener("keydown", (e) => {
  const isHotkey = e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g";
  if (isHotkey) {
    e.preventDefault();
    sendCapture("hotkey");
  }
});

if (AUTO_ERROR_DETECTION_ENABLED) {
  window.addEventListener("error", () => {
    sendCapture("console-error");
  });
}

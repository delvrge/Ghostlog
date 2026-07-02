/**
 * Message shapes shared between the content script, the background service
 * worker, and (eventually, step 8) the Native Messaging host. Kept in one
 * place so the wire format only needs to change in one spot.
 */

/** Native Messaging host id — registered by step 8. Not functional until then. */
export const NATIVE_HOST_NAME = "com.ghostlog.native";

export type CaptureTrigger = "hotkey" | "console-error";

/** Content script -> background. */
export interface CaptureRequest {
  kind: "capture";
  trigger: CaptureTrigger;
  url: string;
  note?: string;
}

/** Background -> native host. */
export interface NativeCaptureMessage {
  type: "manual_capture";
  note?: string;
  source: "extension";
}

export type ExtensionStatus = "connected" | "disconnected";

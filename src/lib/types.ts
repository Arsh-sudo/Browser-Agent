// Shared vocabulary for the extension. Keep this file in sync with whatever
// the server/model side expects — it's the contract between your two halves
// of the team.

export type AgentStatus = "idle" | "capturing" | "redacting" | "thinking" | "acting" | "error";

/** A single redacted region found on the current screen, in normalized 0-1 coordinates
 *  (so it stays correct regardless of viewport size or when drawn scaled down in the UI). */
export interface RedactedRegion {
  id: string;
  kind: "password" | "email" | "phone" | "face" | "pii-text" | "other";
  x: number;
  y: number;
  width: number;
  height: number;
  /** Model confidence 0-1, if available. */
  confidence?: number;
}

/** One entry in the activity log shown in the popup / side panel. */
export interface LogEntry {
  id: string;
  timestamp: number;
  status: AgentStatus;
  message: string;
}

/** A sanitized snapshot of the page, safe to send to the server. Never contains
 *  raw text content from input fields, only structural/positional info. */
export interface SanitizedContext {
  url: string;
  title: string;
  viewport: { width: number; height: number };
  /** Interactive elements the agent could act on, already redacted of sensitive values. */
  elements: Array<{
    id: string;
    tag: string;
    role?: string;
    label?: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  redactedRegions: RedactedRegion[];
}

/** An action the server tells the client to perform. */
export type AgentAction =
  | { type: "click"; elementId: string }
  | { type: "type"; elementId: string; text: string }
  | { type: "scroll"; direction: "up" | "down"; amount: number }
  | { type: "done"; summary: string };

// ---- Runtime messages exchanged via chrome.runtime.sendMessage ----

export type ExtensionMessage =
  | { type: "START_TASK"; task: string }
  | { type: "STOP_TASK" }
  | { type: "GET_STATE" }
  | { type: "CLEAR_LOG" }
  | { type: "STATE_UPDATE"; status: AgentStatus; log: LogEntry[]; regions: RedactedRegion[] }
  | { type: "CAPTURE_CONTEXT_REQUEST" }
  | { type: "CAPTURE_CONTEXT_RESPONSE"; context: SanitizedContext }
  | { type: "EXECUTE_ACTION"; action: AgentAction };

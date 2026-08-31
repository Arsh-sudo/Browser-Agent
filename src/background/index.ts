import type { AgentStatus, ExtensionMessage, LogEntry, RedactedRegion, SanitizedContext } from "../lib/types";
import { newId, onMessage, sendToTab } from "../lib/messaging";
import { detectAndRedact, callServer } from "../lib/mockAgent";

interface State {
  status: AgentStatus;
  log: LogEntry[];
  regions: RedactedRegion[];
  activeTabId: number | null;
  task: string | null;
}

const state: State = {
  status: "idle",
  log: [],
  regions: [],
  activeTabId: null,
  task: null,
};

function log(status: AgentStatus, message: string) {
  state.status = status;
  state.log = [...state.log, { id: newId(), timestamp: Date.now(), status, message }].slice(-50);
  broadcastState();
}

function broadcastState() {
  // Popup/side panel may not be open — ignore "no receiver" errors.
  chrome.runtime
    .sendMessage({
      type: "STATE_UPDATE",
      status: state.status,
      log: state.log,
      regions: state.regions,
    } satisfies ExtensionMessage)
    .catch(() => {});
}

async function runAgentLoop(task: string) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    log("error", "No active tab found.");
    return;
  }
  state.activeTabId = tab.id;
  state.task = task;

  try {
    log("capturing", `Reading screen state for task: "${task}"`);
    const context = (await sendToTab(tab.id, { type: "CAPTURE_CONTEXT_REQUEST" })) as
      | SanitizedContext
      | undefined;

    if (!context) {
      log("error", "Content script did not return a screen context. Is this a restricted page (chrome://, Web Store)?");
      return;
    }

    log("redacting", "Scanning for sensitive fields before anything leaves the device...");
    const regions = detectAndRedact(context);
    state.regions = regions;
    log(
      "redacting",
      regions.length > 0
        ? `Redacted ${regions.length} sensitive region(s): ${regions.map((r) => r.kind).join(", ")}.`
        : "No sensitive regions detected on this screen."
    );

    log("thinking", "Sending sanitized context to server for the next action...");
    const action = await callServer(task, { ...context, redactedRegions: regions });

    log("acting", `Server returned action: ${action.type}`);
    await sendToTab(tab.id, { type: "EXECUTE_ACTION", action });

    if (action.type === "done") {
      log("idle", action.summary);
    } else {
      log("idle", "Action executed. Waiting for next instruction.");
    }
  } catch (err) {
    log("error", `Agent loop failed: ${(err as Error).message}`);
  }
}

onMessage((message, _sender) => {
  switch (message.type) {
    case "START_TASK":
      log("idle", `Task received: "${message.task}"`);
      void runAgentLoop(message.task);
      break;
    case "STOP_TASK":
      state.task = null;
      log("idle", "Agent stopped by user.");
      break;
    case "GET_STATE":
      broadcastState();
      break;
    default:
      break;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  log("idle", "Agent installed. Open the popup and give it a task to try.");
});

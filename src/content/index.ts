import type { AgentAction, ExtensionMessage, SanitizedContext } from "../lib/types";
import { newId, onMessage } from "../lib/messaging";

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"], [onclick]';

/** Build a structural snapshot of the page. Deliberately never reads
 *  `.value` on inputs — only attributes that describe the *shape* of the
 *  field (type, placeholder, name, aria-label), which is what the real
 *  ViT redaction pass will also work from once it's wired in. */
function captureContext(): SanitizedContext {
  const idMap = new WeakMap<Element, string>();
  const elements: SanitizedContext["elements"] = [];

  document.querySelectorAll(INTERACTIVE_SELECTOR).forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const id = newId();
    idMap.set(el, id);
    el.setAttribute("data-agent-id", id);

    const label =
      el.getAttribute("aria-label") ||
      el.getAttribute("placeholder") ||
      el.getAttribute("name") ||
      el.getAttribute("type") ||
      el.textContent?.trim().slice(0, 60) ||
      "";

    elements.push({
      id,
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role") ?? undefined,
      label,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  });

  return {
    url: location.href,
    title: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    elements,
    redactedRegions: [], // filled in by the background/mock-agent pass, not here
  };
}

function executeAction(action: AgentAction) {
  switch (action.type) {
    case "click": {
      const el = document.querySelector<HTMLElement>(`[data-agent-id="${action.elementId}"]`);
      el?.click();
      break;
    }
    case "type": {
      const el = document.querySelector<HTMLInputElement>(`[data-agent-id="${action.elementId}"]`);
      if (el) {
        el.focus();
        el.value = action.text;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      break;
    }
    case "scroll": {
      window.scrollBy({ top: action.direction === "down" ? action.amount : -action.amount, behavior: "smooth" });
      break;
    }
    case "done":
      break;
  }
}

// The background script talks to us via chrome.tabs.sendMessage; we must
// reply synchronously-ish for CAPTURE_CONTEXT_REQUEST, so we use the
// low-level listener (not the fire-and-forget `onMessage` helper) for that one.
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === "CAPTURE_CONTEXT_REQUEST") {
    sendResponse(captureContext());
    return true;
  }
  if (message.type === "EXECUTE_ACTION") {
    executeAction(message.action);
  }
  return false;
});

onMessage(() => {
  // Reserved for future push-style messages (e.g. live overlay updates).
});

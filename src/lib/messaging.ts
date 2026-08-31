import type { ExtensionMessage } from "./types";

/** Send a message from popup/sidepanel/content to the background service worker. */
export function send(message: ExtensionMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

/** Send a message to a specific tab's content script. */
export function sendToTab(tabId: number, message: ExtensionMessage): Promise<unknown> {
  return chrome.tabs.sendMessage(tabId, message);
}

/** Subscribe to messages. Returns an unsubscribe function. */
export function onMessage(
  handler: (message: ExtensionMessage, sender: chrome.runtime.MessageSender) => void
): () => void {
  const listener = (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: unknown) => void
  ) => {
    handler(message, sender);
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}

export function newId(): string {
  return crypto.randomUUID();
}

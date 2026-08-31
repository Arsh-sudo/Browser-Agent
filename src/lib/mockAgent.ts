import type { AgentAction, RedactedRegion, SanitizedContext } from "./types";
import { newId } from "./messaging";

/**
 * ============================================================================
 *  STUB — replace with the real pipeline before finals.
 *
 *  detectAndRedact(): should be swapped for the client-side ViT / ONNX Runtime
 *  Web model that actually reads the screen and finds sensitive regions.
 *
 *  callServer(): should be swapped for the real fetch() to the team's
 *  server-side VLM endpoint. Keep the function signature the same so the
 *  rest of the extension (background/content/UI) doesn't need to change —
 *  only this file should need editing.
 * ============================================================================
 */

/** Fake "local vision model" pass: uses cheap DOM heuristics instead of a real
 *  ViT so the rest of the extension is demoable before the model is ready. */
export function detectAndRedact(context: SanitizedContext): RedactedRegion[] {
  const regions: RedactedRegion[] = [];

  for (const el of context.elements) {
    const label = (el.label ?? "").toLowerCase();
    let kind: RedactedRegion["kind"] | null = null;

    if (el.tag === "input" && label.includes("password")) kind = "password";
    else if (label.includes("email")) kind = "email";
    else if (label.includes("phone") || label.includes("mobile")) kind = "phone";
    else if (/\b\d{10}\b/.test(label) || /@/.test(label)) kind = "pii-text";

    if (kind) {
      regions.push({
        id: newId(),
        kind,
        x: el.x / context.viewport.width,
        y: el.y / context.viewport.height,
        width: el.width / context.viewport.width,
        height: el.height / context.viewport.height,
        confidence: 0.6, // heuristic guess, not a real model score
      });
    }
  }

  return regions;
}

/** Fake "server call": echoes back a scripted action so the end-to-end flow
 *  (capture -> redact -> send -> act) can be demoed without a live backend. */
export async function callServer(
  task: string,
  context: SanitizedContext
): Promise<AgentAction> {
  await new Promise((r) => setTimeout(r, 600)); // simulate network latency

  const clickable = context.elements.find((el) => el.tag === "button" || el.role === "button");
  if (clickable) {
    return { type: "click", elementId: clickable.id };
  }
  return { type: "done", summary: `No actionable element found for task: "${task}"` };
}

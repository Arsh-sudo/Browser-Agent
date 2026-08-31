# On-Device Visual Perception Agent — Chrome Extension (SIH26171)

Chrome Extension (Manifest V3) + UI half of the team's build. This is a working,
loadable skeleton: popup, side panel, background orchestrator, and content
script are all wired together and communicating. The only stubbed part is the
actual perception/redaction model and the server call — those are marked
clearly below for whoever owns that piece.

## Run it locally

```bash
npm install
npm run dev      # starts Vite in watch mode, writes to dist/ on every save
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**, select the `dist/` folder
4. Pin the extension, open any normal `http://` / `https://` page (not
   `chrome://` pages — the content script can't run there), click the
   extension icon, type a task, hit **Run**

For a one-off production build instead of watch mode: `npm run build`.

## How it's wired

```
popup / side panel (React)
        │  chrome.runtime.sendMessage({ type: "START_TASK", task })
        ▼
background/index.ts  (service worker — owns all state, the "agent loop")
        │  chrome.tabs.sendMessage → CAPTURE_CONTEXT_REQUEST
        ▼
content/index.ts  (runs in the page, reads the DOM, never reads input values)
        │  returns a SanitizedContext
        ▼
background/index.ts
        │  detectAndRedact(context)   ← STUB, see below
        │  callServer(task, context)  ← STUB, see below
        ▼
content/index.ts  executes the returned AgentAction (click / type / scroll)
```

Every message type is defined once in `src/lib/types.ts` — that file is the
contract between the extension and the model/server side. If the real
pipeline needs a different shape of data, change it there first and
TypeScript will flag every place that needs updating.

## Where to plug in the real model + server

Everything fake lives in **`src/lib/mockAgent.ts`**, and only that file
should need to change:

- `detectAndRedact(context)` — currently uses cheap label-matching heuristics
  (looks for `type="password"`, "email" in a placeholder, etc). Swap this for
  the real client-side ViT / ONNX Runtime Web / Transformers.js pass that
  actually looks at the rendered screen and finds sensitive regions.
- `callServer(task, context)` — currently waits 600ms and returns a scripted
  action. Swap this for the real `fetch()` to the server-side VLM endpoint.
  Keep the function signature (`(task, context) => Promise<AgentAction>`) the
  same and nothing else in the extension needs to change.

The rest of the codebase (background orchestration, content script,
popup/side panel UI, activity log, redaction map) already expects real data
in exactly this shape once you swap those two functions.

## What's already working

- **Popup** — task input, start/stop, live status pill, scrolling activity
  console, running count of redacted regions.
- **Side panel** — same activity log plus a visual map plotting where on the
  page each redacted region was, without ever showing what was inside it
  (useful for the demo: you can point at the box and say "that's the
  password field, and it never left the browser").
- **Background service worker** — holds all state centrally so popup and
  side panel always agree, even if one is closed and reopened mid-task.
- **Content script** — captures interactive elements (buttons, inputs,
  links) with position + structural label only, never `.value`, and can
  execute `click` / `type` / `scroll` actions coming back from the agent
  loop.

## Known gaps / next steps

- No real screenshot capture yet (`chrome.tabs.captureVisibleTab`) — right
  now "screen state" is a DOM element list, not pixels. If the real model
  needs actual pixels, wire capture into `background/index.ts` alongside the
  existing DOM capture and add it to `SanitizedContext`.
- No visible on-page overlay — redaction boxes are only shown in the side
  panel, not drawn over the live page. Worth adding for the demo if there's
  time (`content/index.ts` would draw absolutely-positioned `<div>`s).
- No persistence — activity log resets when the service worker is evicted.
  `chrome.storage.local` is already in the manifest's permissions if you
  want to add it.

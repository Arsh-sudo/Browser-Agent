import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "On-Device Visual Perception Agent (SIH26171)",
  description:
    "Privacy-preserving browser agent: reads the screen locally, redacts sensitive data before it ever leaves the device, then asks a server-side model what to do next.",
  version: pkg.version,
  icons: {
    16: "icons/icon16.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  action: {
    default_popup: "src/popup/popup.html",
    default_icon: {
      16: "icons/icon16.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
  side_panel: {
    default_path: "src/sidepanel/sidepanel.html",
  },
  permissions: ["activeTab", "scripting", "storage", "sidePanel", "tabs"],
  host_permissions: ["http://*/*", "https://*/*"],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      // Pages opened via chrome.tabs.create() (not referenced by the manifest
      // itself, like the popup or side panel are) need to be added as explicit
      // build inputs or Vite won't know to bundle them.
      input: {
        onboarding: "src/onboarding/onboarding.html",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: { port: 5173 },
  },
});

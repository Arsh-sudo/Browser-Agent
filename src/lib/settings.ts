export interface AgentSettings {
  /** Which kinds of sensitive content the redaction pass looks for. */
  redactionCategories: {
    password: boolean;
    email: boolean;
    phone: boolean;
    piiText: boolean;
    /** Face blurring needs the real vision model — kept here so the UI/toggle
     *  already exists once that lands, but disabled until then. */
    face: boolean;
  };
  /** Pause before executing a click/type/scroll so a human can approve it. */
  confirmBeforeActing: boolean;
  /** Draw redaction boxes directly on the page, not just in the side panel. */
  showOnPageOverlay: boolean;
  /** Base URL the background worker calls for the server-side VLM step. */
  serverEndpoint: string;
  /** If non-empty, the agent will only run on these domains. Empty = all sites. */
  siteAllowlist: string[];
  /** Opt-in: share which domains triggered redactions (domain only, no content)
   *  to help tune the heuristics. Off by default. */
  shareAnonymizedMetrics: boolean;
}

export const DEFAULT_SETTINGS: AgentSettings = {
  redactionCategories: {
    password: true,
    email: true,
    phone: true,
    piiText: true,
    face: false,
  },
  confirmBeforeActing: true,
  showOnPageOverlay: false,
  serverEndpoint: "http://localhost:8000/agent",
  siteAllowlist: [],
  shareAnonymizedMetrics: false,
};

const STORAGE_KEY = "agentSettings";

export async function getSettings(): Promise<AgentSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = (result[STORAGE_KEY] ?? {}) as Partial<AgentSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    redactionCategories: {
      ...DEFAULT_SETTINGS.redactionCategories,
      ...(stored.redactionCategories ?? {}),
    },
  };
}

export async function saveSettings(settings: AgentSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

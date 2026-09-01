import { useState } from "react";
import Toggle from "./Toggle";
import { useSettings } from "../lib/useSettings";
import { useAgentState } from "../lib/useAgentState";
import { send } from "../lib/messaging";

const CATEGORY_LABELS: Record<string, { label: string; hint: string; disabled?: boolean }> = {
  password: { label: "Password fields", hint: "Any input recognized as a password." },
  email: { label: "Email addresses", hint: "Labels, placeholders, or text matching an email pattern." },
  phone: { label: "Phone numbers", hint: "Labels or text matching a phone number pattern." },
  piiText: { label: "Other personal text", hint: "Free text that looks like it contains personal details." },
  face: { label: "Faces in screenshots", hint: "Not available yet — needs the on-device vision model.", disabled: true },
};

function SavedIndicator({ savedAt }: { savedAt: number | null }) {
  if (!savedAt) return null;
  return <span className="saved-indicator">Saved</span>;
}

export default function Options() {
  const { settings, update, updateCategory, savedAt } = useSettings();
  const { log } = useAgentState();
  const [domainInput, setDomainInput] = useState("");

  function addDomain(e: React.FormEvent) {
    e.preventDefault();
    const domain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!domain || settings.siteAllowlist.includes(domain)) return;
    update({ siteAllowlist: [...settings.siteAllowlist, domain] });
    setDomainInput("");
  }

  function removeDomain(domain: string) {
    update({ siteAllowlist: settings.siteAllowlist.filter((d) => d !== domain) });
  }

  function clearLog() {
    void send({ type: "CLEAR_LOG" });
  }

  return (
    <div className="options">
      <header className="options__header">
        <div>
          <h1>Visual Perception Agent — Settings</h1>
          <p className="options__subtitle">
            Reads the screen locally, redacts anything sensitive, and sends only sanitized context to the server —
            and only while a task is running.
          </p>
        </div>
        <SavedIndicator savedAt={savedAt} />
      </header>

      <section className="options__section">
        <h2>Core behavior</h2>

        <div className="options__row">
          <div>
            <strong>Redact sensitive data before every request</strong>
            <p>The agent never sends raw field values to the server. This stays on.</p>
          </div>
          <Toggle checked locked onChange={() => {}} />
        </div>

        <div className="options__row">
          <div>
            <strong>Ask before acting on the page</strong>
            <p>Pause for your approval before the agent clicks, types, or scrolls anything.</p>
          </div>
          <Toggle checked={settings.confirmBeforeActing} onChange={(v) => update({ confirmBeforeActing: v })} />
        </div>

        <div className="options__row">
          <div>
            <strong>Show redaction boxes on the page</strong>
            <p>Draw a highlight directly over redacted fields, not just in the side panel.</p>
          </div>
          <Toggle checked={settings.showOnPageOverlay} onChange={(v) => update({ showOnPageOverlay: v })} />
        </div>
      </section>

      <section className="options__section">
        <h2>What gets redacted</h2>
        <p className="options__section-lede">
          Uncheck a category to stop the agent from treating it as sensitive. Leave everything on unless you have a
          specific reason not to.
        </p>
        <div className="category-list">
          {Object.entries(CATEGORY_LABELS).map(([key, meta]) => (
            <label key={key} className={`category-row ${meta.disabled ? "category-row--disabled" : ""}`}>
              <input
                type="checkbox"
                checked={settings.redactionCategories[key as keyof typeof settings.redactionCategories]}
                disabled={meta.disabled}
                onChange={(e) =>
                  updateCategory(key as keyof typeof settings.redactionCategories, e.target.checked)
                }
              />
              <div>
                <strong>{meta.label}</strong>
                <p>{meta.hint}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="options__section">
        <h2>Data sent</h2>
        <div className="data-disclosure">
          <div>
            <strong>Sent to the server</strong>
            <p>The task you typed, plus a sanitized page structure — element positions and non-sensitive labels only.</p>
          </div>
          <div>
            <strong>Never sent</strong>
            <p>Raw field values, screenshots of redacted regions, your browsing history, or anything identifying you.</p>
          </div>
        </div>

        <div className="options__row options__row--tight">
          <div>
            <strong>Help improve redaction coverage</strong>
            <p>Share which domains triggered redactions (domain name only, no page content) to help tune detection.</p>
          </div>
          <Toggle
            checked={settings.shareAnonymizedMetrics}
            onChange={(v) => update({ shareAnonymizedMetrics: v })}
          />
        </div>
      </section>

      <section className="options__section">
        <h2>Server endpoint</h2>
        <p className="options__section-lede">Where the background worker sends sanitized context for the agent's next action.</p>
        <input
          type="text"
          className="text-input"
          value={settings.serverEndpoint}
          onChange={(e) => update({ serverEndpoint: e.target.value })}
          spellCheck={false}
        />
      </section>

      <section className="options__section">
        <h2>Site permissions</h2>
        <p className="options__section-lede">
          {settings.siteAllowlist.length === 0
            ? "The agent can currently run on any site. Add a domain below to restrict it to only those sites."
            : "The agent will only run on the domains listed below."}
        </p>
        <form className="domain-form" onSubmit={addDomain}>
          <input
            type="text"
            className="text-input"
            placeholder="example.com"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
          />
          <button type="submit" className="btn btn--start" disabled={!domainInput.trim()}>
            Add
          </button>
        </form>
        {settings.siteAllowlist.length > 0 && (
          <ul className="domain-list">
            {settings.siteAllowlist.map((domain) => (
              <li key={domain}>
                <span>{domain}</span>
                <button type="button" onClick={() => removeDomain(domain)} aria-label={`Remove ${domain}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="options__section">
        <h2>Activity log</h2>
        <div className="options__row options__row--tight">
          <div>
            <strong>{log.length} entr{log.length === 1 ? "y" : "ies"} stored</strong>
            <p>Kept in memory only, cleared automatically when Chrome unloads the extension's background worker.</p>
          </div>
          <button type="button" className="btn btn--stop" onClick={clearLog} disabled={log.length === 0}>
            Clear now
          </button>
        </div>
      </section>

      <footer className="options__footer">
        Built for SIH26171 — On-device Visual Perception for Light-weight Browser Agents. Local-first: redaction
        happens on your device before anything is transmitted.
      </footer>
    </div>
  );
}

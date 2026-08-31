import { useAgentState } from "../lib/useAgentState";
import type { RedactedRegion } from "../lib/types";

const KIND_LABEL: Record<RedactedRegion["kind"], string> = {
  password: "Password field",
  email: "Email",
  phone: "Phone number",
  face: "Face",
  "pii-text": "Personal info",
  other: "Other",
};

function RedactionMap({ regions }: { regions: RedactedRegion[] }) {
  return (
    <div className="redaction-map">
      <div className="redaction-map__viewport">
        {regions.length === 0 && <p className="redaction-map__empty">Nothing redacted yet</p>}
        {regions.map((r) => (
          <div
            key={r.id}
            className="redaction-map__box"
            title={`${KIND_LABEL[r.kind]}${r.confidence ? ` — ${Math.round(r.confidence * 100)}% confidence` : ""}`}
            style={{
              left: `${r.x * 100}%`,
              top: `${r.y * 100}%`,
              width: `${Math.max(r.width * 100, 3)}%`,
              height: `${Math.max(r.height * 100, 3)}%`,
            }}
          />
        ))}
      </div>
      <p className="redaction-map__caption">
        Approximate on-page location of every region redacted before this task's server call. Nothing inside these
        boxes was transmitted.
      </p>
    </div>
  );
}

export default function SidePanel() {
  const { status, log, regions } = useAgentState();

  return (
    <div className="sidepanel">
      <header className="sidepanel__header">
        <h1>Agent activity</h1>
        <span className="sidepanel__status">{status}</span>
      </header>

      <RedactionMap regions={regions} />

      <section className="console console--tall" aria-label="Full agent activity log">
        {log.length === 0 && <p className="console__empty">No activity yet.</p>}
        {[...log].reverse().map((entry) => (
          <div key={entry.id} className={`console__line console__line--${entry.status}`}>
            <span className="console__time">{new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}</span>
            <span className="console__message">{entry.message}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

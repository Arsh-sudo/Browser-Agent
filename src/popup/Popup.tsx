import { useState } from "react";
import { useAgentState } from "../lib/useAgentState";
import type { AgentStatus } from "../lib/types";

const STATUS_COPY: Record<AgentStatus, string> = {
  idle: "Idle",
  capturing: "Reading screen",
  redacting: "Redacting sensitive data",
  thinking: "Waiting on server",
  acting: "Acting on page",
  error: "Error",
};

function StatusPill({ status }: { status: AgentStatus }) {
  return (
    <span className={`status-pill status-pill--${status}`}>
      <span className="status-pill__dot" />
      {STATUS_COPY[status]}
    </span>
  );
}

export default function Popup() {
  const { status, log, regions, startTask, stopTask } = useAgentState();
  const [task, setTask] = useState("");
  const running = status !== "idle" && status !== "error";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task.trim()) return;
    void startTask(task.trim());
  }

  function openSidePanel() {
    void chrome.windows.getCurrent((win) => {
      if (win.id) void chrome.sidePanel.open({ windowId: win.id });
    });
  }

  return (
    <div className="popup">
      <header className="popup__header">
        <div>
          <h1>Visual Perception Agent</h1>
          <p className="popup__subtitle">On-device screen reading, redacted before it leaves your machine.</p>
        </div>
        <StatusPill status={status} />
      </header>

      <form className="popup__task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What should the agent do on this page?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={running}
        />
        {running ? (
          <button type="button" className="btn btn--stop" onClick={() => void stopTask()}>
            Stop
          </button>
        ) : (
          <button type="submit" className="btn btn--start" disabled={!task.trim()}>
            Run
          </button>
        )}
      </form>

      <div className="redaction-summary">
        <span className="redaction-summary__count">{regions.length}</span>
        <span>sensitive region{regions.length === 1 ? "" : "s"} redacted before transmission</span>
      </div>

      <section className="console" aria-label="Agent activity log">
        {log.length === 0 && <p className="console__empty">No activity yet. Give the agent a task above.</p>}
        {[...log].reverse().map((entry) => (
          <div key={entry.id} className={`console__line console__line--${entry.status}`}>
            <span className="console__time">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}
            </span>
            <span className="console__message">{entry.message}</span>
          </div>
        ))}
      </section>

      <footer className="popup__footer">
        <button type="button" className="btn btn--ghost" onClick={openSidePanel}>
          Open side panel
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => chrome.runtime.openOptionsPage()}>
          Settings
        </button>
      </footer>
    </div>
  );
}

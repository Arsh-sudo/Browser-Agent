import { useEffect, useState } from "react";
import type { AgentStatus, LogEntry, RedactedRegion } from "./types";
import { onMessage, send } from "./messaging";

interface AgentState {
  status: AgentStatus;
  log: LogEntry[];
  regions: RedactedRegion[];
}

const initial: AgentState = { status: "idle", log: [], regions: [] };

export function useAgentState() {
  const [state, setState] = useState<AgentState>(initial);

  useEffect(() => {
    void send({ type: "GET_STATE" });
    return onMessage((message) => {
      if (message.type === "STATE_UPDATE") {
        setState({ status: message.status, log: message.log, regions: message.regions });
      }
    });
  }, []);

  const startTask = (task: string) => send({ type: "START_TASK", task });
  const stopTask = () => send({ type: "STOP_TASK" });

  return { ...state, startTask, stopTask };
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { RunSnapshot, SseEvent } from "@/lib/types";

export function useInvestigationStream(runId: string | null) {
  const [snapshot, setSnapshot] = useState<RunSnapshot | null>(null);
  const [lastEvent, setLastEvent] = useState<SseEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) return;
    setSnapshot(null);
    const url = `/api/investigate/${runId}/stream`;
    const es = new EventSource(url);
    esRef.current = es;
    setConnected(true);

    const handle = (ev: MessageEvent) => {
      try {
        const parsed: SseEvent = JSON.parse(ev.data);
        setLastEvent(parsed);
        applyEvent(parsed, setSnapshot);
      } catch {
        // ignore
      }
    };

    const types = [
      "snapshot",
      "state_update",
      "tool_run",
      "evidence_added",
      "hypothesis_updated",
      "contradiction_detected",
      "report_ready",
      "plan_ready",
      "log",
      "complete",
    ];
    for (const t of types) es.addEventListener(t, handle as EventListener);
    es.onerror = () => setConnected(false);

    return () => {
      for (const t of types) es.removeEventListener(t, handle as EventListener);
      es.close();
      esRef.current = null;
    };
  }, [runId]);

  return { snapshot, lastEvent, connected };
}

function applyEvent(
  ev: SseEvent,
  setSnapshot: React.Dispatch<React.SetStateAction<RunSnapshot | null>>
) {
  setSnapshot((prev) => {
    if (ev.type === "snapshot") return ev.data as RunSnapshot;
    if (!prev) return prev;
    const s: RunSnapshot = { ...prev };

    switch (ev.type) {
      case "state_update": {
        const d = ev.data as { state: RunSnapshot["state"]; currentStep: string; progress: number };
        s.state = d.state;
        s.currentStep = d.currentStep;
        s.progress = d.progress;
        break;
      }
      case "plan_ready":
        s.plan = ev.data as RunSnapshot["plan"];
        break;
      case "tool_run": {
        const t = ev.data as RunSnapshot["toolRuns"][number];
        const idx = s.toolRuns.findIndex((x) => x.id === t.id);
        if (idx >= 0) {
          s.toolRuns = [...s.toolRuns];
          s.toolRuns[idx] = t;
        } else {
          s.toolRuns = [...s.toolRuns, t];
        }
        break;
      }
      case "evidence_added":
        s.evidence = [...s.evidence, ev.data as RunSnapshot["evidence"][number]];
        break;
      case "hypothesis_updated": {
        const h = ev.data as RunSnapshot["hypotheses"][number];
        const i = s.hypotheses.findIndex((x) => x.id === h.id);
        if (i >= 0) {
          s.hypotheses = [...s.hypotheses];
          s.hypotheses[i] = h;
        } else s.hypotheses = [...s.hypotheses, h];
        break;
      }
      case "contradiction_detected": {
        const c = ev.data as RunSnapshot["contradictions"][number];
        const i = s.contradictions.findIndex((x) => x.id === c.id);
        if (i >= 0) {
          s.contradictions = [...s.contradictions];
          s.contradictions[i] = c;
        } else s.contradictions = [...s.contradictions, c];
        break;
      }
      case "report_ready":
        s.report = ev.data as RunSnapshot["report"];
        s.reportStatus = "ready";
        break;
      case "log": {
        const d = ev.data as { line: string };
        s.logLines = [...s.logLines, d.line];
        break;
      }
      case "complete":
        s.state = "complete";
        break;
    }
    return s;
  });
}

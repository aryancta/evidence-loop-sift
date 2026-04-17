import type { RunState } from "@/lib/types";

export const RUN_STATES: RunState[] = [
  "intake",
  "plan",
  "execute",
  "verify",
  "contradict",
  "report",
  "complete",
];

export const STATE_LABELS: Record<RunState, string> = {
  intake: "Intake",
  plan: "Plan",
  execute: "Execute",
  verify: "Verify",
  contradict: "Contradict",
  report: "Report",
  complete: "Complete",
  paused: "Paused",
  failed: "Failed",
};

export const STATE_DESCRIPTIONS: Record<RunState, string> = {
  intake: "Loading case metadata and artifact inventory",
  plan: "Selecting the safest, most informative tool sequence",
  execute: "Running approved MCP tools against artifacts",
  verify: "Checking claims against raw evidence",
  contradict: "Resolving conflicts between hypotheses and evidence",
  report: "Assembling analyst-ready report with citations",
  complete: "Investigation complete",
  paused: "Run paused by operator",
  failed: "Run failed",
};

export function nextState(current: RunState, triggerContradiction = false): RunState {
  if (triggerContradiction && current === "verify") return "contradict";
  switch (current) {
    case "intake":
      return "plan";
    case "plan":
      return "execute";
    case "execute":
      return "verify";
    case "verify":
      return "report";
    case "contradict":
      return "execute";
    case "report":
      return "complete";
    case "complete":
    case "paused":
    case "failed":
      return current;
  }
}

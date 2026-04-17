import type { DemoCase } from "@/lib/mock-data";
import type { PlanStep } from "@/lib/types";

export function buildPlan(demo: DemoCase): PlanStep[] {
  const steps: PlanStep[] = [];
  let order = 1;

  for (const a of demo.artifacts) {
    steps.push({
      id: `p-${order}`,
      order: order++,
      title: `Summarize ${a.name}`,
      rationale: `Fast read of ${a.type} artifact to anchor initial hypotheses before deeper parsing.`,
      toolName: "artifact.summarize",
      input: { artifactId: a.id },
      risk: "low",
      expectedEvidence: "High-level summary with key facts and confidence.",
    });
  }

  for (const a of demo.artifacts.filter((x) => x.type === "timeline" || x.type === "log")) {
    if (a.type === "timeline") {
      steps.push({
        id: `p-${order}`,
        order: order++,
        title: `Extract timeline from ${a.name}`,
        rationale:
          "Normalized timelines let us correlate events across artifacts and spot off-hours bursts.",
        toolName: "timeline.extract",
        input: { artifactId: a.id },
        risk: "low",
        expectedEvidence: "Ordered TimelineEvent[] with source and severity.",
      });
    } else {
      steps.push({
        id: `p-${order}`,
        order: order++,
        title: `Parse ${a.name}`,
        rationale:
          "Structured log records enable actor attribution and direct contradiction checks.",
        toolName: "log.parse",
        input: { artifactId: a.id },
        risk: "low",
        expectedEvidence: "LogRecord[] with actor, timestamp, and raw line references.",
      });
    }
  }

  for (const a of demo.artifacts) {
    steps.push({
      id: `p-${order}`,
      order: order++,
      title: `Extract IOCs from ${a.name}`,
      rationale:
        "Indicator extraction surfaces concrete pivot values analysts can hunt or block.",
      toolName: "ioc.extract",
      input: { artifactId: a.id },
      risk: "low",
      expectedEvidence: "Typed IOC list with confidence and source reference.",
    });
  }

  steps.push({
    id: `p-${order}`,
    order: order++,
    title: "Disallowed: arbitrary shell command",
    rationale:
      "A naive planner might shell out for speed. This action is blocked by guardrails.",
    toolName: "shell.exec",
    input: { cmd: "cat /var/log/*" },
    risk: "high",
    disallowed: true,
    expectedEvidence: "(blocked)",
  });

  return steps;
}

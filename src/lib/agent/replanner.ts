import type { Contradiction, Hypothesis, PlanStep } from "@/lib/types";

export function buildReplan(
  contradiction: Contradiction,
  hypothesis: Hypothesis,
  baseOrderStart: number
): PlanStep[] {
  const steps: PlanStep[] = [];
  let order = baseOrderStart;

  if (hypothesis.id === "h-insider-jdoe") {
    steps.push({
      id: `rp-${order}`,
      order: order++,
      title: "Pivot: Inspect scheduled tasks under SYSTEM",
      rationale:
        "Auth evidence shows jdoe was offline. Pivot from insider lead to scheduled-task hypothesis.",
      toolName: "artifact.summarize",
      input: { artifactId: "a1-sched" },
      risk: "low",
      expectedEvidence: "Scheduled task BackupSweep characterization.",
    });
    steps.push({
      id: `rp-${order}`,
      order: order++,
      title: "Correlate netflow to rule out exfiltration",
      rationale:
        "Confirm absence of external egress during the window to firm up benign-misconfig conclusion.",
      toolName: "artifact.summarize",
      input: { artifactId: "a1-netflow" },
      risk: "low",
      expectedEvidence: "Netflow confirms internal-only traffic.",
    });
  }

  if (hypothesis.id === "h-benign-powershell") {
    steps.push({
      id: `rp-${order}`,
      order: order++,
      title: "Pivot: Treat PowerShell as malicious, extract IOCs",
      rationale: "Encoded command and typosquat domain invalidate benign assumption.",
      toolName: "ioc.extract",
      input: { artifactId: "a2-dns" },
      risk: "low",
      expectedEvidence: "Malicious domain and IP IOCs.",
    });
  }

  return steps;
}

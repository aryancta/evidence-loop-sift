import type { Evidence, Hypothesis } from "@/lib/types";

export interface VerifyOutcome {
  updated: Hypothesis;
  supportingAdded: string[];
  contradictingAdded: string[];
  statusChanged: boolean;
}

function matches(hypothesis: Hypothesis, evidence: Evidence): "support" | "contradict" | null {
  const hay = `${hypothesis.title} ${hypothesis.statement}`.toLowerCase();
  const claim = evidence.claim.toLowerCase();

  if (hypothesis.id === "h-insider-jdoe") {
    if (claim.includes("jdoe logged off") && claim.includes("did not")) return "contradict";
    if (claim.includes("impersonat") && claim.includes("system")) return "contradict";
    if (claim.includes("scheduled task") && claim.includes("system")) return "contradict";
    if (claim.includes("jdoe") && claim.includes("accessed")) return "support";
  }

  if (hypothesis.id === "h-scheduled-task") {
    if (claim.includes("scheduled task") || claim.includes("backupsweep")) return "support";
    if (claim.includes("system") && claim.includes("impersonat")) return "support";
    if (claim.includes("no outbound wan")) return "support";
  }

  if (hypothesis.id === "h-benign-powershell") {
    if (claim.includes("encodedcommand")) return "contradict";
    if (claim.includes("updates-office")) return "contradict";
    if (claim.includes("typosquat")) return "contradict";
    if (claim.includes("invoke-wmimethod")) return "contradict";
  }

  if (hypothesis.id === "h-lateral-movement") {
    if (claim.includes("invoke-wmimethod") || claim.includes("wmic.exe")) return "support";
    if (claim.includes("fin-03")) return "support";
    if (claim.includes("updates-office")) return "support";
    if (claim.includes("encodedcommand")) return "support";
  }

  if (hay.includes("exfiltration") && claim.includes("no outbound")) return "contradict";
  return null;
}

export function verifyEvidenceAgainstHypothesis(
  hypothesis: Hypothesis,
  evidence: Evidence[]
): VerifyOutcome {
  const supporting = new Set(hypothesis.supportingEvidenceIds);
  const contradicting = new Set(hypothesis.contradictingEvidenceIds);
  const supAdded: string[] = [];
  const conAdded: string[] = [];

  for (const ev of evidence) {
    const m = matches(hypothesis, ev);
    if (!m) continue;
    if (m === "support" && !supporting.has(ev.id)) {
      supporting.add(ev.id);
      supAdded.push(ev.id);
    }
    if (m === "contradict" && !contradicting.has(ev.id)) {
      contradicting.add(ev.id);
      conAdded.push(ev.id);
    }
  }

  const supCount = supporting.size;
  const conCount = contradicting.size;

  let confidence = hypothesis.confidence;
  let status = hypothesis.status;

  if (conCount >= 2 && supCount === 0) {
    status = "rejected";
    confidence = Math.max(0.05, confidence - 0.4 - 0.1 * conCount);
  } else if (conCount >= 1 && conCount >= supCount) {
    status = "contradicted";
    confidence = Math.max(0.1, confidence - 0.2 - 0.1 * conCount);
  } else if (supCount >= 2) {
    status = "confirmed";
    confidence = Math.min(0.97, 0.6 + 0.1 * supCount);
  } else if (supCount === 1) {
    status = status === "tentative" ? "tentative" : status;
    confidence = Math.min(0.9, confidence + 0.1);
  }

  const updated: Hypothesis = {
    ...hypothesis,
    supportingEvidenceIds: Array.from(supporting),
    contradictingEvidenceIds: Array.from(contradicting),
    confidence: Number(confidence.toFixed(2)),
    status,
    lastUpdatedAt: new Date().toISOString(),
  };

  return {
    updated,
    supportingAdded: supAdded,
    contradictingAdded: conAdded,
    statusChanged: status !== hypothesis.status,
  };
}

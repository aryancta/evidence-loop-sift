import type { AuditEvent } from "@/lib/types";

const GLOBAL_AUDIT: AuditEvent[] = [
  {
    id: "ae-seed-1",
    timestamp: "2026-04-17T08:00:00Z",
    type: "state_change",
    actor: "system",
    summary: "EvidenceLoop SIFT service initialized",
  },
  {
    id: "ae-seed-2",
    timestamp: "2026-04-17T08:00:01Z",
    type: "guardrail_block",
    actor: "system",
    summary: "Boot-time guardrail check: tool allowlist loaded",
    details: { tools: ["timeline.extract", "log.parse", "ioc.extract", "artifact.summarize"] },
  },
];

export function appendAudit(ev: AuditEvent) {
  GLOBAL_AUDIT.push(ev);
  if (GLOBAL_AUDIT.length > 2000) GLOBAL_AUDIT.splice(0, GLOBAL_AUDIT.length - 2000);
}

export function getAudit(filter?: { runId?: string; caseId?: string; type?: string }) {
  return GLOBAL_AUDIT.filter((e) => {
    if (filter?.runId && e.runId !== filter.runId) return false;
    if (filter?.caseId && e.caseId !== filter.caseId) return false;
    if (filter?.type && e.type !== filter.type) return false;
    return true;
  })
    .slice()
    .reverse();
}

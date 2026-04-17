import { createHash, randomUUID } from "crypto";
import type { DemoCase } from "@/lib/mock-data";
import type { FinalReport, ReportCitation, RunSnapshot } from "@/lib/types";

export function buildFinalReport(snapshot: RunSnapshot, demo: DemoCase): FinalReport {
  const citations: ReportCitation[] = [];
  const citationByEvidence = new Map<string, string>();

  for (const ev of snapshot.evidence) {
    const cid = `cit-${randomUUID().slice(0, 8)}`;
    citations.push({ id: cid, evidenceId: ev.id, toolRunId: ev.toolRunId, claim: ev.claim });
    citationByEvidence.set(ev.id, cid);
  }

  const confirmed = snapshot.hypotheses.filter((h) => h.status === "confirmed");
  const contradicted = snapshot.hypotheses.filter(
    (h) => h.status === "contradicted" || h.status === "rejected"
  );

  const findings = confirmed.map((h) => ({
    id: `f-${h.id}`,
    text: `${h.title}: ${h.statement}`,
    citationIds: h.supportingEvidenceIds.map((e) => citationByEvidence.get(e)).filter(Boolean) as string[],
  }));

  if (findings.length === 0) {
    const topSupported = [...snapshot.hypotheses].sort((a, b) => b.confidence - a.confidence)[0];
    if (topSupported) {
      findings.push({
        id: `f-${topSupported.id}`,
        text: `${topSupported.title}: ${topSupported.statement}`,
        citationIds: topSupported.supportingEvidenceIds
          .map((e) => citationByEvidence.get(e))
          .filter(Boolean) as string[],
      });
    }
  }

  const execSummary = buildExecSummary(snapshot, demo);

  const open: string[] = [];
  if (contradicted.length > 0) {
    open.push(
      "Retrospective: document why the initial lead was promoted despite early signs it could be wrong."
    );
  }
  open.push("Hunt for the same scheduled-task / typosquat pattern across the wider fleet.");
  open.push("Confirm root cause with endpoint owner and schedule a configuration review.");

  const report: FinalReport = {
    id: `rep-${randomUUID().slice(0, 8)}`,
    runId: snapshot.id,
    caseId: snapshot.caseId,
    executiveSummary: execSummary,
    confirmedFindings: findings,
    hypotheses: snapshot.hypotheses.map((h) => ({
      id: h.id,
      title: h.title,
      status: h.status,
      confidence: h.confidence,
      note: h.note ?? "",
      citationIds: [...h.supportingEvidenceIds, ...h.contradictingEvidenceIds]
        .map((e) => citationByEvidence.get(e))
        .filter(Boolean) as string[],
    })),
    timeline: snapshot.timeline.slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    iocs: snapshot.iocs,
    openQuestions: open,
    citations,
    signedHash: "",
    createdAt: new Date().toISOString(),
  };

  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        s: report.executiveSummary,
        f: report.confirmedFindings,
        h: report.hypotheses,
        t: report.timeline,
        i: report.iocs,
      })
    )
    .digest("hex");
  report.signedHash = `sha256:${hash}`;
  return report;
}

function buildExecSummary(snapshot: RunSnapshot, demo: DemoCase): string {
  const contradicted = snapshot.hypotheses.find(
    (h) => h.status === "contradicted" || h.status === "rejected"
  );
  const confirmed = [...snapshot.hypotheses]
    .filter((h) => h.status === "confirmed")
    .sort((a, b) => b.confidence - a.confidence)[0];

  const parts: string[] = [];
  parts.push(
    `Case ${demo.name}: autonomous triage completed with ${snapshot.evidence.length} evidence objects across ${snapshot.toolRuns.length} tool runs.`
  );
  if (contradicted) {
    parts.push(
      `An early lead ("${contradicted.title}") was ${contradicted.status} after ${contradicted.contradictingEvidenceIds.length} pieces of contradictory evidence; the investigation pivoted automatically.`
    );
  }
  if (confirmed) {
    parts.push(
      `The supported conclusion is "${confirmed.title}" with confidence ${confirmed.confidence.toFixed(2)}.`
    );
  }
  if (snapshot.iocs.length > 0) {
    parts.push(`${snapshot.iocs.length} indicators of compromise extracted for hunting.`);
  }
  return parts.join(" ");
}

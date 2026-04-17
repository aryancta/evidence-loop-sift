import { randomUUID } from "crypto";
import type { Evidence, Ioc, TimelineEvent } from "@/lib/types";
import type { IocResult, LogParseResult, SummaryResult, TimelineResult } from "@/lib/mcp/mock-server";

export function normalizeToolOutputToEvidence(
  runId: string,
  toolRunId: string,
  toolName: string,
  output: unknown
): { evidence: Evidence[]; timeline: TimelineEvent[]; iocs: Ioc[] } {
  const ev: Evidence[] = [];
  const timeline: TimelineEvent[] = [];
  const iocs: Ioc[] = [];
  const now = new Date().toISOString();

  if (toolName === "timeline.extract") {
    const data = output as TimelineResult;
    for (const e of data.events) {
      const id = `ev-${randomUUID().slice(0, 8)}`;
      ev.push({
        id,
        runId,
        toolRunId,
        artifactId: data.artifactId,
        category: e.category,
        claim: e.summary,
        rawReference: data.rawReferenceFormat.replace("{line}", e.id).replace("{idx}", e.id),
        confidence: 0.8,
        sourceTimestamp: e.timestamp,
        createdAt: now,
      });
      timeline.push({ ...e, evidenceId: id });
    }
  }

  if (toolName === "log.parse") {
    const data = output as LogParseResult;
    for (const r of data.records) {
      const id = `ev-${randomUUID().slice(0, 8)}`;
      ev.push({
        id,
        runId,
        toolRunId,
        artifactId: data.artifactId,
        category: "log",
        claim: `${r.actor}: ${r.message}`,
        rawReference: `${data.artifactId}#L${r.rawLine}`,
        confidence: r.level === "warning" ? 0.88 : 0.8,
        sourceTimestamp: r.timestamp,
        createdAt: now,
      });
      timeline.push({
        id: `tl-${id}`,
        timestamp: r.timestamp,
        source: "SecurityLog",
        category: "log",
        summary: `${r.actor}: ${r.message}`,
        severity: r.level === "warning" ? "high" : "medium",
        evidenceId: id,
      });
    }
    for (const n of data.notable) {
      const id = `ev-${randomUUID().slice(0, 8)}`;
      ev.push({
        id,
        runId,
        toolRunId,
        artifactId: data.artifactId,
        category: "summary",
        claim: n,
        rawReference: `${data.artifactId}#notable`,
        confidence: 0.9,
        createdAt: now,
      });
    }
  }

  if (toolName === "ioc.extract") {
    const data = output as IocResult;
    for (const i of data.iocs) {
      const id = `ev-${randomUUID().slice(0, 8)}`;
      ev.push({
        id,
        runId,
        toolRunId,
        artifactId: data.artifactId,
        category: "ioc",
        claim: `IOC (${i.type}): ${i.value}${i.note ? ` — ${i.note}` : ""}`,
        rawReference: `${data.artifactId}#ioc/${i.type}`,
        confidence: i.confidence,
        createdAt: now,
      });
      iocs.push({
        id: `ioc-${id}`,
        type: i.type,
        value: i.value,
        confidence: i.confidence,
        sourceEvidenceIds: [id],
        note: i.note,
      });
    }
  }

  if (toolName === "artifact.summarize") {
    const data = output as SummaryResult;
    const id = `ev-${randomUUID().slice(0, 8)}`;
    ev.push({
      id,
      runId,
      toolRunId,
      artifactId: data.artifactId,
      category: "summary",
      claim: data.summary,
      rawReference: `${data.artifactId}#summary`,
      confidence: data.confidence,
      createdAt: now,
    });
    for (const k of data.keyFacts) {
      const kid = `ev-${randomUUID().slice(0, 8)}`;
      ev.push({
        id: kid,
        runId,
        toolRunId,
        artifactId: data.artifactId,
        category: "summary",
        claim: k,
        rawReference: `${data.artifactId}#summary/keyfact`,
        confidence: Math.min(0.95, data.confidence + 0.05),
        createdAt: now,
      });
    }
  }

  return { evidence: ev, timeline, iocs };
}

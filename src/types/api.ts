import type { CaseSummary, FinalReport, RunSnapshot, AuditEvent } from "@/lib/types";
import type { DemoCase } from "@/lib/mock-data";

export interface CasesResponse {
  cases: Array<CaseSummary & { scenario?: string; description?: string }>;
}

export interface CaseResponse {
  case: DemoCase;
}

export interface StartInvestigationResponse {
  runId: string;
  status: "running" | "queued";
  startedAt: string;
}

export interface RunSnapshotResponse {
  run: RunSnapshot;
}

export interface ReportResponse {
  report: FinalReport;
  snapshot: RunSnapshot;
}

export interface AuditResponse {
  events: AuditEvent[];
}

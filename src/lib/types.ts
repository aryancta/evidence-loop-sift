export type Severity = "low" | "medium" | "high" | "critical";

export type RunState =
  | "intake"
  | "plan"
  | "execute"
  | "verify"
  | "contradict"
  | "report"
  | "complete"
  | "paused"
  | "failed";

export type HypothesisStatus = "tentative" | "confirmed" | "contradicted" | "rejected";

export type EvidenceCategory =
  | "timeline"
  | "ioc"
  | "log"
  | "file"
  | "process"
  | "registry"
  | "memory"
  | "summary";

export type ToolStatus = "queued" | "running" | "success" | "failed" | "blocked";
export type SafetyLevel = "safe" | "read-only" | "restricted";

export interface CaseSummary {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  tags: string[];
  artifactCount: number;
  summary: string;
  falseLeadHint?: string;
  expectedContradiction?: string;
}

export interface Artifact {
  id: string;
  caseId: string;
  type: "log" | "disk" | "timeline" | "memory" | "registry" | "network";
  name: string;
  sourcePath: string;
  sizeBytes: number;
  hash?: string;
  metadata?: Record<string, unknown>;
}

export interface PlanStep {
  id: string;
  order: number;
  title: string;
  rationale: string;
  toolName: string;
  input: Record<string, unknown>;
  risk: "low" | "medium" | "high";
  disallowed?: boolean;
  expectedEvidence: string;
}

export interface ToolRun {
  id: string;
  runId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: ToolStatus;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  safetyLevel: SafetyLevel;
  errorMessage?: string;
}

export interface Evidence {
  id: string;
  runId: string;
  toolRunId: string;
  artifactId?: string;
  category: EvidenceCategory;
  claim: string;
  rawReference: string;
  confidence: number;
  sourceTimestamp?: string;
  createdAt: string;
  tags?: string[];
}

export interface Hypothesis {
  id: string;
  runId: string;
  title: string;
  statement: string;
  status: HypothesisStatus;
  confidence: number;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  lastUpdatedAt: string;
  note?: string;
}

export interface Contradiction {
  id: string;
  runId: string;
  hypothesisId: string;
  description: string;
  triggerEvidenceIds: string[];
  resolutionAction: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  source: string;
  category: EvidenceCategory;
  summary: string;
  severity: Severity;
  evidenceId?: string;
}

export interface Ioc {
  id: string;
  type: "file_path" | "hash" | "process" | "command" | "ip" | "user" | "timestamp" | "domain";
  value: string;
  confidence: number;
  sourceEvidenceIds: string[];
  firstSeen?: string;
  note?: string;
}

export interface ReportCitation {
  id: string;
  evidenceId: string;
  toolRunId: string;
  claim: string;
}

export interface FinalReport {
  id: string;
  runId: string;
  caseId: string;
  executiveSummary: string;
  confirmedFindings: Array<{ id: string; text: string; citationIds: string[] }>;
  hypotheses: Array<{
    id: string;
    title: string;
    status: HypothesisStatus;
    confidence: number;
    note: string;
    citationIds: string[];
  }>;
  timeline: TimelineEvent[];
  iocs: Ioc[];
  openQuestions: string[];
  citations: ReportCitation[];
  signedHash: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  type:
    | "tool_run"
    | "state_change"
    | "guardrail_block"
    | "evidence_added"
    | "hypothesis_update"
    | "contradiction"
    | "report_generated"
    | "run_started"
    | "run_completed";
  runId?: string;
  caseId?: string;
  actor: "agent" | "system" | "user";
  summary: string;
  details?: Record<string, unknown>;
  evidenceRefs?: string[];
}

export interface GuardrailRule {
  id: string;
  name: string;
  description: string;
  category: "tool_allowlist" | "input_validation" | "output_validation" | "safety_policy";
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface RunSnapshot {
  id: string;
  caseId: string;
  mode: "demo" | "analysis";
  state: RunState;
  currentStep: string;
  progress: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  plan: PlanStep[];
  toolRuns: ToolRun[];
  evidence: Evidence[];
  hypotheses: Hypothesis[];
  contradictions: Contradiction[];
  auditEvents: AuditEvent[];
  timeline: TimelineEvent[];
  iocs: Ioc[];
  reportStatus: "none" | "drafting" | "ready";
  report?: FinalReport;
  logLines: string[];
}

export type SseEventType =
  | "state_update"
  | "tool_run"
  | "evidence_added"
  | "hypothesis_updated"
  | "contradiction_detected"
  | "report_ready"
  | "plan_ready"
  | "log"
  | "complete"
  | "snapshot";

export interface SseEvent<T = unknown> {
  type: SseEventType;
  runId: string;
  timestamp: string;
  data: T;
}

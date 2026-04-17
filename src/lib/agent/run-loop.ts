import { randomUUID } from "crypto";
import { DEMO_CASES, getCaseById, type DemoCase } from "@/lib/mock-data";
import { callTool } from "@/lib/mcp/client";
import { normalizeToolOutputToEvidence } from "@/lib/evidence";
import { seedHypotheses } from "@/lib/hypothesis-engine";
import { buildPlan } from "./planner";
import { buildReplan } from "./replanner";
import { verifyEvidenceAgainstHypothesis } from "./verifier";
import { buildFinalReport } from "@/lib/report-builder";
import { appendAudit } from "@/lib/audit";
import { nextState, STATE_DESCRIPTIONS } from "./state-machine";
import type {
  AuditEvent,
  Contradiction,
  Evidence,
  Hypothesis,
  Ioc,
  PlanStep,
  RunSnapshot,
  RunState,
  SseEvent,
  SseEventType,
  TimelineEvent,
  ToolRun,
} from "@/lib/types";

type Listener = (ev: SseEvent) => void;

export interface Run {
  snapshot: RunSnapshot;
  listeners: Set<Listener>;
  paused: boolean;
  cancelled: boolean;
  events: SseEvent[];
}

const runs = new Map<string, Run>();

function emit<T>(run: Run, type: SseEventType, data: T) {
  const ev: SseEvent<T> = {
    type,
    runId: run.snapshot.id,
    timestamp: new Date().toISOString(),
    data,
  };
  run.events.push(ev);
  for (const l of run.listeners) {
    try {
      l(ev);
    } catch {
      // ignore listener errors
    }
  }
}

function log(run: Run, line: string) {
  const prefixed = `[${new Date().toISOString()}] ${line}`;
  run.snapshot.logLines.push(prefixed);
  if (run.snapshot.logLines.length > 500) {
    run.snapshot.logLines.splice(0, run.snapshot.logLines.length - 500);
  }
  emit(run, "log", { line: prefixed });
}

function transition(run: Run, state: RunState, step: string) {
  run.snapshot.state = state;
  run.snapshot.currentStep = step;
  run.snapshot.updatedAt = new Date().toISOString();
  emit(run, "state_update", { state, currentStep: step, progress: run.snapshot.progress });
  addAudit(run, {
    type: "state_change",
    actor: "agent",
    summary: `state → ${state} (${step})`,
  });
}

function setProgress(run: Run, p: number) {
  run.snapshot.progress = Math.min(100, Math.max(0, Math.round(p)));
}

function addAudit(run: Run, partial: Omit<AuditEvent, "id" | "timestamp" | "runId" | "caseId">) {
  const ev: AuditEvent = {
    id: `ae-${randomUUID().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    runId: run.snapshot.id,
    caseId: run.snapshot.caseId,
    ...partial,
  };
  run.snapshot.auditEvents.push(ev);
  appendAudit(ev);
  return ev;
}

async function pausedGate(run: Run) {
  while (run.paused && !run.cancelled) {
    await new Promise((r) => setTimeout(r, 250));
  }
}

async function sleep(run: Run, ms: number) {
  const slice = 80;
  let remaining = ms;
  while (remaining > 0 && !run.cancelled) {
    await pausedGate(run);
    const step = Math.min(slice, remaining);
    await new Promise((r) => setTimeout(r, step));
    remaining -= step;
  }
}

function newToolRun(runId: string, step: PlanStep): ToolRun {
  return {
    id: `tr-${randomUUID().slice(0, 8)}`,
    runId,
    toolName: step.toolName,
    input: step.input,
    status: "queued",
    startedAt: new Date().toISOString(),
    durationMs: 0,
    safetyLevel: step.disallowed ? "restricted" : step.toolName === "artifact.summarize" ? "safe" : "read-only",
  };
}

async function runStep(run: Run, step: PlanStep) {
  const tr = newToolRun(run.snapshot.id, step);
  run.snapshot.toolRuns.push(tr);
  emit(run, "tool_run", tr);

  if (step.disallowed) {
    tr.status = "blocked";
    tr.errorMessage = "Disallowed by guardrail: tool not in allowlist.";
    tr.endedAt = new Date().toISOString();
    log(run, `Guardrail blocked ${step.toolName} — ${tr.errorMessage}`);
    emit(run, "tool_run", tr);
    addAudit(run, {
      type: "guardrail_block",
      actor: "system",
      summary: `Blocked ${step.toolName}`,
      details: { reason: tr.errorMessage, step: step.title },
    });
    return;
  }

  tr.status = "running";
  emit(run, "tool_run", tr);
  log(run, `Executing ${step.toolName}(${JSON.stringify(step.input)})`);

  const result = await callTool(step.toolName, step.input);
  tr.endedAt = new Date().toISOString();
  tr.durationMs = result.durationMs;

  if (!result.ok) {
    tr.status = result.blocked ? "blocked" : "failed";
    tr.errorMessage = result.error;
    emit(run, "tool_run", tr);
    log(run, `Tool failed: ${tr.errorMessage}`);
    addAudit(run, {
      type: result.blocked ? "guardrail_block" : "tool_run",
      actor: "system",
      summary: `${step.toolName} ${tr.status}`,
      details: { reason: tr.errorMessage },
    });
    return;
  }

  tr.status = "success";
  tr.output = result.output;
  emit(run, "tool_run", tr);
  addAudit(run, {
    type: "tool_run",
    actor: "agent",
    summary: `${step.toolName} success (${tr.durationMs}ms)`,
    details: { input: step.input },
  });

  const normalized = normalizeToolOutputToEvidence(run.snapshot.id, tr.id, step.toolName, result.output);

  for (const ev of normalized.evidence) {
    run.snapshot.evidence.push(ev);
    emit(run, "evidence_added", ev);
    addAudit(run, {
      type: "evidence_added",
      actor: "agent",
      summary: ev.claim.slice(0, 140),
      evidenceRefs: [ev.id],
    });
  }
  for (const t of normalized.timeline) {
    run.snapshot.timeline.push(t);
  }
  for (const i of normalized.iocs) {
    if (!run.snapshot.iocs.find((x) => x.value === i.value && x.type === i.type)) {
      run.snapshot.iocs.push(i);
    }
  }

  await verifyAll(run);
}

async function verifyAll(run: Run) {
  for (let i = 0; i < run.snapshot.hypotheses.length; i++) {
    const h = run.snapshot.hypotheses[i];
    const outcome = verifyEvidenceAgainstHypothesis(h, run.snapshot.evidence);
    if (
      outcome.statusChanged ||
      outcome.supportingAdded.length > 0 ||
      outcome.contradictingAdded.length > 0
    ) {
      run.snapshot.hypotheses[i] = outcome.updated;
      emit(run, "hypothesis_updated", outcome.updated);
      addAudit(run, {
        type: "hypothesis_update",
        actor: "agent",
        summary: `${outcome.updated.title} → ${outcome.updated.status} (${outcome.updated.confidence.toFixed(2)})`,
        evidenceRefs: [...outcome.supportingAdded, ...outcome.contradictingAdded],
      });
    }
  }
}

async function detectContradictions(run: Run, demo: DemoCase): Promise<Contradiction[]> {
  const found: Contradiction[] = [];
  for (const h of run.snapshot.hypotheses) {
    if (
      (h.status === "contradicted" || h.status === "rejected") &&
      !run.snapshot.contradictions.find((c) => c.hypothesisId === h.id)
    ) {
      const c: Contradiction = {
        id: `c-${randomUUID().slice(0, 8)}`,
        runId: run.snapshot.id,
        hypothesisId: h.id,
        description: `Evidence contradicts hypothesis '${h.title}'. ${
          demo.expectedContradiction ?? ""
        }`.trim(),
        triggerEvidenceIds: h.contradictingEvidenceIds,
        resolutionAction: "Re-plan to explore alternate hypothesis and corroborate with additional artifacts.",
        resolved: false,
        createdAt: new Date().toISOString(),
      };
      run.snapshot.contradictions.push(c);
      found.push(c);
      emit(run, "contradiction_detected", c);
      addAudit(run, {
        type: "contradiction",
        actor: "agent",
        summary: c.description,
        evidenceRefs: c.triggerEvidenceIds,
      });
    }
  }
  return found;
}

export function getRun(runId: string): Run | undefined {
  return runs.get(runId);
}

export function listRuns(): Run[] {
  return Array.from(runs.values());
}

export function pauseRun(runId: string) {
  const r = runs.get(runId);
  if (!r) return;
  r.paused = true;
  r.snapshot.state = "paused";
}
export function resumeRun(runId: string) {
  const r = runs.get(runId);
  if (!r) return;
  r.paused = false;
}
export function subscribe(runId: string, listener: Listener): () => void {
  const r = runs.get(runId);
  if (!r) return () => {};
  r.listeners.add(listener);
  return () => r.listeners.delete(listener);
}

export function snapshotForRun(runId: string): RunSnapshot | undefined {
  return runs.get(runId)?.snapshot;
}

export function eventsForRun(runId: string): SseEvent[] {
  return runs.get(runId)?.events ?? [];
}

export async function startInvestigation(caseId: string, mode: "demo" | "analysis" = "demo"): Promise<Run> {
  const demo = getCaseById(caseId) ?? DEMO_CASES[0];
  const runId = `run-${randomUUID().slice(0, 8)}`;

  const snapshot: RunSnapshot = {
    id: runId,
    caseId: demo.id,
    mode,
    state: "intake",
    currentStep: STATE_DESCRIPTIONS.intake,
    progress: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    plan: [],
    toolRuns: [],
    evidence: [],
    hypotheses: [],
    contradictions: [],
    auditEvents: [],
    timeline: [],
    iocs: [],
    reportStatus: "none",
    logLines: [],
  };

  const run: Run = {
    snapshot,
    listeners: new Set(),
    paused: false,
    cancelled: false,
    events: [],
  };
  runs.set(runId, run);

  addAudit(run, { type: "run_started", actor: "user", summary: `Started run for case ${demo.id}` });
  executeRun(run, demo).catch((err) => {
    log(run, `Fatal error: ${String(err)}`);
    run.snapshot.state = "failed";
    emit(run, "state_update", { state: "failed", currentStep: "error", progress: run.snapshot.progress });
  });

  return run;
}

async function executeRun(run: Run, demo: DemoCase) {
  transition(run, "intake", `Loading case ${demo.id}`);
  run.snapshot.hypotheses = seedHypotheses(run.snapshot.id, demo);
  for (const h of run.snapshot.hypotheses) emit(run, "hypothesis_updated", h);
  setProgress(run, 5);
  await sleep(run, 600);

  transition(run, "plan", "Building ordered plan");
  run.snapshot.plan = buildPlan(demo);
  emit(run, "plan_ready", run.snapshot.plan);
  setProgress(run, 12);
  log(run, `Plan has ${run.snapshot.plan.length} steps (${run.snapshot.plan.filter((s) => s.disallowed).length} disallowed).`);
  await sleep(run, 500);

  transition(run, "execute", "Running approved tools");
  const executable = run.snapshot.plan.filter((s) => !s.disallowed);
  const blocked = run.snapshot.plan.filter((s) => s.disallowed);

  let replanned = false;
  for (let i = 0; i < executable.length; i++) {
    if (run.cancelled) return;
    const step = executable[i];
    log(run, `Step ${step.order}: ${step.title}`);
    await runStep(run, step);
    setProgress(run, 12 + ((i + 1) / (executable.length + 2)) * 60);
    await sleep(run, 280);

    transition(run, "verify", `Verifying claims against evidence (step ${step.order})`);
    await verifyAll(run);
    const contradictions = await detectContradictions(run, demo);
    if (contradictions.length > 0 && !replanned) {
      replanned = true;
      transition(run, "contradict", "Contradiction detected — replanning");
      log(run, `CONTRADICTION: ${contradictions[0].description}`);
      await sleep(run, 600);

      const h = run.snapshot.hypotheses.find((x) => x.id === contradictions[0].hypothesisId);
      if (h) {
        const extra = buildReplan(contradictions[0], h, run.snapshot.plan.length + 1);
        if (extra.length > 0) {
          run.snapshot.plan.push(...extra);
          emit(run, "plan_ready", run.snapshot.plan);
          log(run, `Replan added ${extra.length} steps.`);
          for (const s of extra) {
            await runStep(run, s);
            await verifyAll(run);
          }
          contradictions[0].resolved = true;
          contradictions[0].resolvedAt = new Date().toISOString();
          emit(run, "contradiction_detected", contradictions[0]);
        }
      }
      transition(run, "execute", "Resuming execution after pivot");
    } else {
      transition(run, "execute", "Continuing plan");
    }
  }

  // run blocked steps for demo visibility
  for (const b of blocked) await runStep(run, b);

  transition(run, "verify", "Final verification pass");
  await verifyAll(run);
  setProgress(run, 82);
  await sleep(run, 400);

  transition(run, "report", "Assembling analyst-ready report");
  run.snapshot.reportStatus = "drafting";
  const report = buildFinalReport(run.snapshot, demo);
  run.snapshot.report = report;
  run.snapshot.reportStatus = "ready";
  emit(run, "report_ready", report);
  addAudit(run, {
    type: "report_generated",
    actor: "agent",
    summary: `Report generated with ${report.confirmedFindings.length} confirmed findings.`,
  });
  setProgress(run, 100);
  await sleep(run, 300);

  transition(run, "complete", "Investigation complete");
  run.snapshot.completedAt = new Date().toISOString();
  addAudit(run, { type: "run_completed", actor: "system", summary: "Run complete" });
  emit(run, "complete", { runId: run.snapshot.id });
}

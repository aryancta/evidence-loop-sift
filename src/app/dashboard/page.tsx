"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  FileSearch,
  Gauge,
  ListChecks,
  Shield,
  Terminal,
  Workflow,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CaseSelector } from "@/components/case-selector";
import { DemoControls } from "@/components/demo-controls";
import { InvestigationStateMachine } from "@/components/investigation-state-machine";
import { LiveActivityFeed } from "@/components/live-activity-feed";
import { HypothesisLedger } from "@/components/hypothesis-ledger";
import { ContradictionPanel } from "@/components/contradiction-panel";
import { TimelineView } from "@/components/timeline-view";
import { IocChipGrid } from "@/components/ioc-chip-grid";
import { ToolRunLog } from "@/components/tool-run-log";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_CASES } from "@/lib/mock-data";
import { useInvestigationStream } from "@/hooks/use-investigation-stream";
import type { Hypothesis, PlanStep } from "@/lib/types";
import { cn } from "@/lib/utils";

function DashboardInner() {
  const params = useSearchParams();
  const initialCase = params.get("caseId") ?? DEMO_CASES[0].id;
  const [caseId, setCaseId] = useState<string>(initialCase);
  const [runId, setRunId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [drawerHypothesis, setDrawerHypothesis] = useState<Hypothesis | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("overview");

  const { snapshot } = useInvestigationStream(runId);
  const demo = DEMO_CASES.find((c) => c.id === caseId) ?? DEMO_CASES[0];

  const start = useCallback(async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/investigate/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ caseId, mode: "demo" }),
      });
      const j = await res.json();
      setRunId(j.runId);
    } finally {
      setStarting(false);
    }
  }, [caseId]);

  const pause = useCallback(async () => {
    if (!runId) return;
    await fetch(`/api/investigate/${runId}/pause`, { method: "POST" });
  }, [runId]);
  const resume = useCallback(async () => {
    if (!runId) return;
    await fetch(`/api/investigate/${runId}/resume`, { method: "POST" });
  }, [runId]);
  const replay = useCallback(() => {
    void start();
  }, [start]);

  useEffect(() => {
    if (snapshot && (snapshot.state === "contradict" || snapshot.contradictions.some((c) => !c.resolved))) {
      setTab("contradictions");
    }
  }, [snapshot?.state, snapshot?.contradictions.length]);

  const effectiveSnapshot = snapshot;

  return (
    <AppShell>
      <div className="border-b border-border/60 bg-card/20 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CaseSelector cases={DEMO_CASES} value={caseId} onChange={(id) => { setCaseId(id); setRunId(null); }} />
            <div className="hidden items-center gap-2 md:flex">
              <Badge variant="slate" className="uppercase tracking-wider">
                {demo.severity}
              </Badge>
              <Badge variant="cyan">{demo.scenario}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="green">Guardrails enforced</Badge>
            <Badge variant="slate">{demo.artifactCount} artifacts</Badge>
            {effectiveSnapshot?.report && (
              <Badge variant="cyan">report signed {effectiveSnapshot.report.signedHash.slice(0, 16)}…</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-4 p-5">
        {/* Left sidebar (sticky on desktop) */}
        <aside className="col-span-12 space-y-3 md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <FileSearch className="h-3.5 w-3.5" /> Case summary
              </div>
              <CardTitle className="text-base">{demo.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground">{demo.description}</p>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Artifact inventory
                </div>
                <ul className="space-y-0.5">
                  {demo.artifacts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <span className="truncate font-mono text-[11px]">{a.name}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-400">
                        {a.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {demo.expectedContradiction && (
                <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] text-amber-200">
                  <div className="mb-0.5 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-3 w-3" /> Designed contradiction
                  </div>
                  {demo.expectedContradiction}
                </div>
              )}
            </CardContent>
          </Card>

          <PlanStepperCard plan={effectiveSnapshot?.plan ?? []} state={effectiveSnapshot?.state} />
        </aside>

        <section className="col-span-12 space-y-4 md:col-span-6">
          <DemoControls
            snapshot={effectiveSnapshot}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReplay={replay}
            starting={starting}
          />
          <InvestigationStateMachine state={(effectiveSnapshot?.state ?? "intake") as any} />

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="overview">
                <Gauge className="mr-1.5 h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <ListChecks className="mr-1.5 h-3.5 w-3.5" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="tools">
                <Terminal className="mr-1.5 h-3.5 w-3.5" /> Tools
              </TabsTrigger>
              <TabsTrigger value="contradictions">
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Contradictions
                {effectiveSnapshot && effectiveSnapshot.contradictions.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-500/20 px-1.5 text-[10px] text-red-300">
                    {effectiveSnapshot.contradictions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="iocs">
                <Shield className="mr-1.5 h-3.5 w-3.5" /> IOCs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <LiveActivityFeed snapshot={effectiveSnapshot ?? emptySnapshot(caseId)} />
            </TabsContent>
            <TabsContent value="timeline" className="space-y-4">
              <TimelineView events={effectiveSnapshot?.timeline ?? []} />
            </TabsContent>
            <TabsContent value="tools" className="space-y-4">
              <ToolRunLog toolRuns={effectiveSnapshot?.toolRuns ?? []} />
            </TabsContent>
            <TabsContent value="contradictions" className="space-y-4">
              <ContradictionPanel
                contradictions={effectiveSnapshot?.contradictions ?? []}
                hypotheses={effectiveSnapshot?.hypotheses ?? []}
                evidence={effectiveSnapshot?.evidence ?? []}
              />
            </TabsContent>
            <TabsContent value="iocs" className="space-y-4">
              <IocChipGrid iocs={effectiveSnapshot?.iocs ?? []} />
            </TabsContent>
          </Tabs>

          <RawStreamLog lines={effectiveSnapshot?.logLines ?? []} />
        </section>

        <aside className="col-span-12 space-y-4 md:col-span-3">
          <HypothesisLedger
            hypotheses={effectiveSnapshot?.hypotheses ?? []}
            onSelect={(h) => {
              setDrawerHypothesis(h);
              setDrawerOpen(true);
            }}
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Workflow className="h-4 w-4 text-cyan-300" /> Evidence pool
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Tool runs</span>
                <span className="font-mono">{effectiveSnapshot?.toolRuns.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Evidence objects</span>
                <span className="font-mono">{effectiveSnapshot?.evidence.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">IOCs</span>
                <span className="font-mono">{effectiveSnapshot?.iocs.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Audit events</span>
                <span className="font-mono">{effectiveSnapshot?.auditEvents.length ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <EvidenceDrawer
        hypothesis={drawerHypothesis}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        evidence={effectiveSnapshot?.evidence ?? []}
        toolRuns={effectiveSnapshot?.toolRuns ?? []}
      />
    </AppShell>
  );
}

function emptySnapshot(caseId: string): any {
  return {
    id: "",
    caseId,
    mode: "demo",
    state: "intake",
    currentStep: "Idle — press Start Investigation",
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
}

function PlanStepperCard({ plan, state }: { plan: PlanStep[]; state?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Workflow className="h-4 w-4 text-cyan-300" /> Investigation plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {plan.length === 0 && (
          <div className="py-4 text-center text-muted-foreground">
            The planner will produce an ordered sequence of approved tools here.
          </div>
        )}
        {plan.map((p) => (
          <div
            key={p.id}
            className={cn(
              "rounded-md border p-2",
              p.disallowed
                ? "border-red-500/30 bg-red-500/5"
                : "border-border/60 bg-background/40"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded text-[10px] font-mono",
                  p.disallowed ? "bg-red-500/20 text-red-300" : "bg-cyan-500/20 text-cyan-300"
                )}
              >
                {p.order}
              </div>
              <div className="flex-1 min-w-0 truncate font-medium">{p.title}</div>
              <Badge
                variant={p.disallowed ? "red" : p.risk === "high" ? "amber" : "slate"}
                className="text-[9px] uppercase"
              >
                {p.disallowed ? "blocked" : p.risk}
              </Badge>
            </div>
            <div className="mt-1 pl-7 text-[11px] text-muted-foreground">{p.rationale}</div>
            <div className="mt-1 pl-7 text-[10px] font-mono text-muted-foreground/70">
              {p.toolName}({Object.keys(p.input).join(",") || "…"})
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RawStreamLog({ lines }: { lines: string[] }) {
  const tail = lines.slice(-80);
  return (
    <div className="card-surface">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" /> Agent console
        </div>
        <div className="text-[10px] text-muted-foreground">{lines.length} lines</div>
      </div>
      <pre className="scrollbar-thin max-h-40 overflow-auto p-3 text-[11px] font-mono text-cyan-100/90">
        {tail.length === 0 ? "agent idle…" : tail.join("\n")}
      </pre>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}

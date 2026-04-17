"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { Evidence, Hypothesis, ToolRun } from "@/lib/types";

export function EvidenceDrawer({
  hypothesis,
  open,
  onOpenChange,
  evidence,
  toolRuns,
}: {
  hypothesis: Hypothesis | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  evidence: Evidence[];
  toolRuns: ToolRun[];
}) {
  if (!hypothesis) return null;
  const support = evidence.filter((e) => hypothesis.supportingEvidenceIds.includes(e.id));
  const contradict = evidence.filter((e) => hypothesis.contradictingEvidenceIds.includes(e.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[520px] max-w-full">
        <SheetHeader>
          <SheetTitle>{hypothesis.title}</SheetTitle>
          <SheetDescription>{hypothesis.statement}</SheetDescription>
        </SheetHeader>
        <div className="scrollbar-thin max-h-[calc(100vh-7rem)] overflow-y-auto px-6 pb-6">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="cyan">status {hypothesis.status}</Badge>
            <Badge variant="slate">
              confidence {Math.round(hypothesis.confidence * 100)}%
            </Badge>
          </div>

          <Section title={`Supporting evidence (${support.length})`} color="green">
            {support.length === 0 ? (
              <div className="text-xs text-muted-foreground">No supporting evidence.</div>
            ) : (
              support.map((e) => <EvidenceRow key={e.id} e={e} toolRuns={toolRuns} />)
            )}
          </Section>

          <Section title={`Contradicting evidence (${contradict.length})`} color="red">
            {contradict.length === 0 ? (
              <div className="text-xs text-muted-foreground">No contradicting evidence.</div>
            ) : (
              contradict.map((e) => <EvidenceRow key={e.id} e={e} toolRuns={toolRuns} />)
            )}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: "green" | "red";
}) {
  return (
    <div className="mb-4">
      <div
        className={
          "mb-2 text-[10px] uppercase tracking-wider " +
          (color === "green" ? "text-emerald-300" : "text-red-300")
        }
      >
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EvidenceRow({ e, toolRuns }: { e: Evidence; toolRuns: ToolRun[] }) {
  const tr = toolRuns.find((t) => t.id === e.toolRunId);
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-2 text-xs">
      <div className="font-mono text-[10px] text-muted-foreground">{e.rawReference}</div>
      <div className="mt-1 text-foreground">{e.claim}</div>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
        {tr && <span>via {tr.toolName}</span>}
        <span>· confidence {Math.round(e.confidence * 100)}%</span>
        {e.sourceTimestamp && <span>· {e.sourceTimestamp}</span>}
      </div>
    </div>
  );
}

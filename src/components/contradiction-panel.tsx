"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Contradiction, Evidence, Hypothesis } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ContradictionPanel({
  contradictions,
  hypotheses,
  evidence,
}: {
  contradictions: Contradiction[];
  hypotheses: Hypothesis[];
  evidence: Evidence[];
}) {
  if (contradictions.length === 0) {
    return (
      <div className="card-surface p-6 text-sm text-muted-foreground">
        No contradictions detected yet. The verifier will flag a conflict here and automatically trigger a pivot if evidence disproves a claim.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {contradictions.map((c) => {
        const h = hypotheses.find((x) => x.id === c.hypothesisId);
        const triggers = evidence.filter((e) => c.triggerEvidenceIds.includes(e.id));
        return (
          <div
            key={c.id}
            className={cn(
              "card-surface border-red-500/30",
              c.resolved && "border-amber-500/30"
            )}
          >
            <div className="flex items-start gap-3 border-b border-border/60 p-4">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-300">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm">
                    {h ? h.title : "Hypothesis"} — {c.resolved ? "course corrected" : "conflict"}
                  </div>
                  {c.resolved && (
                    <Badge variant="amber" className="gap-1">
                      <RotateCcw className="h-3 w-3" /> resolved
                    </Badge>
                  )}
                  {!c.resolved && <Badge variant="red">active</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Resolution: </span>
                  <span className="text-foreground">{c.resolutionAction}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Triggering evidence
              </div>
              {triggers.length === 0 && (
                <div className="text-xs text-muted-foreground">No trigger evidence recorded.</div>
              )}
              {triggers.map((t) => (
                <div
                  key={t.id}
                  className="rounded-md border border-border/60 bg-background/40 p-2 text-xs"
                >
                  <div className="font-mono text-[10px] text-muted-foreground">{t.rawReference}</div>
                  <div className="mt-0.5 text-foreground">{t.claim}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

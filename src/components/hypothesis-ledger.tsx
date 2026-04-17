"use client";

import { AlertCircle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Hypothesis } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<Hypothesis["status"], { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  tentative: { label: "Tentative", color: "text-slate-300 border-slate-500/30 bg-slate-500/10", Icon: HelpCircle },
  confirmed: { label: "Confirmed", color: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10", Icon: CheckCircle2 },
  contradicted: { label: "Contradicted", color: "text-amber-300 border-amber-500/30 bg-amber-500/10", Icon: AlertCircle },
  rejected: { label: "Rejected", color: "text-red-300 border-red-500/30 bg-red-500/10", Icon: XCircle },
};

export function HypothesisLedger({
  hypotheses,
  onSelect,
}: {
  hypotheses: Hypothesis[];
  onSelect?: (h: Hypothesis) => void;
}) {
  return (
    <div className="card-surface flex h-full flex-col">
      <div className="border-b border-border/60 px-4 py-3">
        <div className="text-sm font-semibold">Hypothesis ledger</div>
        <div className="text-xs text-muted-foreground">
          Each hypothesis tracks supporting and contradicting evidence
        </div>
      </div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3 max-h-[520px]">
        {hypotheses.length === 0 && (
          <div className="flex h-full items-center justify-center py-10 text-sm text-muted-foreground">
            No hypotheses yet.
          </div>
        )}
        {hypotheses.map((h) => {
          const meta = STATUS_META[h.status];
          const Icon = meta.Icon;
          return (
            <button
              key={h.id}
              onClick={() => onSelect?.(h)}
              className={cn(
                "group w-full rounded-md border border-border/60 bg-background/40 p-3 text-left transition-colors hover:border-cyan-400/40 hover:bg-cyan-500/5",
                (h.status === "contradicted" || h.status === "rejected") && "border-red-500/20"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm truncate">{h.title}</div>
                <div className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]", meta.color)}>
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{h.statement}</p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={h.confidence * 100} className="h-1.5" />
                <span className="w-10 text-right text-[11px] font-mono tabular-nums text-muted-foreground">
                  {Math.round(h.confidence * 100)}%
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <Badge variant="green">+{h.supportingEvidenceIds.length} supports</Badge>
                <Badge variant="red">−{h.contradictingEvidenceIds.length} contradicts</Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

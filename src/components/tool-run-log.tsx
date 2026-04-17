"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ToolRun } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<ToolRun["status"], "green" | "red" | "amber" | "cyan" | "slate"> = {
  success: "green",
  failed: "red",
  blocked: "red",
  queued: "slate",
  running: "cyan",
};

export function ToolRunLog({ toolRuns }: { toolRuns: ToolRun[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (toolRuns.length === 0) {
    return (
      <div className="card-surface p-4 text-sm text-muted-foreground">No tool runs yet.</div>
    );
  }
  return (
    <div className="space-y-2">
      {toolRuns.map((t) => {
        const expanded = open === t.id;
        const blocked = t.status === "blocked";
        return (
          <div
            key={t.id}
            className={cn(
              "card-surface overflow-hidden",
              blocked && "border-red-500/30"
            )}
          >
            <button
              onClick={() => setOpen(expanded ? null : t.id)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <span className="text-muted-foreground">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
              {blocked && <ShieldAlert className="h-4 w-4 text-red-400" />}
              <span className="font-mono text-xs text-cyan-200">{t.toolName}</span>
              <Badge variant={STATUS_COLORS[t.status]}>{t.status}</Badge>
              <Badge variant="slate" className="text-[10px] uppercase">
                {t.safetyLevel}
              </Badge>
              <div className="ml-auto text-xs text-muted-foreground">{t.durationMs}ms</div>
            </button>
            {expanded && (
              <div className="border-t border-border/60 p-3 text-xs">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Input</div>
                    <pre className="whitespace-pre-wrap break-words rounded bg-background/60 p-2 text-[11px] text-foreground font-mono">
                      {JSON.stringify(t.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Output / status</div>
                    <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded bg-background/60 p-2 text-[11px] text-foreground font-mono">
                      {t.errorMessage
                        ? t.errorMessage
                        : JSON.stringify(t.output, null, 2).slice(0, 2000)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

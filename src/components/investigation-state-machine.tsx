"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunState } from "@/lib/types";
import { RUN_STATES, STATE_LABELS } from "@/lib/agent/state-machine";

export function InvestigationStateMachine({ state }: { state: RunState }) {
  const activeIndex = RUN_STATES.indexOf(state as (typeof RUN_STATES)[number]);
  const isSpecial = state === "contradict" || state === "paused" || state === "failed";

  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Agent state
          </div>
          <div className="text-base font-semibold">
            {STATE_LABELS[state] ?? state}
          </div>
        </div>
        <div
          className={cn(
            "text-xs px-2 py-1 rounded border",
            state === "complete"
              ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
              : isSpecial && state === "contradict"
              ? "text-red-300 border-red-500/30 bg-red-500/10 animate-pulseGlow"
              : "text-cyan-300 border-cyan-500/30 bg-cyan-500/10"
          )}
        >
          {state}
        </div>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {RUN_STATES.map((s, i) => {
          const active = state === s;
          const done = activeIndex > i || state === "complete";
          return (
            <div key={s} className="flex items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs",
                  active &&
                    "border-cyan-400/40 bg-cyan-500/10 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.15)] animate-pulseGlow",
                  !active && done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                  !active && !done && "border-border/60 bg-background/60 text-muted-foreground"
                )}
              >
                {active ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : done ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                )}
                <span>{STATE_LABELS[s]}</span>
              </div>
              {i < RUN_STATES.length - 1 && (
                <div className="h-px w-4 bg-border/60" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

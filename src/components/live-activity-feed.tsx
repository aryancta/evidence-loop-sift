"use client";

import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  Check,
  CircleDot,
  FileText,
  ShieldAlert,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunSnapshot } from "@/lib/types";
import { fmtTimeShort } from "@/utils/format";

interface FeedEntry {
  id: string;
  ts: string;
  icon: "tool" | "state" | "evidence" | "contradiction" | "hypothesis" | "report" | "blocked";
  title: string;
  subtitle?: string;
  tone?: "default" | "success" | "warn" | "danger" | "cyan";
}

function buildEntries(s: RunSnapshot): FeedEntry[] {
  const entries: FeedEntry[] = [];
  for (const t of s.toolRuns) {
    entries.push({
      id: `tr-${t.id}`,
      ts: t.endedAt ?? t.startedAt,
      icon: t.status === "blocked" ? "blocked" : "tool",
      title: `${t.toolName} · ${t.status}`,
      subtitle:
        t.status === "blocked"
          ? t.errorMessage ?? "Blocked by guardrail"
          : t.status === "failed"
          ? t.errorMessage ?? "Tool failed"
          : `${t.durationMs}ms · safety=${t.safetyLevel}`,
      tone:
        t.status === "success"
          ? "success"
          : t.status === "blocked"
          ? "danger"
          : t.status === "failed"
          ? "warn"
          : "cyan",
    });
  }
  for (const c of s.contradictions) {
    entries.push({
      id: `c-${c.id}`,
      ts: c.resolvedAt ?? c.createdAt,
      icon: "contradiction",
      title: c.resolved ? "Contradiction resolved" : "Contradiction detected",
      subtitle: c.description,
      tone: c.resolved ? "warn" : "danger",
    });
  }
  for (const h of s.hypotheses) {
    entries.push({
      id: `h-${h.id}-${h.lastUpdatedAt}`,
      ts: h.lastUpdatedAt,
      icon: "hypothesis",
      title: `Hypothesis · ${h.title}`,
      subtitle: `status=${h.status} confidence=${Math.round(h.confidence * 100)}%`,
      tone:
        h.status === "confirmed"
          ? "success"
          : h.status === "contradicted" || h.status === "rejected"
          ? "warn"
          : "default",
    });
  }
  if (s.report) {
    entries.push({
      id: `rep-${s.report.id}`,
      ts: s.report.createdAt,
      icon: "report",
      title: "Final report ready",
      subtitle: `${s.report.confirmedFindings.length} findings · hash ${s.report.signedHash.slice(0, 22)}…`,
      tone: "cyan",
    });
  }
  entries.sort((a, b) => a.ts.localeCompare(b.ts));
  return entries;
}

const ICONS = {
  tool: Wrench,
  state: CircleDot,
  evidence: FileText,
  contradiction: AlertTriangle,
  hypothesis: Zap,
  report: Check,
  blocked: ShieldAlert,
};

export function LiveActivityFeed({ snapshot }: { snapshot: RunSnapshot }) {
  const entries = buildEntries(snapshot);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div className="card-surface flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Streaming activity</div>
          <div className="text-xs text-muted-foreground">
            Live transitions, tool runs, and hypothesis updates
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{entries.length} events</div>
      </div>
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto p-3 space-y-2 max-h-[520px]"
      >
        {entries.length === 0 && (
          <div className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
            Waiting for agent activity…
          </div>
        )}
        {entries.map((e) => {
          const Icon = ICONS[e.icon];
          return (
            <div
              key={e.id}
              className={cn(
                "animate-fade-in group flex gap-3 rounded-md border border-border/60 bg-background/40 p-3 text-sm"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                  e.tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                  e.tone === "danger" && "border-red-500/30 bg-red-500/10 text-red-300",
                  e.tone === "warn" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
                  e.tone === "cyan" && "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
                  (!e.tone || e.tone === "default") && "border-border/60 bg-secondary/40 text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="truncate font-medium text-foreground">{e.title}</div>
                  <div className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {fmtTimeShort(e.ts)}
                  </div>
                </div>
                {e.subtitle && (
                  <div className="mt-0.5 text-xs text-muted-foreground break-words">{e.subtitle}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

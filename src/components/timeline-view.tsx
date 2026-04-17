"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEV_COLORS: Record<string, string> = {
  critical: "bg-red-500/80",
  high: "bg-amber-400/90",
  medium: "bg-cyan-400/80",
  low: "bg-slate-400/60",
};

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  const [filterSource, setFilterSource] = useState<string | "all">("all");

  const sources = useMemo(() => {
    const s = new Set(events.map((e) => e.source));
    return ["all", ...Array.from(s)];
  }, [events]);

  const filtered = useMemo(() => {
    const arr =
      filterSource === "all"
        ? events
        : events.filter((e) => e.source === filterSource);
    return arr.slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [events, filterSource]);

  const histogram = useMemo(() => {
    if (filtered.length === 0) return [];
    const first = new Date(filtered[0].timestamp).getTime();
    const last = new Date(filtered[filtered.length - 1].timestamp).getTime();
    const span = Math.max(1, last - first);
    const buckets = Array.from({ length: 24 }, () => 0);
    for (const e of filtered) {
      const i = Math.min(23, Math.floor(((new Date(e.timestamp).getTime() - first) / span) * 23));
      buckets[i]++;
    }
    const max = Math.max(...buckets, 1);
    return buckets.map((v) => v / max);
  }, [filtered]);

  return (
    <div className="card-surface">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Normalized timeline</div>
          <div className="text-xs text-muted-foreground">
            Correlated from logs, MFT, and EDR into a single event stream
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {sources.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSource(s as typeof filterSource)}
              className={cn(
                "rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors",
                filterSource === s
                  ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {histogram.length > 0 && (
        <div className="border-b border-border/60 px-4 py-3">
          <div className="flex h-8 items-end gap-0.5">
            {histogram.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-cyan-500/20"
                style={{ height: `${Math.max(6, h * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>{filtered[0]?.timestamp}</span>
            <span>{filtered[filtered.length - 1]?.timestamp}</span>
          </div>
        </div>
      )}

      <div className="scrollbar-thin max-h-[520px] overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No timeline events yet. Run the investigation to populate.
          </div>
        ) : (
          <ol className="relative space-y-3 border-l border-border/60 pl-5">
            {filtered.map((e) => (
              <li key={e.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                    SEV_COLORS[e.severity] ?? "bg-slate-400"
                  )}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {e.timestamp}
                  </span>
                  <Badge variant="slate" className="text-[10px] uppercase">
                    {e.source}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {e.category}
                  </Badge>
                </div>
                <div className="mt-0.5 text-sm text-foreground">{e.summary}</div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

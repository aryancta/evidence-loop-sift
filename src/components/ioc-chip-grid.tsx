"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Ioc } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, "cyan" | "amber" | "red" | "slate" | "violet" | "green"> = {
  file_path: "cyan",
  hash: "violet",
  process: "amber",
  command: "amber",
  ip: "red",
  user: "slate",
  domain: "red",
  timestamp: "slate",
};

export function IocChipGrid({ iocs }: { iocs: Ioc[] }) {
  const [selected, setSelected] = useState<Ioc | null>(null);

  if (iocs.length === 0) {
    return (
      <div className="card-surface p-4 text-sm text-muted-foreground">
        No IOCs extracted yet.
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">Indicators of compromise</div>
        <div className="text-xs text-muted-foreground">{iocs.length} total</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {iocs.map((i) => (
          <button
            key={i.id}
            onClick={() => setSelected(i)}
            className={cn(
              "rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-cyan-400/40",
              selected?.id === i.id && "border-cyan-400/60 bg-cyan-500/10"
            )}
          >
            <div className="flex items-center gap-2">
              <Badge variant={TYPE_COLORS[i.type] ?? "slate"} className="text-[9px] uppercase">
                {i.type}
              </Badge>
              <span className="font-mono text-[11px]">{i.value}</span>
            </div>
            {i.note && (
              <div className="mt-0.5 text-[10px] text-muted-foreground max-w-[32ch] truncate">
                {i.note}
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-md border border-border/60 bg-background/60 p-3 text-xs">
          <div className="font-semibold">{selected.value}</div>
          <div className="mt-1 text-muted-foreground">{selected.note}</div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Confidence {Math.round(selected.confidence * 100)}% · sources {selected.sourceEvidenceIds.length}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoCase } from "@/lib/mock-data";

export function CaseSelector({
  cases,
  value,
  onChange,
}: {
  cases: DemoCase[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = cases.find((c) => c.id === value) ?? cases[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm hover:bg-secondary/40"
      >
        <span className="truncate max-w-[260px] text-left">{current?.name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-80 overflow-hidden rounded-md border border-border/60 bg-popover shadow-lg">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 border-b border-border/40 px-3 py-2 text-left text-sm last:border-0 hover:bg-secondary/60",
                value === c.id && "bg-cyan-500/5 text-cyan-200"
              )}
            >
              <div className="flex-1">
                <div className="truncate font-medium">{c.name}</div>
                <div className="truncate text-xs text-muted-foreground">{c.summary}</div>
              </div>
              {value === c.id && <Check className="h-4 w-4 text-cyan-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { AlertTriangle, Database, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SEV_COLORS: Record<string, "red" | "amber" | "cyan" | "slate"> = {
  critical: "red",
  high: "amber",
  medium: "cyan",
  low: "slate",
};

export function CaseCard({ demo, onLoad }: { demo: DemoCase; onLoad?: (c: DemoCase) => void }) {
  const sev = SEV_COLORS[demo.severity] ?? "slate";
  return (
    <Card className="relative overflow-hidden transition-colors hover:border-cyan-400/40">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0 opacity-60" />
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{demo.name}</CardTitle>
          <Badge variant={sev}>{demo.severity}</Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{demo.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {demo.tags.slice(0, 4).map((t) => (
            <Badge key={t} variant="slate" className="text-[10px] uppercase tracking-wider">
              {t}
            </Badge>
          ))}
        </div>

        {demo.falseLeadHint && (
          <div className="flex items-start gap-2 rounded-md border border-amber-400/20 bg-amber-500/5 p-2 text-xs text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{demo.falseLeadHint}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            {demo.artifactCount} artifacts
          </div>
          <span className={cn("text-[10px] uppercase tracking-wider text-cyan-300")}>{demo.scenario}</span>
        </div>

        <div className="grid gap-2">
          <div className="rounded-md border border-border/60 bg-background/60 p-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Artifact inventory
            </div>
            <ul className="text-[11px] space-y-0.5 text-muted-foreground">
              {demo.artifacts.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{a.name}</span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-400">
                    {a.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            asChild
            size="sm"
            variant="cyan"
            className="gap-1.5"
            onClick={(e) => {
              if (onLoad) {
                e.preventDefault();
                onLoad(demo);
              }
            }}
          >
            <Link href={`/dashboard?caseId=${demo.id}`}>
              <PlayCircle className="h-3.5 w-3.5" />
              Load into Dashboard
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/report/${demo.id}`}>View report</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

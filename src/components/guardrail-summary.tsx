"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, KeyRound, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payload {
  allowedTools: Array<{
    name: string;
    description: string;
    inputType: string;
    outputType: string;
    safetyLevel: string;
  }>;
  blockedActions: Array<{ id: string; timestamp: string; tool: string; input: string; reason: string }>;
  validationRules: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    enabled: boolean;
  }>;
}

export function GuardrailSummary() {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    fetch("/api/guardrails")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="card-surface p-6 text-sm text-muted-foreground">Loading guardrails…</div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Allowed tools
          </div>
          <div className="text-2xl font-semibold text-cyan-300">{data.allowedTools.length}</div>
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Rules active
          </div>
          <div className="text-2xl font-semibold text-emerald-300">
            {data.validationRules.filter((r) => r.enabled).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" /> Recent blocks
          </div>
          <div className="text-2xl font-semibold text-red-300">{data.blockedActions.length}</div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <KeyRound className="h-4 w-4 text-cyan-300" /> Allowed tools surface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.allowedTools.map((t) => (
            <div
              key={t.name}
              className="rounded-md border border-border/60 bg-background/40 p-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-200">{t.name}</span>
                <Badge variant="slate" className="text-[10px] uppercase">
                  {t.safetyLevel}
                </Badge>
              </div>
              <div className="mt-1 text-muted-foreground">{t.description}</div>
              <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                <span>input: <span className="font-mono">{t.inputType}</span></span>
                <span>output: <span className="font-mono">{t.outputType}</span></span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Validation rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.validationRules.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-border/60 bg-background/40 p-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="font-medium">{r.name}</div>
                <Badge variant={r.enabled ? "green" : "slate"} className="text-[10px] uppercase">
                  {r.enabled ? "enabled" : "disabled"}
                </Badge>
                <Badge variant="slate" className="text-[10px] uppercase">
                  {r.category}
                </Badge>
              </div>
              <div className="mt-1 text-muted-foreground">{r.description}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldAlert className="h-4 w-4 text-red-300" /> Blocked actions (sample)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.blockedActions.map((b) => (
            <div
              key={b.id}
              className="rounded-md border border-red-500/20 bg-red-500/5 p-3 text-xs"
            >
              <div className="flex items-center gap-2 font-mono">
                <span className="text-red-300">{b.tool}</span>
                <span className="text-muted-foreground">{b.timestamp}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">{b.input}</div>
              <div className="mt-1 text-red-200">Reason: {b.reason}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

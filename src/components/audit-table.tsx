"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditEvent } from "@/lib/types";
import { fmtTime } from "@/utils/format";

const TYPE_COLORS: Record<AuditEvent["type"], "cyan" | "amber" | "red" | "green" | "slate" | "violet"> = {
  tool_run: "cyan",
  state_change: "slate",
  guardrail_block: "red",
  evidence_added: "green",
  hypothesis_update: "violet",
  contradiction: "amber",
  report_generated: "green",
  run_started: "cyan",
  run_completed: "green",
};

export function AuditTable() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/audit", { cache: "no-store" });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const j = await res.json();
      if (!cancelled) {
        setEvents(j.events ?? []);
        setLoading(false);
      }
    }
    load();
    const i = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(i);
    };
  }, []);

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Append-only audit trail</div>
          <div className="text-xs text-muted-foreground">
            Every agent, system, and user action is recorded with evidence refs
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{events.length} events</div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Timestamp</TableHead>
            <TableHead className="w-36">Type</TableHead>
            <TableHead className="w-24">Actor</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="w-40">Run / Case</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                Loading audit events…
              </TableCell>
            </TableRow>
          )}
          {!loading && events.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                No audit events yet.
              </TableCell>
            </TableRow>
          )}
          {events.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-mono text-[11px]">{fmtTime(e.timestamp)}</TableCell>
              <TableCell>
                <Badge variant={TYPE_COLORS[e.type] ?? "slate"} className="text-[10px] uppercase">
                  {e.type}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{e.actor}</TableCell>
              <TableCell className="max-w-[440px] truncate text-xs">{e.summary}</TableCell>
              <TableCell className="text-[10px] font-mono text-muted-foreground">
                {e.runId?.slice(0, 10) ?? "—"} / {e.caseId ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

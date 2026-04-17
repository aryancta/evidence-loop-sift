"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinalReport, RunSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReportViewer({
  report,
  snapshot,
}: {
  report: FinalReport;
  snapshot: RunSnapshot;
}) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Executive summary</CardTitle>
            <Badge variant="cyan">sha256 {report.signedHash.slice(7, 19)}…</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{report.executiveSummary}</p>
          <div className="text-xs text-muted-foreground">
            Generated {report.createdAt} · {report.confirmedFindings.length} confirmed findings ·{" "}
            {report.hypotheses.length} hypotheses total · {report.iocs.length} IOCs
          </div>
        </CardContent>
      </Card>

      <Section title="Confirmed findings" tone="success">
        {report.confirmedFindings.length === 0 && (
          <Empty>No fully confirmed findings — see hypotheses below.</Empty>
        )}
        <div className="space-y-2">
          {report.confirmedFindings.map((f) => (
            <div
              key={f.id}
              className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm"
            >
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <div className="flex-1">
                  <div className="text-foreground">{f.text}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {f.citationIds.map((cid) => (
                      <CitationPill key={cid} cid={cid} report={report} snapshot={snapshot} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Hypotheses & rejected leads" tone="warn">
        <div className="space-y-2">
          {report.hypotheses.map((h) => (
            <div
              key={h.id}
              className={cn(
                "rounded-md border bg-background/40 p-3 text-sm",
                h.status === "confirmed" && "border-emerald-500/20",
                h.status === "tentative" && "border-border/60",
                (h.status === "contradicted" || h.status === "rejected") && "border-red-500/20"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{h.title}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant={
                      h.status === "confirmed"
                        ? "green"
                        : h.status === "contradicted" || h.status === "rejected"
                        ? "red"
                        : "slate"
                    }
                  >
                    {h.status}
                  </Badge>
                  <span className="font-mono text-muted-foreground">
                    {Math.round(h.confidence * 100)}%
                  </span>
                </div>
              </div>
              {h.note && <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {h.citationIds.map((cid) => (
                  <CitationPill key={cid} cid={cid} report={report} snapshot={snapshot} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Timeline summary" tone="default">
        <div className="max-h-80 space-y-1 overflow-y-auto pr-2 scrollbar-thin">
          {report.timeline.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded border border-border/60 bg-background/40 p-2 text-xs"
            >
              <span className="font-mono text-muted-foreground">{t.timestamp}</span>
              <Badge variant="slate" className="text-[10px] uppercase">
                {t.source}
              </Badge>
              <span className="flex-1 text-foreground">{t.summary}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Indicators of compromise" tone="default">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {report.iocs.map((i) => (
                <tr key={i.id} className="border-t border-border/60">
                  <td className="px-3 py-2">
                    <Badge variant="slate" className="text-[10px] uppercase">
                      {i.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px]">{i.value}</td>
                  <td className="px-3 py-2 font-mono">{Math.round(i.confidence * 100)}%</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{i.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Open questions & next steps" tone="default">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {report.openQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </Section>

      <CitationIndex report={report} snapshot={snapshot} />
    </div>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "default" | "success" | "warn";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Card>
      <CardHeader className="cursor-pointer select-none pb-2" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
      {children}
    </div>
  );
}

function CitationPill({
  cid,
  report,
  snapshot,
}: {
  cid: string;
  report: FinalReport;
  snapshot: RunSnapshot;
}) {
  const [open, setOpen] = useState(false);
  const cit = report.citations.find((c) => c.id === cid);
  const tr = cit ? snapshot.toolRuns.find((t) => t.id === cit.toolRunId) : null;
  if (!cit) return null;
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-200 hover:bg-cyan-500/20"
      >
        {cid.slice(0, 10)}
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1 w-80 rounded-md border border-border/60 bg-popover p-3 text-xs shadow-lg">
          <div className="font-mono text-[10px] text-muted-foreground">{cit.evidenceId}</div>
          <div className="mt-1 text-foreground">{cit.claim}</div>
          {tr && (
            <div className="mt-2 border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
              via {tr.toolName} · {tr.durationMs}ms · {tr.status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CitationIndex({ report, snapshot }: { report: FinalReport; snapshot: RunSnapshot }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Citation index</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="scrollbar-thin max-h-64 space-y-1 overflow-y-auto text-xs">
          {report.citations.map((c) => {
            const tr = snapshot.toolRuns.find((t) => t.id === c.toolRunId);
            return (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded border border-border/60 bg-background/40 p-2"
              >
                <span className="shrink-0 font-mono text-[10px] text-cyan-300">{c.id.slice(0, 10)}</span>
                <div className="flex-1">
                  <div className="truncate text-foreground">{c.claim}</div>
                  {tr && (
                    <div className="text-[10px] text-muted-foreground">
                      via {tr.toolName} ({tr.durationMs}ms)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportExportButtons({
  report,
  snapshot,
}: {
  report: FinalReport;
  snapshot: RunSnapshot;
}) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ report, snapshot }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence-loop-report-${report.runId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportText = () => {
    const lines: string[] = [];
    lines.push(`EvidenceLoop SIFT Report`);
    lines.push(`================================`);
    lines.push(`Case: ${snapshot.caseId}`);
    lines.push(`Generated: ${report.createdAt}`);
    lines.push(`Signed hash: ${report.signedHash}`);
    lines.push("");
    lines.push(`EXECUTIVE SUMMARY`);
    lines.push(report.executiveSummary);
    lines.push("");
    lines.push("CONFIRMED FINDINGS");
    report.confirmedFindings.forEach((f, i) => lines.push(`${i + 1}. ${f.text}`));
    lines.push("");
    lines.push("HYPOTHESES");
    report.hypotheses.forEach((h) =>
      lines.push(`- [${h.status} ${Math.round(h.confidence * 100)}%] ${h.title}`)
    );
    lines.push("");
    lines.push("IOCs");
    report.iocs.forEach((i) => lines.push(`- [${i.type}] ${i.value} — ${i.note ?? ""}`));
    lines.push("");
    lines.push("OPEN QUESTIONS");
    report.openQuestions.forEach((q) => lines.push(`- ${q}`));
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence-loop-report-${report.runId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex items-center gap-2">
      <Button variant="cyan" onClick={exportJson} className="gap-1.5">
        <FileDown className="h-4 w-4" /> Export JSON
      </Button>
      <Button variant="outline" onClick={exportText} className="gap-1.5">
        <FileDown className="h-4 w-4" /> Export text
      </Button>
    </div>
  );
}

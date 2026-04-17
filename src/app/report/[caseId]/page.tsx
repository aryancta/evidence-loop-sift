"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ReportExportButtons, ReportViewer } from "@/components/report-viewer";
import { DEMO_CASES } from "@/lib/mock-data";
import type { FinalReport, RunSnapshot } from "@/lib/types";

export default function ReportPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<FinalReport | null>(null);
  const [snapshot, setSnapshot] = useState<RunSnapshot | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "generating" | "ready" | "error">("idle");

  const fetchReport = useCallback(async () => {
    setStatus("loading");
    const res = await fetch(`/api/reports/${caseId}`);
    if (res.ok) {
      const j = await res.json();
      setReport(j.report);
      setSnapshot(j.snapshot);
      setStatus("ready");
      return true;
    }
    return false;
  }, [caseId]);

  const generate = useCallback(async () => {
    setStatus("generating");
    const start = await fetch("/api/investigate/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ caseId, mode: "demo" }),
    });
    if (!start.ok) {
      setStatus("error");
      return;
    }
    const { runId } = await start.json();
    const poll = async (): Promise<void> => {
      for (let i = 0; i < 120; i++) {
        const r = await fetch(`/api/investigate/${runId}`);
        if (r.ok) {
          const j = await r.json();
          if (j.run?.report) {
            setReport(j.run.report);
            setSnapshot(j.run);
            setStatus("ready");
            return;
          }
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      setStatus("error");
    };
    await poll();
  }, [caseId]);

  useEffect(() => {
    (async () => {
      const ok = await fetchReport();
      if (!ok) await generate();
    })();
  }, [fetchReport, generate]);

  const demo = DEMO_CASES.find((c) => c.id === caseId);

  return (
    <AppShell>
      <div className="border-b border-border/60 bg-card/20 px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-4 w-4 text-cyan-300" /> Incident Report
              </h1>
              <div className="text-xs text-muted-foreground">
                {demo?.name ?? caseId} · evidence-first, citation-backed
              </div>
            </div>
          </div>
          {report && snapshot && (
            <ReportExportButtons report={report} snapshot={snapshot} />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-6">
        {status === "loading" && <Placeholder text="Loading report…" />}
        {status === "generating" && (
          <Placeholder text="Running autonomous investigation to generate this report…" />
        )}
        {status === "error" && <Placeholder text="No report available and auto-generation failed." />}
        {status === "ready" && report && snapshot && (
          <ReportViewer report={report} snapshot={snapshot} />
        )}
      </div>
    </AppShell>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="card-surface animate-pulse p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

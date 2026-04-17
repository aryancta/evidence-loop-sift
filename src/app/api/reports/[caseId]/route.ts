import { NextResponse } from "next/server";
import { listRuns } from "@/lib/agent/run-loop";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { caseId: string } }) {
  const runs = listRuns()
    .filter((r) => r.snapshot.caseId === params.caseId && r.snapshot.report)
    .sort((a, b) => (b.snapshot.completedAt ?? "").localeCompare(a.snapshot.completedAt ?? ""));
  const latest = runs[0];
  if (!latest?.snapshot.report) {
    return NextResponse.json({ error: "No report available for this case yet" }, { status: 404 });
  }
  return NextResponse.json({ report: latest.snapshot.report, snapshot: latest.snapshot });
}

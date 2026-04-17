import { NextResponse } from "next/server";
import { snapshotForRun } from "@/lib/agent/run-loop";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { runId: string } }) {
  const s = snapshotForRun(params.runId);
  if (!s) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  return NextResponse.json({ run: s });
}

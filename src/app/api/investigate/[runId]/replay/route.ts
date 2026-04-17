import { NextResponse } from "next/server";
import { eventsForRun, snapshotForRun } from "@/lib/agent/run-loop";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { runId: string } }) {
  const s = snapshotForRun(params.runId);
  if (!s) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  const events = eventsForRun(params.runId);
  return NextResponse.json({ status: "replaying", events, snapshot: s });
}

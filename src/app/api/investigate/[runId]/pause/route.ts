import { NextResponse } from "next/server";
import { pauseRun } from "@/lib/agent/run-loop";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { runId: string } }) {
  pauseRun(params.runId);
  return NextResponse.json({ status: "paused" });
}

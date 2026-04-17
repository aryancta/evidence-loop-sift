import { NextResponse } from "next/server";
import { resumeRun } from "@/lib/agent/run-loop";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { runId: string } }) {
  resumeRun(params.runId);
  return NextResponse.json({ status: "running" });
}

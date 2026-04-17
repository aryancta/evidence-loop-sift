import { NextResponse } from "next/server";
import { z } from "zod";
import { startInvestigation } from "@/lib/agent/run-loop";

export const dynamic = "force-dynamic";

const body = z.object({
  caseId: z.string(),
  mode: z.enum(["demo", "analysis"]).default("demo"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const run = await startInvestigation(parsed.data.caseId, parsed.data.mode);
  return NextResponse.json({
    runId: run.snapshot.id,
    status: "running",
    startedAt: run.snapshot.startedAt,
  });
}

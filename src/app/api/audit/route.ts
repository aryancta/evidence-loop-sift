import { NextResponse } from "next/server";
import { getAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const events = getAudit({
    runId: searchParams.get("runId") ?? undefined,
    caseId: searchParams.get("caseId") ?? undefined,
    type: searchParams.get("eventType") ?? undefined,
  });
  return NextResponse.json({ events });
}

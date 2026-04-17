import { NextResponse } from "next/server";
import { getCaseById } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { caseId: string } }
) {
  const c = getCaseById(params.caseId);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ case: c });
}

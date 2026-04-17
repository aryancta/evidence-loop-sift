import { NextResponse } from "next/server";
import { DEMO_CASES } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search")?.toLowerCase();

  const cases = DEMO_CASES.filter((c) => {
    if (severity && c.severity !== severity) return false;
    if (tag && !c.tags.includes(tag)) return false;
    if (search && !(`${c.name} ${c.description}`.toLowerCase().includes(search))) return false;
    return true;
  }).map((c) => ({
    id: c.id,
    name: c.name,
    severity: c.severity,
    tags: c.tags,
    artifactCount: c.artifactCount,
    summary: c.summary,
    falseLeadHint: c.falseLeadHint,
    scenario: c.scenario,
    description: c.description,
  }));

  return NextResponse.json({ cases });
}

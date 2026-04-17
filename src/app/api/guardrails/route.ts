import { NextResponse } from "next/server";
import { ALLOWED_TOOLS } from "@/lib/mcp/tools";
import { BLOCKED_ACTIONS, GUARDRAILS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    allowedTools: ALLOWED_TOOLS,
    blockedActions: BLOCKED_ACTIONS,
    validationRules: GUARDRAILS,
  });
}

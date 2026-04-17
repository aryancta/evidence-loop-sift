import { checkToolCall } from "./guardrails";
import { runMockTool } from "./mock-server";

export interface McpCallResult {
  ok: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
  blocked?: boolean;
  reason?: string;
}

export async function callTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<McpCallResult> {
  const check = checkToolCall(toolName, input);
  if (!check.ok) {
    return {
      ok: false,
      error: check.reason,
      reason: check.reason,
      blocked: true,
      durationMs: 0,
    };
  }
  const result = await runMockTool(toolName, (check.parsedInput ?? input) as Record<string, unknown>);
  if (!result.ok) {
    return { ok: false, error: result.error, durationMs: 0 };
  }
  return { ok: true, output: result.output, durationMs: result.durationMs };
}

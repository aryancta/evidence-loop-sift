import { ALLOWED_TOOLS, toolSchemas, type ToolName } from "./tools";

export interface GuardrailCheckResult {
  ok: boolean;
  reason?: string;
  parsedInput?: unknown;
}

export function checkToolCall(toolName: string, input: unknown): GuardrailCheckResult {
  const allowed = ALLOWED_TOOLS.find((t) => t.name === toolName);
  if (!allowed) {
    return { ok: false, reason: `Tool '${toolName}' is not in the allowlist` };
  }
  const schema = toolSchemas[toolName as ToolName];
  if (!schema) {
    return { ok: false, reason: "No schema registered for tool" };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: `Input validation failed: ${parsed.error.message}` };
  }
  return { ok: true, parsedInput: parsed.data };
}

import { z } from "zod";

export const toolSchemas = {
  "timeline.extract": z.object({
    artifactId: z.string(),
    filter: z.string().optional(),
  }),
  "log.parse": z.object({
    artifactId: z.string(),
    channel: z.string().optional(),
    query: z.string().optional(),
  }),
  "ioc.extract": z.object({
    artifactId: z.string(),
    categories: z.array(z.string()).optional(),
  }),
  "artifact.summarize": z.object({
    artifactId: z.string(),
  }),
} as const;

export type ToolName = keyof typeof toolSchemas;

export const ALLOWED_TOOLS: Array<{
  name: ToolName;
  description: string;
  inputType: string;
  outputType: string;
  safetyLevel: "safe" | "read-only" | "restricted";
}> = [
  {
    name: "timeline.extract",
    description: "Extract a normalized event timeline from a timeline-like artifact.",
    inputType: "{ artifactId, filter? }",
    outputType: "TimelineEvent[]",
    safetyLevel: "read-only",
  },
  {
    name: "log.parse",
    description: "Parse a log artifact into structured records and notable events.",
    inputType: "{ artifactId, channel?, query? }",
    outputType: "LogRecord[]",
    safetyLevel: "read-only",
  },
  {
    name: "ioc.extract",
    description: "Extract indicators of compromise such as paths, hashes, processes, and addresses.",
    inputType: "{ artifactId, categories? }",
    outputType: "Ioc[]",
    safetyLevel: "read-only",
  },
  {
    name: "artifact.summarize",
    description: "Produce a short high-level summary and confidence of an artifact.",
    inputType: "{ artifactId }",
    outputType: "Summary",
    safetyLevel: "safe",
  },
];

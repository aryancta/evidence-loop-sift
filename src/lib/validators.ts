import { z } from "zod";

export const StartInvestigationSchema = z.object({
  caseId: z.string().min(1),
  mode: z.enum(["demo", "analysis"]).default("demo"),
});

export const ReplaySchema = z.object({
  speed: z.enum(["slow", "normal", "fast"]).optional(),
});

export type StartInvestigationInput = z.infer<typeof StartInvestigationSchema>;

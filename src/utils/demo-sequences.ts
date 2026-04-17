import { DEMO_CASES } from "@/lib/mock-data";

export const DEMO_SEQUENCES = DEMO_CASES.map((c) => ({
  caseId: c.id,
  narrative: c.scenario,
  talkingPoints: [
    `Opening: "${c.falseLeadHint ?? c.summary}"`,
    c.expectedContradiction
      ? `Midpoint (contradiction): "${c.expectedContradiction}"`
      : `Midpoint: the agent correlates evidence across ${c.artifactCount} artifacts.`,
    `Closing: signed report with citation pills, hash visible in the header.`,
  ],
}));

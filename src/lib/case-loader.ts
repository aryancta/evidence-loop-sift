import { DEMO_CASES, getCaseById, type DemoCase } from "@/lib/mock-data";

export function listCases(): DemoCase[] {
  return DEMO_CASES;
}

export function loadCase(id: string): DemoCase | undefined {
  return getCaseById(id);
}

export function summarizeCase(demo: DemoCase) {
  return {
    id: demo.id,
    name: demo.name,
    severity: demo.severity,
    tags: demo.tags,
    artifactCount: demo.artifactCount,
    summary: demo.summary,
  };
}

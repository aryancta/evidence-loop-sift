import { PrismaClient } from "@prisma/client";
import { DEMO_CASES, GUARDRAILS } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] Seeding demo cases...");
  for (const c of DEMO_CASES) {
    await prisma.case.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        description: c.description,
        severity: c.severity,
        tags: JSON.stringify(c.tags),
        artifactCount: c.artifactCount,
        expectedContradiction: c.expectedContradiction ?? null,
        falseLeadHint: c.falseLeadHint ?? null,
        summary: c.summary,
      },
      create: {
        id: c.id,
        name: c.name,
        description: c.description,
        severity: c.severity,
        tags: JSON.stringify(c.tags),
        artifactCount: c.artifactCount,
        expectedContradiction: c.expectedContradiction ?? null,
        falseLeadHint: c.falseLeadHint ?? null,
        summary: c.summary,
      },
    });
    for (const a of c.artifacts) {
      await prisma.artifact.upsert({
        where: { id: a.id },
        update: {
          caseId: a.caseId,
          type: a.type,
          name: a.name,
          sourcePath: a.sourcePath,
          sizeBytes: a.sizeBytes,
          hash: a.hash ?? null,
          metadata: a.metadata ? JSON.stringify(a.metadata) : null,
        },
        create: {
          id: a.id,
          caseId: a.caseId,
          type: a.type,
          name: a.name,
          sourcePath: a.sourcePath,
          sizeBytes: a.sizeBytes,
          hash: a.hash ?? null,
          metadata: a.metadata ? JSON.stringify(a.metadata) : null,
        },
      });
    }
  }

  console.log("[seed] Seeding guardrail rules...");
  for (const g of GUARDRAILS) {
    await prisma.guardrailRule.upsert({
      where: { id: g.id },
      update: {
        name: g.name,
        description: g.description,
        category: g.category,
        enabled: g.enabled,
        config: g.config ? JSON.stringify(g.config) : null,
      },
      create: {
        id: g.id,
        name: g.name,
        description: g.description,
        category: g.category,
        enabled: g.enabled,
        config: g.config ? JSON.stringify(g.config) : null,
      },
    });
  }

  console.log("[seed] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

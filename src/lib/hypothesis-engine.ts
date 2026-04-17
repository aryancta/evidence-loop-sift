import type { DemoCase } from "@/lib/mock-data";
import type { Hypothesis } from "@/lib/types";

export function seedHypotheses(runId: string, demo: DemoCase): Hypothesis[] {
  const now = new Date().toISOString();
  if (demo.id === "incident-01") {
    return [
      {
        id: "h-insider-jdoe",
        runId,
        title: "Insider exfiltration by jdoe",
        statement:
          "Developer account jdoe accessed customer data off-hours and staged it for exfiltration.",
        status: "tentative",
        confidence: 0.55,
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        lastUpdatedAt: now,
        note: "Initial SIEM alert hypothesis.",
      },
      {
        id: "h-scheduled-task",
        runId,
        title: "Scheduled task under SYSTEM",
        statement:
          "Activity was driven by a SYSTEM-level scheduled task impersonating jdoe's token, not jdoe directly.",
        status: "tentative",
        confidence: 0.2,
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        lastUpdatedAt: now,
        note: "Alternate hypothesis held in reserve pending log parse.",
      },
    ];
  }
  return [
    {
      id: "h-benign-powershell",
      runId,
      title: "Benign PowerShell admin scripting",
      statement: "PowerShell activity is routine admin automation, not malicious.",
      status: "tentative",
      confidence: 0.5,
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      lastUpdatedAt: now,
      note: "First-pass SOC reading.",
    },
    {
      id: "h-lateral-movement",
      runId,
      title: "Document-borne lateral movement",
      statement:
        "A malicious document triggered PowerShell to pull a second stage and pivot to FIN-03 via WMI.",
      status: "tentative",
      confidence: 0.3,
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      lastUpdatedAt: now,
      note: "Held in reserve; needs correlation across PS, EDR, DNS.",
    },
  ];
}

import type { Artifact, CaseSummary, GuardrailRule } from "./types";

export interface DemoCase extends CaseSummary {
  artifacts: Artifact[];
  notes: string[];
  scenario: "false-lead" | "timeline-heavy" | "log-correlation";
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: "incident-01",
    name: "Phantom Insider - Workstation WKS-4471",
    description:
      "An initial SIEM alert flagged the developer account 'jdoe' for suspicious off-hours file access on workstation WKS-4471. Timeline artifacts and authentication logs are available for correlation.",
    severity: "high",
    tags: ["false lead", "timeline-heavy", "log correlation", "authentication"],
    artifactCount: 4,
    summary:
      "Endpoint triage case where the obvious insider lead is disproved by scheduler and auth evidence, revealing a scheduled task executed under a service account.",
    falseLeadHint: "Initial SIEM alert blames developer jdoe; scheduled task evidence contradicts it.",
    expectedContradiction:
      "Hypothesis: jdoe exfiltrated data off-hours. Evidence: jdoe was not logged in at the time, and a scheduled task under NT AUTHORITY\\SYSTEM performed the file access.",
    scenario: "false-lead",
    artifacts: [
      {
        id: "a1-timeline",
        caseId: "incident-01",
        type: "timeline",
        name: "WKS-4471.mft.timeline.csv",
        sourcePath: "artifacts/incident-01/timeline.csv",
        sizeBytes: 48123,
        hash: "sha256:3c0ef4...a91d",
        metadata: { tool: "plaso", entries: 214 },
      },
      {
        id: "a1-winlog",
        caseId: "incident-01",
        type: "log",
        name: "Security.evtx.json",
        sourcePath: "artifacts/incident-01/security.json",
        sizeBytes: 129441,
        hash: "sha256:a12b77...c89f",
        metadata: { channel: "Security", events: 312 },
      },
      {
        id: "a1-sched",
        caseId: "incident-01",
        type: "registry",
        name: "TaskScheduler.reg.json",
        sourcePath: "artifacts/incident-01/scheduler.json",
        sizeBytes: 14321,
        metadata: { hive: "HKLM", keys: 18 },
      },
      {
        id: "a1-netflow",
        caseId: "incident-01",
        type: "network",
        name: "wks4471.netflow.json",
        sourcePath: "artifacts/incident-01/netflow.json",
        sizeBytes: 22110,
        metadata: { flows: 84 },
      },
    ],
    notes: [
      "Demo designed to trigger a contradiction when auth logs disprove the insider hypothesis.",
      "Scheduled task 'BackupSweep' is the true root cause.",
    ],
  },
  {
    id: "incident-02",
    name: "Lateral Whisper - Finance Subnet",
    description:
      "Multiple hosts on the finance subnet triggered PowerShell execution alerts. Artifacts include PowerShell transcript logs, EDR process telemetry, and DNS resolution logs.",
    severity: "critical",
    tags: ["timeline-heavy", "log correlation", "lateral movement"],
    artifactCount: 3,
    summary:
      "A correlation-heavy case that stitches process, DNS, and PowerShell evidence into a coherent lateral movement narrative.",
    falseLeadHint: "First-pass reading of PowerShell logs suggests benign admin activity.",
    expectedContradiction:
      "Hypothesis: PowerShell is benign admin scripting. Evidence: encoded base64 downloader and outbound DNS to suspicious TLD contradict it.",
    scenario: "log-correlation",
    artifacts: [
      {
        id: "a2-pstx",
        caseId: "incident-02",
        type: "log",
        name: "PowerShellTranscript.log",
        sourcePath: "artifacts/incident-02/pwsh.log",
        sizeBytes: 88234,
        metadata: { lines: 742 },
      },
      {
        id: "a2-edr",
        caseId: "incident-02",
        type: "timeline",
        name: "edr.process_timeline.json",
        sourcePath: "artifacts/incident-02/edr.json",
        sizeBytes: 64211,
        metadata: { events: 198 },
      },
      {
        id: "a2-dns",
        caseId: "incident-02",
        type: "network",
        name: "dns_resolver.log",
        sourcePath: "artifacts/incident-02/dns.log",
        sizeBytes: 19822,
        metadata: { queries: 412 },
      },
    ],
    notes: [
      "Demo showcases correlation across three artifact types without triggering a hard contradiction.",
      "Ends with a confirmed lateral-movement narrative.",
    ],
  },
];

export const GUARDRAILS: GuardrailRule[] = [
  {
    id: "g-allowlist",
    name: "Tool allowlist",
    description:
      "Only approved typed MCP tools may be executed. Any other invocation is blocked at the tool router.",
    category: "tool_allowlist",
    enabled: true,
    config: {
      tools: ["timeline.extract", "log.parse", "ioc.extract", "artifact.summarize"],
    },
  },
  {
    id: "g-no-shell",
    name: "No arbitrary shell",
    description:
      "Shell execution, filesystem writes, and network egress are disabled for the agent layer.",
    category: "safety_policy",
    enabled: true,
  },
  {
    id: "g-input-schema",
    name: "Strict input schemas",
    description:
      "Every tool invocation is validated with a zod schema before dispatch. Unknown fields are rejected.",
    category: "input_validation",
    enabled: true,
  },
  {
    id: "g-output-normalize",
    name: "Output normalization",
    description:
      "Every tool result is normalized into Evidence objects with a raw reference to the source line or JSON path.",
    category: "output_validation",
    enabled: true,
  },
  {
    id: "g-readonly",
    name: "Read-only artifacts",
    description:
      "The MCP tool layer opens artifacts in read-only mode. No mutation or deletion is permitted.",
    category: "safety_policy",
    enabled: true,
  },
  {
    id: "g-confidence",
    name: "Confidence-gated claims",
    description:
      "Claims with confidence below 0.4 are tagged 'inferred' and cannot graduate to 'confirmed' without corroboration.",
    category: "output_validation",
    enabled: true,
  },
];

export const BLOCKED_ACTIONS = [
  {
    id: "ba-1",
    timestamp: "2026-04-17T09:14:02Z",
    tool: "shell.exec",
    input: "rm -rf /var/log/*",
    reason: "Tool not in allowlist; destructive operation rejected by guardrail g-allowlist.",
  },
  {
    id: "ba-2",
    timestamp: "2026-04-17T09:14:08Z",
    tool: "network.fetch",
    input: "https://pastebin.com/raw/exfil",
    reason: "Network egress disabled by guardrail g-no-shell.",
  },
  {
    id: "ba-3",
    timestamp: "2026-04-17T09:15:22Z",
    tool: "timeline.extract",
    input: "{ path: '/etc/shadow' }",
    reason: "Path outside case artifact sandbox; rejected by guardrail g-readonly.",
  },
];

export function getCaseById(id: string): DemoCase | undefined {
  return DEMO_CASES.find((c) => c.id === id);
}

import { DEMO_CASES } from "@/lib/mock-data";
import type { Ioc, TimelineEvent } from "@/lib/types";

export interface TimelineResult {
  events: TimelineEvent[];
  source: string;
  artifactId: string;
  rawReferenceFormat: string;
}

export interface LogParseResult {
  artifactId: string;
  records: Array<{
    id: string;
    timestamp: string;
    level: "info" | "warning" | "error";
    actor: string;
    message: string;
    rawLine: number;
  }>;
  notable: string[];
}

export interface IocResult {
  artifactId: string;
  iocs: Array<Omit<Ioc, "id" | "sourceEvidenceIds">>;
}

export interface SummaryResult {
  artifactId: string;
  summary: string;
  confidence: number;
  keyFacts: string[];
}

type ToolOutput = TimelineResult | LogParseResult | IocResult | SummaryResult;

function findArtifact(artifactId: string) {
  for (const c of DEMO_CASES) {
    const a = c.artifacts.find((x) => x.id === artifactId);
    if (a) return { artifact: a, caseId: c.id };
  }
  return null;
}

const TIMELINE_DATA: Record<string, TimelineResult> = {
  "a1-timeline": {
    artifactId: "a1-timeline",
    source: "MFT",
    rawReferenceFormat: "timeline.csv#L{line}",
    events: [
      {
        id: "t1",
        timestamp: "2026-04-14T02:11:04Z",
        source: "MFT",
        category: "file",
        summary: "C:\\Users\\jdoe\\Documents\\customers_q2.xlsx accessed (read)",
        severity: "medium",
      },
      {
        id: "t2",
        timestamp: "2026-04-14T02:11:09Z",
        source: "MFT",
        category: "file",
        summary: "C:\\ProgramData\\Backups\\stage\\customers_q2.xlsx created",
        severity: "high",
      },
      {
        id: "t3",
        timestamp: "2026-04-14T02:11:14Z",
        source: "MFT",
        category: "process",
        summary: "Process svchost.exe -k BackupHostService spawned under SYSTEM",
        severity: "medium",
      },
      {
        id: "t4",
        timestamp: "2026-04-14T02:12:01Z",
        source: "MFT",
        category: "file",
        summary: "C:\\ProgramData\\Backups\\stage\\archive.7z created (size 1.8MB)",
        severity: "high",
      },
      {
        id: "t5",
        timestamp: "2026-04-14T02:12:33Z",
        source: "MFT",
        category: "file",
        summary: "Archive archive.7z deleted",
        severity: "medium",
      },
    ],
  },
  "a2-edr": {
    artifactId: "a2-edr",
    source: "EDR",
    rawReferenceFormat: "edr.json#/events/{idx}",
    events: [
      {
        id: "e1",
        timestamp: "2026-04-15T14:02:08Z",
        source: "EDR",
        category: "process",
        summary: "powershell.exe -EncodedCommand SQBFAFgAIAAo... spawned by winword.exe",
        severity: "high",
      },
      {
        id: "e2",
        timestamp: "2026-04-15T14:02:11Z",
        source: "EDR",
        category: "process",
        summary: "powershell.exe -> cmd.exe -> rundll32.exe chain detected",
        severity: "high",
      },
      {
        id: "e3",
        timestamp: "2026-04-15T14:02:12Z",
        source: "EDR",
        category: "file",
        summary: "C:\\Users\\finops\\AppData\\Local\\Temp\\upd.ps1 created",
        severity: "high",
      },
      {
        id: "e4",
        timestamp: "2026-04-15T14:02:42Z",
        source: "EDR",
        category: "process",
        summary: "wmic.exe /node:FIN-03 process call create invoked",
        severity: "critical",
      },
    ],
  },
};

const LOG_DATA: Record<string, LogParseResult> = {
  "a1-winlog": {
    artifactId: "a1-winlog",
    records: [
      {
        id: "l1",
        timestamp: "2026-04-14T01:58:02Z",
        level: "info",
        actor: "NT AUTHORITY\\SYSTEM",
        message: "Scheduled task 'BackupSweep' started",
        rawLine: 112,
      },
      {
        id: "l2",
        timestamp: "2026-04-14T02:11:03Z",
        level: "warning",
        actor: "NT AUTHORITY\\SYSTEM",
        message: "BackupSweep spawned svchost.exe (PID 7821)",
        rawLine: 134,
      },
      {
        id: "l3",
        timestamp: "2026-04-14T02:11:04Z",
        level: "warning",
        actor: "NT AUTHORITY\\SYSTEM",
        message: "Impersonated CORP\\jdoe via logon token (4624 type 9)",
        rawLine: 141,
      },
      {
        id: "l4",
        timestamp: "2026-04-13T18:42:11Z",
        level: "info",
        actor: "CORP\\jdoe",
        message: "Interactive logoff from WKS-4471",
        rawLine: 92,
      },
      {
        id: "l5",
        timestamp: "2026-04-14T02:12:40Z",
        level: "info",
        actor: "NT AUTHORITY\\SYSTEM",
        message: "BackupSweep completed with exit code 0",
        rawLine: 188,
      },
    ],
    notable: [
      "jdoe logged off at 18:42 on 2026-04-13 and did not log in again before 02:12 on 2026-04-14",
      "SYSTEM-scheduled task BackupSweep impersonated jdoe's token via logon type 9",
    ],
  },
  "a2-pstx": {
    artifactId: "a2-pstx",
    records: [
      {
        id: "p1",
        timestamp: "2026-04-15T14:02:08Z",
        level: "info",
        actor: "FINOPS\\svc_finapp",
        message: "powershell.exe -EncodedCommand <base64 length 1422>",
        rawLine: 221,
      },
      {
        id: "p2",
        timestamp: "2026-04-15T14:02:09Z",
        level: "warning",
        actor: "FINOPS\\svc_finapp",
        message: "DownloadString http://cdn-fin.updates-office[.]co/ps1",
        rawLine: 228,
      },
      {
        id: "p3",
        timestamp: "2026-04-15T14:02:10Z",
        level: "info",
        actor: "FINOPS\\svc_finapp",
        message: "IEX $payload  # inline execute of downloaded script",
        rawLine: 231,
      },
      {
        id: "p4",
        timestamp: "2026-04-15T14:02:15Z",
        level: "warning",
        actor: "FINOPS\\svc_finapp",
        message: "Invoke-WMIMethod -ComputerName FIN-03 -Name Create",
        rawLine: 239,
      },
    ],
    notable: [
      "Base64 encoded command observed in PowerShell invocation",
      "Outbound call to updates-office[.]co (typosquat domain) preceded inline execute",
    ],
  },
};

const IOC_DATA: Record<string, IocResult> = {
  "a1-sched": {
    artifactId: "a1-sched",
    iocs: [
      {
        type: "process",
        value: "BackupSweep (scheduled task, NT AUTHORITY\\SYSTEM)",
        confidence: 0.92,
        note: "Task registered 2026-04-10, runs daily 02:11 UTC",
      },
      {
        type: "file_path",
        value: "C:\\ProgramData\\Backups\\stage\\",
        confidence: 0.88,
        note: "Staging directory created by task",
      },
      {
        type: "user",
        value: "NT AUTHORITY\\SYSTEM",
        confidence: 0.99,
        note: "Task principal, not jdoe",
      },
    ],
  },
  "a1-netflow": {
    artifactId: "a1-netflow",
    iocs: [
      {
        type: "ip",
        value: "10.12.4.88",
        confidence: 0.6,
        note: "Internal backup relay; outbound only to internal subnet",
      },
    ],
  },
  "a2-dns": {
    artifactId: "a2-dns",
    iocs: [
      {
        type: "domain",
        value: "updates-office[.]co",
        confidence: 0.94,
        note: "Typosquat of legitimate Microsoft update domain",
      },
      {
        type: "ip",
        value: "185.22.67.41",
        confidence: 0.85,
        note: "Resolved by updates-office[.]co, in known bulletproof hoster range",
      },
      {
        type: "hash",
        value: "sha256:7ff3a1b4c8...de29",
        confidence: 0.76,
        note: "Hash of downloaded PS1 payload",
      },
    ],
  },
};

const SUMMARY_DATA: Record<string, SummaryResult> = {
  "a1-timeline": {
    artifactId: "a1-timeline",
    summary:
      "MFT timeline shows an off-hours burst of file access and staging at 02:11 UTC, attributed at the filesystem layer to jdoe's home directory but with processes under SYSTEM.",
    confidence: 0.82,
    keyFacts: [
      "Peak activity at 2026-04-14T02:11Z",
      "Files staged in C:\\ProgramData\\Backups\\stage\\",
      "Staging archive deleted after creation",
    ],
  },
  "a1-winlog": {
    artifactId: "a1-winlog",
    summary:
      "Security log correlates the 02:11Z activity with scheduled task BackupSweep running as SYSTEM and impersonating jdoe's stored token.",
    confidence: 0.91,
    keyFacts: [
      "jdoe logged off 2026-04-13T18:42Z and did not return",
      "Logon type 9 token impersonation by SYSTEM service",
    ],
  },
  "a1-sched": {
    artifactId: "a1-sched",
    summary:
      "Task Scheduler artifact confirms 'BackupSweep' task scheduled by admin account three days prior. Task principal is SYSTEM.",
    confidence: 0.95,
    keyFacts: [
      "Task name: BackupSweep",
      "Registered 2026-04-10, no recent modifications",
      "Triggers daily 02:11 UTC",
    ],
  },
  "a1-netflow": {
    artifactId: "a1-netflow",
    summary:
      "Netflow shows only internal traffic to 10.12.4.88 during the incident window. No external exfiltration observed.",
    confidence: 0.87,
    keyFacts: ["No outbound WAN traffic during event window"],
  },
  "a2-pstx": {
    artifactId: "a2-pstx",
    summary:
      "PowerShell transcript is short but contains encoded command, external download, and Invoke-WMIMethod targeting FIN-03.",
    confidence: 0.9,
    keyFacts: [
      "EncodedCommand usage",
      "DownloadString to updates-office[.]co",
      "Invoke-WMIMethod to FIN-03",
    ],
  },
  "a2-edr": {
    artifactId: "a2-edr",
    summary:
      "EDR process timeline shows winword.exe -> powershell.exe -> cmd.exe -> rundll32.exe chain consistent with phishing-driven execution.",
    confidence: 0.93,
    keyFacts: [
      "Parent is winword.exe (document-borne)",
      "rundll32.exe invoked after encoded PS",
      "wmic.exe lateral call to FIN-03",
    ],
  },
  "a2-dns": {
    artifactId: "a2-dns",
    summary:
      "DNS log shows resolution of typosquat domain updates-office[.]co immediately preceding the outbound DownloadString.",
    confidence: 0.89,
    keyFacts: [
      "updates-office[.]co resolves to 185.22.67.41",
      "No legitimate parent company reference",
    ],
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runMockTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<{ ok: true; output: ToolOutput; durationMs: number } | { ok: false; error: string }> {
  const started = Date.now();
  await delay(180 + Math.random() * 280);

  const artifactId = String(input.artifactId || "");
  const located = findArtifact(artifactId);
  if (!located) {
    return { ok: false, error: `Unknown artifactId '${artifactId}'` };
  }

  switch (toolName) {
    case "timeline.extract": {
      const data = TIMELINE_DATA[artifactId];
      if (!data) {
        return {
          ok: false,
          error: `Artifact '${artifactId}' is not a timeline-compatible source`,
        };
      }
      return { ok: true, output: data, durationMs: Date.now() - started };
    }
    case "log.parse": {
      const data = LOG_DATA[artifactId];
      if (!data) {
        return { ok: false, error: `Artifact '${artifactId}' is not log-compatible` };
      }
      return { ok: true, output: data, durationMs: Date.now() - started };
    }
    case "ioc.extract": {
      const data = IOC_DATA[artifactId];
      if (!data) {
        return { ok: true, output: { artifactId, iocs: [] }, durationMs: Date.now() - started };
      }
      return { ok: true, output: data, durationMs: Date.now() - started };
    }
    case "artifact.summarize": {
      const data = SUMMARY_DATA[artifactId];
      if (!data) {
        return {
          ok: true,
          output: {
            artifactId,
            summary: "No summarizable content detected.",
            confidence: 0.3,
            keyFacts: [],
          },
          durationMs: Date.now() - started,
        };
      }
      return { ok: true, output: data, durationMs: Date.now() - started };
    }
    default:
      return { ok: false, error: `Tool '${toolName}' not implemented` };
  }
}

"""Python-side fixtures (mirrors src/lib/mcp/mock-server.ts)."""

from __future__ import annotations

TIMELINE_DATA = {
    "a1-timeline": {
        "artifactId": "a1-timeline",
        "source": "MFT",
        "events": [
            {
                "id": "t1",
                "timestamp": "2026-04-14T02:11:04Z",
                "source": "MFT",
                "category": "file",
                "summary": "customers_q2.xlsx accessed (read) from jdoe home",
                "severity": "medium",
            },
            {
                "id": "t2",
                "timestamp": "2026-04-14T02:11:09Z",
                "source": "MFT",
                "category": "file",
                "summary": "C:/ProgramData/Backups/stage/customers_q2.xlsx created",
                "severity": "high",
            },
        ],
    }
}

LOG_DATA = {
    "a1-winlog": {
        "artifactId": "a1-winlog",
        "records": [
            {
                "id": "l1",
                "timestamp": "2026-04-14T01:58:02Z",
                "level": "info",
                "actor": "NT AUTHORITY\\SYSTEM",
                "message": "Scheduled task 'BackupSweep' started",
                "rawLine": 112,
            }
        ],
        "notable": ["jdoe was not logged in during the incident window"],
    }
}

IOC_DATA = {
    "a1-sched": {
        "artifactId": "a1-sched",
        "iocs": [
            {
                "type": "process",
                "value": "BackupSweep (scheduled task, SYSTEM)",
                "confidence": 0.92,
            }
        ],
    }
}

SUMMARY_DATA = {
    "a1-sched": {
        "artifactId": "a1-sched",
        "summary": "Task Scheduler artifact confirms BackupSweep task scheduled by admin.",
        "confidence": 0.95,
        "keyFacts": ["Task name: BackupSweep", "Principal: SYSTEM"],
    }
}

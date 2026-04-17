"""Backend-side mirror of bundled demo cases used by the Python MCP server."""

from __future__ import annotations

DEMO_CASES = [
    {
        "id": "incident-01",
        "name": "Phantom Insider - Workstation WKS-4471",
        "severity": "high",
        "tags": ["false lead", "timeline-heavy", "log correlation"],
    },
    {
        "id": "incident-02",
        "name": "Lateral Whisper - Finance Subnet",
        "severity": "critical",
        "tags": ["timeline-heavy", "log correlation"],
    },
]

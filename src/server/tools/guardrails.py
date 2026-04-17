from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List


ALLOWED_TOOLS: List[Dict[str, Any]] = [
    {
        "name": "timeline.extract",
        "description": "Extract a normalized timeline from a timeline-like artifact.",
        "safety_level": "read-only",
    },
    {
        "name": "log.parse",
        "description": "Parse a log artifact into structured records.",
        "safety_level": "read-only",
    },
    {
        "name": "ioc.extract",
        "description": "Extract indicators of compromise.",
        "safety_level": "read-only",
    },
    {
        "name": "artifact.summarize",
        "description": "High-level summary of an artifact.",
        "safety_level": "safe",
    },
]


@dataclass
class CheckResult:
    ok: bool
    reason: str = ""


def allowed_tools() -> List[Dict[str, Any]]:
    return ALLOWED_TOOLS


def check(tool_name: str, _input: Dict[str, Any]) -> CheckResult:
    if not any(t["name"] == tool_name for t in ALLOWED_TOOLS):
        return CheckResult(ok=False, reason=f"Tool '{tool_name}' not in allowlist")
    if "artifactId" not in _input:
        return CheckResult(ok=False, reason="Missing required field 'artifactId'")
    return CheckResult(ok=True)

from __future__ import annotations

from typing import Any, Dict, List


def normalize(tool_name: str, output: Dict[str, Any]) -> List[Dict[str, Any]]:
    evidence: List[Dict[str, Any]] = []
    if tool_name == "timeline.extract":
        for e in output.get("events", []):
            evidence.append(
                {
                    "category": e.get("category", "timeline"),
                    "claim": e.get("summary", ""),
                    "rawReference": f"{output.get('artifactId')}#{e.get('id')}",
                    "confidence": 0.8,
                    "sourceTimestamp": e.get("timestamp"),
                }
            )
    elif tool_name == "log.parse":
        for r in output.get("records", []):
            evidence.append(
                {
                    "category": "log",
                    "claim": f"{r.get('actor')}: {r.get('message')}",
                    "rawReference": f"{output.get('artifactId')}#L{r.get('rawLine', r.get('raw_line'))}",
                    "confidence": 0.85,
                    "sourceTimestamp": r.get("timestamp"),
                }
            )
    elif tool_name == "ioc.extract":
        for i in output.get("iocs", []):
            evidence.append(
                {
                    "category": "ioc",
                    "claim": f"IOC ({i.get('type')}): {i.get('value')}",
                    "rawReference": f"{output.get('artifactId')}#ioc/{i.get('type')}",
                    "confidence": i.get("confidence", 0.6),
                }
            )
    elif tool_name == "artifact.summarize":
        evidence.append(
            {
                "category": "summary",
                "claim": output.get("summary", ""),
                "rawReference": f"{output.get('artifactId')}#summary",
                "confidence": output.get("confidence", 0.5),
            }
        )
    return evidence

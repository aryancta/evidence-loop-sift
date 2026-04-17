from __future__ import annotations

from typing import Any, Dict

from ..data.demo_artifacts import SUMMARY_DATA


def run(payload: Dict[str, Any]) -> Dict[str, Any]:
    artifact_id = payload.get("artifactId")
    return SUMMARY_DATA.get(
        artifact_id,
        {"artifactId": artifact_id, "summary": "No summarizable content.", "confidence": 0.3, "keyFacts": []},
    )

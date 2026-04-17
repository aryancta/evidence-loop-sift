from __future__ import annotations

from typing import Any, Dict

from ..data.demo_artifacts import TIMELINE_DATA


def run(payload: Dict[str, Any]) -> Dict[str, Any]:
    artifact_id = payload.get("artifactId")
    if artifact_id not in TIMELINE_DATA:
        return {"artifactId": artifact_id, "events": []}
    return TIMELINE_DATA[artifact_id]

from __future__ import annotations

from typing import Any, Dict

from ..data.demo_artifacts import IOC_DATA


def run(payload: Dict[str, Any]) -> Dict[str, Any]:
    artifact_id = payload.get("artifactId")
    return IOC_DATA.get(artifact_id, {"artifactId": artifact_id, "iocs": []})

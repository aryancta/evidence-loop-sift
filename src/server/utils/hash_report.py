from __future__ import annotations

import hashlib
import json
from typing import Any


def sign_report(report: Any) -> str:
    payload = json.dumps(report, sort_keys=True, default=str).encode("utf-8")
    return "sha256:" + hashlib.sha256(payload).hexdigest()

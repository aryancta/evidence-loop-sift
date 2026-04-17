from __future__ import annotations

import json
from typing import Any


def safe_json_dumps(value: Any) -> str:
    try:
        return json.dumps(value, default=str, ensure_ascii=False)
    except Exception as exc:  # noqa: BLE001
        return json.dumps({"error": "unserializable", "detail": str(exc)})

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class TimelineEvent(BaseModel):
    id: str
    timestamp: str
    source: str
    category: str
    summary: str
    severity: str


class LogRecord(BaseModel):
    id: str
    timestamp: str
    level: str
    actor: str
    message: str
    raw_line: int


class Ioc(BaseModel):
    type: str
    value: str
    confidence: float
    note: Optional[str] = None


class Summary(BaseModel):
    artifact_id: str
    summary: str
    confidence: float
    key_facts: List[str] = []

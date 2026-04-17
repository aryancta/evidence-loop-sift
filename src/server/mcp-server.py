"""FastAPI-based MCP-compatible server exposing safe, typed DFIR tools.

NOTE: The production demo in this hackathon build runs the agent loop in the
Next.js process for single-container simplicity. This file mirrors the server
contract so it can be swapped in without changing the front end.
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .tools import (
    artifact_summarizer,
    evidence_normalizer,
    guardrails,
    ioc_extractor,
    log_parser,
    timeline,
)

app = FastAPI(title="EvidenceLoop SIFT MCP Server", version="0.1.0")


class ToolCall(BaseModel):
    tool: str
    input: dict


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/tools")
def list_tools() -> dict:
    return {"tools": guardrails.allowed_tools()}


@app.post("/call")
def call_tool(payload: ToolCall) -> dict:
    allowed = guardrails.check(payload.tool, payload.input)
    if not allowed.ok:
        raise HTTPException(status_code=400, detail=allowed.reason)

    if payload.tool == "timeline.extract":
        out = timeline.run(payload.input)
    elif payload.tool == "log.parse":
        out = log_parser.run(payload.input)
    elif payload.tool == "ioc.extract":
        out = ioc_extractor.run(payload.input)
    elif payload.tool == "artifact.summarize":
        out = artifact_summarizer.run(payload.input)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown tool '{payload.tool}'")

    return {"tool": payload.tool, "output": out, "evidence": evidence_normalizer.normalize(payload.tool, out)}

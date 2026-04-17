# EvidenceLoop SIFT

> Autonomous DFIR triage with **evidence-first reasoning** and **auditable self-correction**.

EvidenceLoop SIFT is a narrow but polished workflow for endpoint incident triage. It wraps a typed MCP tool surface in a LangGraph-style agent loop that plans, executes, verifies, contradicts itself when evidence disagrees, and produces an analyst-ready report where **every claim cites a concrete evidence object and tool run**.

It is designed to be trustworthy first:

- No external API keys. All cases use bundled fixtures.
- No shell, no fetch, no mutation. Only typed MCP tools run.
- Every hypothesis tracks supporting and contradicting evidence with confidence.
- Every report ships with a signed sha256 and a citation index.

---

## What is the "evidence-first" innovation?

Most AI copilots summarize tool output and present conclusions as flat text. EvidenceLoop SIFT is different:

1. **The hypothesis ledger is a first-class object.** Hypotheses carry status (`tentative` / `confirmed` / `contradicted` / `rejected`) and a live confidence score. Evidence either supports or contradicts them.
2. **Contradiction is an explicit state.** When new evidence invalidates a claim, the agent transitions into a `contradict` state, downgrades the hypothesis, logs a `Contradiction` row, and replans its next steps.
3. **The final report is traceable, not trustworthy-by-vibes.** Each finding, hypothesis, and timeline entry in the report links to a `Citation` pill whose underlying evidence object points back to a tool run ID, raw reference, and confidence.

The net effect: a responder can read the report in one minute, click any claim to see its exact source, and replay the entire investigation.

---

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn-style primitives on Radix, Lucide, Recharts, Zod.
- **Backend:** Next.js route handlers (Node runtime), SQLite via Prisma, Server-Sent Events for the live agent stream, an in-process agent run loop.
- **MCP layer:** A typed tool surface in `src/lib/mcp/*` with Zod-validated inputs and guardrail enforcement at the call site. A mirror Python FastAPI MCP server is provided in `src/server/` for parity with a real MCP deployment.

---

## Quick start

```bash
npm install
npm run build      # generates Prisma client, pushes the SQLite schema, seeds, then builds Next.js
npm start          # serves on :3000
```

Or, even simpler — use the provided Dockerfile:

```bash
docker build -t evidence-loop-sift .
docker run --rm -p 3000:3000 evidence-loop-sift
```

Then open <http://localhost:3000>, pick a case from the library, and hit **Start Investigation**.

---

## Demo flow (2 minutes)

1. Visit **/dashboard**. The default case is "Phantom Insider - Workstation WKS-4471".
2. Click **Start Investigation**.
3. Watch the state machine step through `intake → plan → execute → verify`.
4. Within ~10 seconds the verifier fires the **contradiction** state: the `jdoe insider` hypothesis is rejected because Security.evtx shows jdoe logged off hours earlier and the 02:11Z file access ran under `NT AUTHORITY\SYSTEM` via scheduled task `BackupSweep`.
5. The agent replans, confirms the scheduled-task hypothesis, and moves into `report`.
6. Open **/report/incident-01** to see the signed report with citation pills on every claim.

Then go back to **/cases** and pick **Lateral Whisper - Finance Subnet** for a correlation-heavy run where `benign PowerShell` is rejected and `document-borne lateral movement` is confirmed.

---

## Project structure

```
src/
  app/                       App Router pages + API routes
    api/
      cases/                 GET /api/cases, GET /api/cases/:id
      investigate/           start, :runId, pause, resume, replay, stream (SSE)
      reports/:caseId        latest signed report for a case
      audit                  append-only audit trail
      guardrails             allowed tools + validation rules + blocked actions
    dashboard/               investigation workspace (state machine, ledger, feed, timeline)
    cases/                   bundled demo cases
    report/[caseId]/         final report with citation pills + export
    admin/guardrails/        guardrails + audit page
  components/                shadcn-style UI + feature components
  lib/
    agent/                   state machine, planner, verifier, replanner, run loop
    mcp/                     typed tool schemas, guardrails, mock MCP server
    mock-data.ts             bundled demo cases, artifacts, guardrail rules
    evidence.ts              tool output → Evidence normalization
    hypothesis-engine.ts     seed hypotheses
    report-builder.ts        final report + sha256 signing
    audit.ts                 global append-only audit
  server/                    Python FastAPI MCP server (parity surface)
prisma/
  schema.prisma              SQLite schema
  seed.ts                    demo case + guardrail rule seeder
public/demo-cases/           JSON fixtures for the bundled cases
```

---

## Guardrails (safety model)

Guardrails are enforced in **code**, not in prompts:

- `checkToolCall()` in `src/lib/mcp/guardrails.ts` runs before every tool dispatch. Unknown tool names and invalid inputs never reach the handler.
- The MCP tool surface in `src/lib/mcp/tools.ts` is small on purpose — four typed read-only operations. No shell, no network, no filesystem writes.
- The `/admin/guardrails` page exposes the live allowlist, the validation rules, and a sample log of blocked actions for judges to inspect.
- The agent loop intentionally pushes a **disallowed step** into every plan so you can see it get blocked at runtime. Look for the red `blocked` badge in the plan stepper.

---

## API summary

| Method | Path                                      | Description |
| ------ | ----------------------------------------- | ----------- |
| GET    | `/api/cases`                              | List bundled demo cases |
| GET    | `/api/cases/:caseId`                      | Full case incl. artifact inventory |
| POST   | `/api/investigate/start`                  | Start an autonomous run |
| GET    | `/api/investigate/:runId`                 | Snapshot of a run |
| GET    | `/api/investigate/:runId/stream`          | SSE stream of live events |
| POST   | `/api/investigate/:runId/pause`           | Pause an active run |
| POST   | `/api/investigate/:runId/resume`          | Resume a paused run |
| POST   | `/api/investigate/:runId/replay`          | Return stored events to replay |
| GET    | `/api/reports/:caseId`                    | Latest signed report for the case |
| GET    | `/api/audit`                              | Append-only audit trail |
| GET    | `/api/guardrails`                         | Allowed tools + rules + blocked actions |

All endpoints return JSON except the SSE stream.

---

## Screenshots

Placeholder — drop screenshots in `public/screenshots/` and reference them here.

- `docs/screenshots/dashboard.png`
- `docs/screenshots/contradiction.png`
- `docs/screenshots/report.png`

---

## Credits

Built for a hackathon by **Aryan Choudhary** (<aryancta@gmail.com>). Guardrail and state-machine design inspired by MCP, LangGraph, and DFIR tradecraft that refuses to trust unsupported claims.

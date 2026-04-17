"use client";

import { Pause, Play, RotateCcw, SquareArrowOutUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RunSnapshot } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export function DemoControls({
  snapshot,
  onStart,
  onPause,
  onResume,
  onReplay,
  starting,
}: {
  snapshot: RunSnapshot | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReplay: () => void;
  starting?: boolean;
}) {
  const state = snapshot?.state;
  const running = state && !["complete", "paused", "failed"].includes(state);
  const complete = state === "complete";

  return (
    <div className="card-surface flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 md:flex-1">
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Progress</div>
          <div className="text-xs font-mono">{snapshot?.progress ?? 0}%</div>
        </div>
        <Progress value={snapshot?.progress ?? 0} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {snapshot?.currentStep ?? "Idle — no active run"}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!running && !complete && (
          <Button variant="cyan" onClick={onStart} disabled={starting} className="gap-2">
            <Play className="h-4 w-4" />
            {starting ? "Starting…" : "Start Investigation"}
          </Button>
        )}
        {running && state !== "paused" && (
          <Button variant="outline" onClick={onPause} className="gap-2">
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        {state === "paused" && (
          <Button variant="cyan" onClick={onResume} className="gap-2">
            <Play className="h-4 w-4" /> Resume
          </Button>
        )}
        {complete && (
          <>
            <Button variant="outline" onClick={onReplay} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Replay
            </Button>
            <Button asChild variant="cyan" className="gap-2">
              <Link href={`/report/${snapshot?.caseId}`}>
                <SquareArrowOutUpRight className="h-4 w-4" /> View report
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
